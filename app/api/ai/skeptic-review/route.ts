import { NextRequest, NextResponse } from 'next/server';
import { runSkepticReview } from '@/lib/skeptic-pipeline';

export const maxDuration = 600;

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();
    const report = await runSkepticReview(input);
    return NextResponse.json(report);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
