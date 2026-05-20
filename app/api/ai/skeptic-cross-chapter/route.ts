import { NextRequest, NextResponse } from 'next/server';
import { runCrossChapterCheck } from '@/lib/skeptic-pipeline';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();
    const result = await runCrossChapterCheck(input);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '未知错误';
    console.error('skeptic-cross-chapter error:', msg);
    return NextResponse.json({ contradictions: [] });
  }
}
