import { NextRequest, NextResponse } from 'next/server';
import { extractFileText } from '@/lib/extractFileText';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: '没有收到文件' }, { status: 400 });
    }
    const result = await extractFileText(file);
    return NextResponse.json({ text: result.text, warn: result.warn ?? null });
  } catch (err) {
    console.error('extract-text error:', err);
    return NextResponse.json({ error: '文件解析失败，请稍后重试' }, { status: 500 });
  }
}
