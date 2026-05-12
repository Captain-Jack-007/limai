'use client';

import { Sparkles, FileText, User } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { useLang } from '@/components/LanguageProvider';
import MarkdownContent from '@/components/MarkdownContent';

function fmtSize(b: number) {
  if (b > 1_000_000) return `${(b / 1_000_000).toFixed(1)} MB`;
  if (b > 1_000) return `${(b / 1_000).toFixed(0)} KB`;
  return `${b} B`;
}

export default function ChatBubble({ msg }: { msg: ChatMessage }) {
  const { b } = useLang();
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
        style={{
          background: isUser
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>

      <div
        className="max-w-[80%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed"
        style={
          isUser
            ? {
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                borderRadius: '18px 4px 18px 18px',
              }
            : {
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.88)',
                borderRadius: '4px 18px 18px 18px',
                boxShadow: '0 0 12px rgba(255,255,255,0.04)',
              }
        }
      >
        {msg.attachments?.length ? (
          <div className="mb-2 space-y-1">
            {msg.attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                <FileText size={12} />
                <span className="font-medium truncate">{a.name}</span>
                <span style={{ opacity: 0.5 }}>{fmtSize(a.size)}</span>
              </div>
            ))}
          </div>
        ) : null}

        {isUser ? (
          <div className="whitespace-pre-wrap">{b(msg.content)}</div>
        ) : (
          <MarkdownContent
            dark
            className="[&_p:last-child]:mb-0 [&_p]:text-[14.5px] [&_h1]:text-base [&_h2]:text-[15px] [&_h3]:text-sm"
          >
            {b(msg.content)}
          </MarkdownContent>
        )}
      </div>
    </div>
  );
}
