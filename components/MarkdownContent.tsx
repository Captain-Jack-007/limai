'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

function makeComponents(dark: boolean): Components {
  const clr = {
    h1: dark ? 'text-white' : 'text-slate-900',
    h2: dark ? 'text-white/90' : 'text-slate-800',
    h3: dark ? 'text-white/85' : 'text-slate-800',
    h4: dark ? 'text-white/80' : 'text-slate-700',
    border: dark ? 'border-white/10' : 'border-slate-200',
    p: dark ? 'text-white/80' : 'text-slate-700',
    strong: dark ? 'text-white' : 'text-slate-900',
    em: dark ? 'text-white/80' : 'text-slate-700',
    list: dark ? 'text-white/80' : 'text-slate-700',
    dot: dark ? 'text-white/30' : 'text-brand-500',
    bq: dark
      ? 'border-white/30 bg-white/[0.04] text-white/60'
      : 'border-brand-300 bg-brand-50 text-slate-600',
    preCode: dark ? 'bg-white/[0.06] text-white/90 border border-white/[0.1]' : 'bg-slate-900 text-slate-100',
    inlineCode: dark ? 'bg-white/[0.08] text-white/80' : 'bg-slate-100 text-brand-700',
    th: dark ? 'text-white/70 border-white/[0.08] bg-white/[0.06]' : 'text-slate-600 border-slate-200 bg-slate-100',
    td: dark ? 'text-white/80 border-white/[0.08]' : 'text-slate-700 border-slate-200',
    trHover: dark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50',
    hr: dark ? 'border-white/10' : 'border-slate-200',
    a: dark ? 'text-white/70 underline hover:text-white/90' : 'text-brand-600 hover:text-brand-700 underline underline-offset-2',
  };

  return {
    h1: ({ children }) => (
      <h1 className={`text-xl font-bold ${clr.h1} mt-6 mb-3 pb-1 border-b ${clr.border} first:mt-0`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`text-base font-bold ${clr.h2} mt-5 mb-2 first:mt-0`}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className={`text-sm font-semibold ${clr.h3} mt-4 mb-1.5 first:mt-0`}>{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className={`text-sm font-semibold ${clr.h4} mt-3 mb-1 first:mt-0`}>{children}</h4>
    ),
    p: ({ children }) => (
      <p className={`text-sm ${clr.p} leading-relaxed mb-3 last:mb-0`}>{children}</p>
    ),
    strong: ({ children }) => (
      <strong className={`font-semibold ${clr.strong}`}>{children}</strong>
    ),
    em: ({ children }) => <em className={`italic ${clr.em}`}>{children}</em>,
    ul: ({ children }) => (
      <ul className={`text-sm ${clr.list} space-y-1.5 mb-3 pl-4 list-none`}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className={`text-sm ${clr.list} space-y-1.5 mb-3 pl-4 list-decimal`}>{children}</ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed flex gap-2 items-start">
        <span className={`${clr.dot} mt-1 shrink-0 select-none`}>•</span>
        <span>{children}</span>
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`border-l-4 ${clr.bq} pl-4 py-1 my-3 rounded-r-lg text-sm italic`}>
        {children}
      </blockquote>
    ),
    code: ({ children, className }) => {
      const isBlock = className?.startsWith('language-');
      if (isBlock) {
        return (
          <pre className={`${clr.preCode} text-xs rounded-lg px-4 py-3 overflow-x-auto my-3 font-mono leading-relaxed`}>
            <code>{children}</code>
          </pre>
        );
      }
      return (
        <code className={`${clr.inlineCode} text-[13px] px-1.5 py-0.5 rounded font-mono`}>
          {children}
        </code>
      );
    },
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead>{children}</thead>,
    tbody: ({ children }) => (
      <tbody className={`divide-y ${dark ? 'divide-white/[0.04]' : 'divide-slate-100'}`}>
        {children}
      </tbody>
    ),
    tr: ({ children }) => <tr className={clr.trHover}>{children}</tr>,
    th: ({ children }) => (
      <th className={`text-left text-xs font-semibold px-3 py-2 border ${clr.th}`}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className={`px-3 py-2 border ${clr.td} align-top leading-relaxed`}>{children}</td>
    ),
    hr: () => <hr className={`${clr.hr} my-4`} />,
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className={clr.a}>
        {children}
      </a>
    ),
  };
}

interface MarkdownContentProps {
  children: string;
  className?: string;
  dark?: boolean;
}

export default function MarkdownContent({ children, className = '', dark = false }: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={makeComponents(dark)}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
