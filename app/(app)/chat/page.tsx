'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Paperclip, ArrowUp, Zap, Sparkles } from 'lucide-react';
import ChatBubble from '@/components/ChatBubble';
import StructuredPanel from '@/components/StructuredPanel';
import DeepAnalysisOverlay from '@/components/DeepAnalysisOverlay';
import { deepAnalysisSteps, seedChat } from '@/lib/mock-data';
import type { ChatMessage } from '@/lib/types';
import { useLang } from '@/components/LanguageProvider';

function getFileKind(name: string): 'pdf' | 'ppt' | 'doc' | 'image' {
  if (/\.pdf$/i.test(name)) return 'pdf';
  if (/\.(ppt|pptx)$/i.test(name)) return 'ppt';
  if (/\.(png|jpg|jpeg|gif|webp)$/i.test(name)) return 'image';
  return 'doc';
}

const SEED_IDS = new Set(seedChat.map((m) => m.id));

function ChatWorkspace() {
  const params = useSearchParams();
  const seedQuery = params.get('q');
  const { t, lang } = useLang();

  const [messages, setMessages] = useState<ChatMessage[]>(seedChat);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [populated, setPopulated] = useState(false);
  const [deepOpen, setDeepOpen] = useState(false);
  const [deepStep, setDeepStep] = useState(0);
  const [deepDone, setDeepDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    if (!seedQuery || seededRef.current) return;
    seededRef.current = true;
    callAI(seedQuery, seedChat);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedQuery]);

  async function callAI(apiText: string, ctx: ChatMessage[], displayMsg?: ChatMessage) {
    const uiMsg: ChatMessage = displayMsg ?? {
      id: `u-${Date.now()}`,
      role: 'user',
      content: { en: apiText, zh: apiText },
      createdAt: new Date().toISOString(),
    };
    const newId = uiMsg.id;

    setMessages([...ctx, uiMsg]);
    setThinking(true);

    const apiMessages = [...ctx, uiMsg]
      .filter((m) => m.role !== 'system' && !SEED_IDS.has(m.id))
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content:
          m.id === newId
            ? apiText
            : lang === 'zh'
              ? m.content.zh
              : m.content.en,
      }));

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '对话失败');

      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: { en: data.content, zh: data.content },
          createdAt: new Date().toISOString(),
        },
      ]);
      setPopulated(true);
    } catch (err) {
      const errText = err instanceof Error ? err.message : '服务暂时不可用，请稍后重试';
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: { en: errText, zh: errText },
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function send() {
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');
    callAI(text, messages);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const displayMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: { en: `[${file.name}]`, zh: `[${file.name}]` },
      attachments: [
        {
          id: `att-${Date.now()}`,
          name: file.name,
          size: file.size,
          kind: getFileKind(file.name),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    let apiText: string;
    if (file.type.startsWith('text/') || /\.(txt|md|csv)$/i.test(file.name)) {
      const content = await file.text();
      apiText =
        lang === 'zh'
          ? `用户上传了文件「${file.name}」，内容如下：\n\n${content.slice(0, 6000)}\n\n请分析文件中的技术内容和商业化潜力。`
          : `User uploaded "${file.name}". Content:\n\n${content.slice(0, 6000)}\n\nPlease analyze the technology and commercialization potential.`;
    } else {
      apiText =
        lang === 'zh'
          ? `用户上传了文件「${file.name}」（${(file.size / 1024).toFixed(0)} KB）。请告知用户已收到文件，并说明需要哪些具体信息才能进行商业化评估分析。`
          : `User uploaded "${file.name}" (${(file.size / 1024).toFixed(0)} KB). Acknowledge receipt and describe what you need for commercialization analysis.`;
    }

    callAI(apiText, messages, displayMsg);
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
      setTimeout(() => { i += 1; advance(); }, deepAnalysisSteps[i].durationMs);
    };
    advance();
  }

  const totalShown = useMemo(() => messages.length, [messages]);

  return (
    <div
      className="h-[calc(100vh-3.5rem)] flex relative"
      style={{ background: '#0a0a0c' }}
    >
      {/* Chat column */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((m) => (
              <ChatBubble key={m.id} msg={m} />
            ))}
            {thinking && (
              <div className="flex gap-3 animate-fade-in">
                <div
                  className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                >
                  <Sparkles size={14} />
                </div>
                <div
                  className="rounded-2xl px-4 py-3 text-sm"
                  style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    borderRadius: '4px 18px 18px 18px',
                  }}
                >
                  {t('chat_thinking')}
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div
          className="px-6 pb-5 pt-2"
          style={{
            background: 'linear-gradient(to top, #0a0a0c 70%, transparent)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <div
              className="rounded-2xl p-2.5"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 0 15px rgba(255,255,255,0.05)',
              }}
            >
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
                className="w-full resize-none bg-transparent outline-none px-2.5 py-1.5 placeholder:text-white/45"
                style={{ color: '#fff', fontSize: 14.5, caretColor: '#fff' }}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md,.doc,.docx,.ppt,.pptx,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={thinking}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-40"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                    title={t('chat_attach')}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    <Paperclip size={15} />
                  </button>
                  <button
                    onClick={runDeep}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.75)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                    }}
                  >
                    <Zap size={13} /> {t('chat_runDeep')}
                  </button>
                </div>
                <button
                  onClick={send}
                  disabled={!input.trim() || thinking}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity disabled:opacity-30"
                  style={{ background: '#fff' }}
                  aria-label={t('send')}
                >
                  <ArrowUp size={15} color="#0a0a0c" />
                </button>
              </div>
            </div>
            <div
              className="text-[11px] text-center mt-2"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
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

      {/* Right panel */}
      <aside
        className="w-[380px] shrink-0 overflow-y-auto"
        style={{ background: '#0a0a0c' }}
      >
        <StructuredPanel populated={populated} loading={thinking} />
      </aside>
    </div>
  );
}

function ChatLoading() {
  const { t } = useLang();
  return (
    <div className="p-6 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
      {t('loading')}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatWorkspace />
    </Suspense>
  );
}
