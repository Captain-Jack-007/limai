import { NextRequest, NextResponse } from 'next/server';
import { extractFileText } from '@/lib/extractFileText';
import { generateFullReport } from '@/lib/report-engine';

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
      projectInfo = JSON.parse(piRaw as string);
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

    // ── Run multi-agent report engine ─────────────────────────────────────────
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 1200000);

    let result: Awaited<ReturnType<typeof generateFullReport>>;
    try {
      result = await generateFullReport(summary, rawFileText, name || undefined);
    } finally {
      clearTimeout(tid);
    }

    const allWarnings = [...fileWarnings, ...result.warnings];

    return NextResponse.json({
      content: result.content,
      projectName: result.projectName,
      warnings: allWarnings,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: '请求超时（超过20分钟），请重试' }, { status: 408 });
    }
    console.error('generate-full-report error:', err);
    const msg = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: '研报生成失败：' + msg }, { status: 500 });
  }
}
