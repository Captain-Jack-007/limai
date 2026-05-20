import { NextRequest, NextResponse } from 'next/server';
import { extractFileText } from '@/lib/extractFileText';
import { runChapterPhases } from '@/lib/report-engine';
import { tagSources, buildSkepticAppendix } from '@/lib/source-tagger';
import { runEditorPipeline } from '@/lib/editor-pipeline';
import { runSkepticReview, runCrossChapterCheck } from '@/lib/skeptic-pipeline';
import { CHAPTER_CONFIG } from '@/lib/prompts/chapter-writers';
import type { Claim, SkepticContradiction, SkepticDissent, EditorReport, SkepticReport } from '@/lib/types';

export const maxDuration = 600;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} 超时(${ms}ms)`)), ms),
    ),
  ]);
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '服务配置错误' }, { status: 500 });
    }

    // ── Parse request ─────────────────────────────────────────────────────────
    let projectInfo: Record<string, string>;
    let uploadedFiles: File[] = [];

    const contentType = req.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const piRaw = form.get('projectInfo');
      if (!piRaw) return NextResponse.json({ error: '参数缺失' }, { status: 400 });
      try {
        projectInfo = JSON.parse(piRaw as string);
      } catch {
        return NextResponse.json({ error: 'projectInfo 不是合法 JSON' }, { status: 400 });
      }
      uploadedFiles = form.getAll('files') as File[];
    } else {
      const body = await req.json();
      projectInfo = body.projectInfo;
    }

    if (!projectInfo) {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 });
    }

    const summary = projectInfo.summary?.trim() || '';
    const name = projectInfo.name?.trim() || '';

    if (!summary && uploadedFiles.length === 0) {
      return NextResponse.json({ error: '请输入项目描述或上传文件' }, { status: 400 });
    }

    // ── Extract file texts ────────────────────────────────────────────────────
    const fileResults = await Promise.all(uploadedFiles.slice(0, 5).map(extractFileText));
    const fileWarnings = fileResults.filter((r) => r.warn).map((r) => r.warn as string);
    const rawFileText =
      fileResults
        .filter((r) => r.text.trim())
        .map((r) => r.text)
        .join('\n\n') || null;

    // ── Phases 1-3: Intake → Search → Chapter Writers ─────────────────────────
    let phases: Awaited<ReturnType<typeof runChapterPhases>>;
    try {
      phases = await withTimeout(
        runChapterPhases(summary, rawFileText, name || undefined),
        540000,
        'Phase 3 章节生成',
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      if (msg.includes('超时')) {
        return NextResponse.json(
          { error: '研报生成超时，请简化项目描述后重试', detail: msg },
          { status: 408 },
        );
      }
      throw err;
    }

    const { chapterResults, evidencePool, finalProjectName, warnings: phaseWarnings } = phases;
    const allWarnings = [...fileWarnings, ...phaseWarnings];
    const allEvidence = evidencePool.all();

    console.log('[Phase 3] 完成: chapterResults=', chapterResults.length, '章');
    chapterResults.forEach((ch) => {
      console.log(`  ch${ch.index}: body=${ch.body?.length ?? 0}, claims=${ch.claims?.length ?? 0}`);
    });

    // ── Phase 5a: Per-chapter Skeptic review (parallel, fault-tolerant) ───────
    console.log('[Phase 5a] 开始逐章 Skeptic 审查，共', chapterResults.length, '章');
    const perChapterSettled = await Promise.allSettled(
      chapterResults.map((ch) =>
        runSkepticReview({
          chapterIndex: ch.index,
          chapterBody: ch.body,
          claims: ch.claims,
          evidence: allEvidence,
        }),
      ),
    );

    const perChapterReports: (SkepticReport | null)[] = perChapterSettled.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      console.warn(`[Phase 5a] Chapter ${chapterResults[i].index} Skeptic 失败:`, r.reason);
      return null;
    });
    console.log('[Phase 5a] 完成');

    const allReviewedClaims: Claim[] = perChapterReports.flatMap((r) => r?.claims ?? []);
    const allDissents: SkepticDissent[] = perChapterReports.flatMap((r) => r?.dissents ?? []);
    const allUnsupported: string[] = perChapterReports.flatMap((r) => r?.unsupportedClaims ?? []);

    // Chapters with no Skeptic result fall back to their original (unrated) claims
    const reviewedClaimIds = new Set(allReviewedClaims.map((c) => c.id));
    for (const ch of chapterResults) {
      for (const c of ch.claims) {
        if (!reviewedClaimIds.has(c.id)) allReviewedClaims.push(c);
      }
    }

    // ── Phase 5b: Cross-chapter contradiction detection ───────────────────────
    console.log('[Phase 5b] 开始跨章节矛盾检测');
    let contradictions: SkepticContradiction[] = [];
    try {
      const crossResult = await runCrossChapterCheck({
        claims: allReviewedClaims,
        evidence: allEvidence,
      });
      contradictions = crossResult.contradictions;
    } catch (e) {
      console.warn('[Phase 5b] 跨章节矛盾检测失败:', e);
    }
    console.log('[Phase 5b] 完成，矛盾数:', contradictions.length);

    if (contradictions.length > 0) {
      allWarnings.push(`检测到 ${contradictions.length} 处跨章节矛盾，详见附录`);
    }

    // ── Phase 6: Editor Pipeline (direct function call, no HTTP) ─────────────
    let editorReport: EditorReport | null = null;
    let editorMarkdown: string | null = null;

    try {
      editorReport = await runEditorPipeline({
        chapterBodies: chapterResults.map((ch) => ch.body),
        claims: allReviewedClaims,
        evidence: allEvidence,
        dissents: allDissents,
      });
      editorMarkdown = editorReport.finalMarkdown;
      console.log('[Phase 6] 完成，统计:', editorReport.stats);
    } catch (err) {
      console.warn('[Phase 6] Editor 异常，降级到 Phase 5 输出:', err);
    }

    if (editorReport?.stats.skippedSteps.length) {
      allWarnings.push(`Editor 跳过步骤: ${editorReport.stats.skippedSteps.join(', ')}`);
    }
    if (!editorMarkdown) {
      allWarnings.push('Editor 阶段失败，使用 Phase 5 降级输出');
    }

    // ── Skeptic summary + appendix ────────────────────────────────────────────
    const skepticSummary = {
      total: allReviewedClaims.length,
      high: allReviewedClaims.filter((c) => c.confidence === 'high').length,
      medium: allReviewedClaims.filter((c) => c.confidence === 'medium').length,
      low: allReviewedClaims.filter((c) => c.confidence === 'low').length,
      disputed: allReviewedClaims.filter((c) => c.confidence === 'disputed').length,
    };

    const appendix = buildSkepticAppendix(
      contradictions,
      allDissents,
      allUnsupported,
      allReviewedClaims,
      skepticSummary,
    );

    // ── Build cover + TOC ─────────────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const cover =
      '# ' + finalProjectName + ' 深度调研报告\n\n' +
      '> 项目深度调研报告 | ' + today + ' | 共十章';

    const toc =
      '## 目录\n\n' +
      CHAPTER_CONFIG.flatMap((g) => g.chapters)
        .map((ch) => '- 第' + ch.num + '章 ' + ch.title)
        .join('\n') +
      '\n- 附录：可信度审查报告';

    // ── Assemble final content ────────────────────────────────────────────────
    let finalContent: string;
    if (editorMarkdown) {
      finalContent = [cover, toc, editorMarkdown, appendix].join('\n\n---\n\n');
    } else {
      const claimsByChapter = new Map<number, Claim[]>();
      for (const c of allReviewedClaims) {
        const arr = claimsByChapter.get(c.chapter) ?? [];
        arr.push(c);
        claimsByChapter.set(c.chapter, arr);
      }
      const taggedBodies = chapterResults.map((ch) =>
        tagSources(ch.body, claimsByChapter.get(ch.index) ?? [], allEvidence),
      );
      finalContent = [cover, toc, ...taggedBodies, appendix].join('\n\n---\n\n');
    }

    return NextResponse.json({
      content: finalContent,
      projectName: finalProjectName,
      warnings: allWarnings,
      skepticSummary,
      editorStats: editorReport?.stats ?? null,
      evidenceCount: allEvidence.length,
    });
  } catch (err: unknown) {
    console.error('generate-full-report error:', err);
    const msg = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: '研报生成失败：' + msg }, { status: 500 });
  }
}
