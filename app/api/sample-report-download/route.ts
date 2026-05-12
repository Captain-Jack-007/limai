import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    'public',
    'Sci-bridge赛乔：链接科学家与技术经理人的ai智能体科技转化评估研究报告.docx'
  );

  try {
    const buf = fs.readFileSync(filePath);
    return new NextResponse(buf, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition':
          "attachment; filename*=UTF-8''%E8%B5%9B%E4%B9%94AI%E7%A7%91%E6%8A%80%E8%BD%AC%E5%8C%96%E8%AF%84%E4%BC%B0%E7%A0%94%E7%A9%B6%E6%8A%A5%E5%91%8A.docx",
      },
    });
  } catch {
    return NextResponse.json({ error: '文件不存在' }, { status: 404 });
  }
}
