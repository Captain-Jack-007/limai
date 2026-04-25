'use client';

import { Sparkles, FileText, User } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { useLang } from '@/components/LanguageProvider';

function fmtSize(b: number) {
  if (b > 1_000_000) return `${(b / 1_000_000).toFixed(1)} MB`;
  if (b > 1_000) return `${(b / 1_000).toFixed(0)} KB`;
  return `${b} B`;
}

export default function ChatBubble({ msg }: { msg: ChatMessage }) {
  const { b } = useLang();
  const isUser = msg.role === 'user';
  return (
    <div
      className={`flex gap-3 animate-fade-in ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      <div
        className={
          'w-8 h-8 rounded-lg grid place-items-center shrink-0 ' +
          (isUser
            ? 'bg-slate-200 text-slate-700'
            : 'bg-gradient-to-br from-brand-600 to-fuchsia-500 text-white shadow-sm')
        }
      >
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>
      <div
        className={
          'max-w-[80%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ' +
          (isUser
            ? 'bg-ink-900 text-white rounded-tr-md'
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-md')
        }
      >
        {msg.attachments?.length ? (
          <div className="mb-2 space-y-1">
            {msg.attachments.map((a) => (
              <div
                key={a.id}
                className={
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ' +
                  (isUser
                    ? 'bg-white/10 text-white/90'
                    : 'bg-slate-50 text-slate-700 border border-slate-200')
                }
              >
                <FileText size={12} />
                <span className="font-medium truncate">{a.name}</span>
                <span className="opacity-60">{fmtSize(a.size)}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="whitespace-pre-wrap">{b(msg.content)}</div>
      </div>
    </div>
  );
}
