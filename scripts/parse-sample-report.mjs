// Run once: node scripts/parse-sample-report.mjs
// Converts the sample docx into lib/sample-report.json

import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const docxPath = path.join(
  __dirname,
  '../public/Sci-bridge赛乔：链接科学家与技术经理人的ai智能体科技转化评估研究报告.docx'
);

const result = await mammoth.convertToHtml({ path: docxPath });
const html = result.value;

// ── Extract meta (title + date from leading <p> tags before first h1) ────────
const firstH1 = html.indexOf('<h1>');
const preH1 = html.slice(0, firstH1);
const metaParas = [...preH1.matchAll(/<p>(.*?)<\/p>/g)].map((m) =>
  m[1].replace(/<[^>]+>/g, '').trim()
);

const meta = {
  title: metaParas[0] || 'Sci-bridge赛乔科技转化评估研究报告',
  date: metaParas[1] || '',
};

// ── Split content into chapters by <h1> ───────────────────────────────────────
// Pattern: both <h1><strong>...</strong></h1> and plain <h1>...</h1>
const chapterRe = /<h1>(?:<strong>)?(.*?)(?:<\/strong>)?<\/h1>/g;
const splits = [];
let match;
while ((match = chapterRe.exec(html)) !== null) {
  splits.push({ index: match.index, title: match[1].replace(/<[^>]+>/g, '').trim(), end: match.index + match[0].length });
}

const chapters = splits.map((s, i) => {
  const contentStart = s.end;
  const contentEnd = i + 1 < splits.length ? splits[i + 1].index : html.length;
  const rawHtml = html.slice(contentStart, contentEnd).trim();

  const num = s.title.match(/^(第[一二三四五六七八九十百]+章|参考文献)/)?.[0] || '';
  const shortTitle = num ? s.title.replace(num, '').trim() : s.title;
  const id = `ch-${i + 1}`;

  return { id, num, shortTitle, title: s.title, html: rawHtml };
});

const out = { meta, chapters };

const outPath = path.join(__dirname, '../lib/sample-report.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');

console.log(`✓ Parsed ${chapters.length} chapters → lib/sample-report.json`);
chapters.forEach((c) =>
  console.log(`  ${c.id}  ${c.title}  (${c.html.length} chars)`)
);
