import { NextRequest, NextResponse } from 'next/server';
import { runEditorPipeline, type EditorInput } from '@/lib/editor-pipeline';

export const maxDuration = 600;

export async function POST(req: NextRequest) {
  try {
    const input = (await req.json()) as EditorInput;
    if (!input.chapterBodies || input.chapterBodies.length === 0) {
      return NextResponse.json({ error: 'chapterBodies 参数缺失' }, { status: 400 });
    }
    const report = await runEditorPipeline(input);
    return NextResponse.json(report);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
