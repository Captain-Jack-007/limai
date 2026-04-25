'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Paperclip, ArrowUp, Zap, Sparkles } from 'lucide-react';
import ChatBubble from '@/components/ChatBubble';
import StructuredPanel from '@/components/StructuredPanel';
import DeepAnalysisOverlay from '@/components/DeepAnalysisOverlay';
import {
  deepAnalysisSteps,
  demoAssistantReply,
  demoUserMessage,
  seedChat,
} from '@/lib/mock-data';
import type { ChatMessage } from '@/lib/types';
import { useLang } from '@/components/LanguageProvider';

function ChatWorkspace() {
  const params = useSearchParams();
  const seedQuery = params.get('q');
  const { t } = useLang();

  const [messages, setMessages] = useState<ChatMessage[]>(seedChat);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [populated, setPopulated] = useState(false);
  const [deepOpen, setDeepOpen] = useState(false);
  const [deepStep, setDeepStep] = useState(0);
  const [deepDone, setDeepDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, thinking]);

  // If arrived from dashboard with ?q=, seed the conversation playback
  useEffect(() => {
    if (!seedQuery || seededRef.current) return;
    seededRef.current = true;
    runDemo(seedQuery);
  }, [seedQuery]);

  function runDemo(text?: string) {
    const userMsg: ChatMessage = text
      ? {
          ...demoUserMessage,
          id: `u-${Date.now()}`,
          content: { en: text, zh: text },
          attachments: undefined,
        }
      : demoUserMessage;
    setMessages((m) => [...m, userMsg]);
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { ...demoAssistantReply, id: `a-${Date.now()}` },
      ]);
      setThinking(false);
      setPopulated(true);
    }, 1400);
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    runDemo(text);
  }

  function attachDemoFile() {
    setMessages((m) => [...m, { ...demoUserMessage, id: `u-${Date.now()}` }]);
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { ...demoAssistantReply, id: `a-${Date.now()}` },
      ]);
      setThinking(false);
      setPopulated(true);
    }, 1600);
  }

  function runDeep() {
    setDeepOpen(true);
    setDeepStep(0);
    setDeepDone(false);
    let i = 0;
    const advance = () => {
      if (i >= deepAnalysisSteps.length) {
        setDeepDone(true);
        setPopulated(true);
        return;
      }
      setDeepStep(i);
      setTimeout(() => {
        i += 1;
        advance();
      }, deepAnalysisSteps[i].durationMs);
    };
    advance();
  }

  const totalShown = useMemo(() => messages.length, [messages]);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex relative">
      {/* Center: chat */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((m) => (
              <ChatBubble key={m.id} msg={m} />
            ))}
            {thinking && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0 bg-gradient-to-br from-brand-600 to-fuchsia-500 text-white">
                  <Sparkles size={14} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-slate-500">
                  {t('chat_thinking')} <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-6 pb-5 pt-2 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="card p-2.5 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                placeholder={t('chat_placeholder')}
                className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-[14.5px] px-2.5 py-1.5 bg-transparent placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={attachDemoFile}
                    className="btn-ghost text-slate-500"
                    title={t('chat_attach')}
                  >
                    <Paperclip size={16} />
                  </button>
                  <button
                    onClick={runDeep}
                    className="btn-outline border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                  >
                    <Zap size={14} /> {t('chat_runDeep')}
                  </button>
                </div>
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="btn-accent rounded-full !p-2"
                  aria-label={t('send')}
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 text-center mt-2">
              {totalShown === 1
                ? t('chat_thread_one')
                : t('chat_thread_many').replace('{n}', String(totalShown))}
            </div>
          </div>
        </div>
        <DeepAnalysisOverlay
          open={deepOpen}
          stepIndex={deepStep}
          done={deepDone}
          onClose={() => setDeepOpen(false)}
        />
      </div>

      {/* Right: structured panel */}
      <aside className="w-[380px] shrink-0 bg-slate-50/60 overflow-y-auto">
        <StructuredPanel populated={populated} loading={thinking} />
      </aside>
    </div>
  );
}

function ChatLoading() {
  const { t } = useLang();
  return <div className="p-6 text-sm text-slate-400">{t('loading')}</div>;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatWorkspace />
    </Suspense>
  );
}
