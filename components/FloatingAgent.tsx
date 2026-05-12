'use client';

import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { X, Send, Zap } from 'lucide-react';
import MiniParticleSphere from './MiniParticleSphere';

const BALL_SIZE = 64;
const PANEL_W = 340;
const PANEL_H = 440;

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const GREETING: Message = {
  role: 'assistant',
  text: '你好，我是赛乔，链接科学家与市场的技术经理人智能体。',
};

const QUICK_Q = '你可以帮我做些什么？';
const QUICK_A = `我可以帮你：
· 评估科研项目的技术成熟度和商业潜力
· 生成专业的行业研报和技术分析
· 匹配适合你项目的投资人和 VC 机构
· 生成路演 PPT 和商业化方案

你可以直接在上方输入框描述你的项目，或者点击首页的「智能评估」开始。`;

function FloatingAgent() {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const dragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startMouse = useRef({ x: 0, y: 0 });
  const moved = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPos({ x: window.innerWidth - BALL_SIZE - 24, y: window.innerHeight - BALL_SIZE - 24 });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clamp = useCallback((x: number, y: number) => ({
    x: Math.max(8, Math.min(x, window.innerWidth - BALL_SIZE - 8)),
    y: Math.max(8, Math.min(y, window.innerHeight - BALL_SIZE - 8)),
  }), []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return;
    e.preventDefault();
    dragging.current = true;
    moved.current = 0;
    startPos.current = { x: pos.x, y: pos.y };
    startMouse.current = { x: e.clientX, y: e.clientY };

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const dx = ev.clientX - startMouse.current.x;
      const dy = ev.clientY - startMouse.current.y;
      moved.current = Math.sqrt(dx * dx + dy * dy);
      setPos(clamp(startPos.current.x + dx, startPos.current.y + dy));
    };
    const onUp = () => {
      dragging.current = false;
      if (moved.current < 5) setIsOpen(true);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (isOpen) return;
    const t = e.touches[0];
    dragging.current = true;
    moved.current = 0;
    startPos.current = { x: pos.x, y: pos.y };
    startMouse.current = { x: t.clientX, y: t.clientY };

    const onMove = (ev: TouchEvent) => {
      if (!dragging.current) return;
      const dx = ev.touches[0].clientX - startMouse.current.x;
      const dy = ev.touches[0].clientY - startMouse.current.y;
      moved.current = Math.sqrt(dx * dx + dy * dy);
      setPos(clamp(startPos.current.x + dx, startPos.current.y + dy));
    };
    const onEnd = () => {
      dragging.current = false;
      if (moved.current < 5) setIsOpen(true);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  };

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      const reply: string = data?.content ?? data?.message ?? '抱歉，暂时无法回复。';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: '网络异常，请稍后重试。' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickQ() {
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: QUICK_Q },
      { role: 'assistant', text: QUICK_A },
    ]);
  }

  if (pos.x === -999) return null;

  const panelLeft = Math.max(8, Math.min(pos.x + BALL_SIZE / 2 - PANEL_W / 2, window.innerWidth - PANEL_W - 8));
  const panelTop = pos.y - PANEL_H - 12;
  const panelTopFinal = panelTop < 8 ? pos.y + BALL_SIZE + 12 : panelTop;

  // Only show quick question button if only greeting is present
  const showQuickQ = messages.length === 1 && messages[0].role === 'assistant';

  return (
    <>
      {/* 聊天面板 */}
      {isOpen && (
        <div
          className="animate-chat-pop-in"
          style={{
            position: 'fixed',
            left: panelLeft,
            top: panelTopFinal,
            width: PANEL_W,
            height: PANEL_H,
            zIndex: 9999,
            borderRadius: 20,
            background: '#111113',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* 顶部栏 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: '#000' }}>
                <MiniParticleSphere />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>赛乔 Agent</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>科技成果转化顾问</div>
              </div>
            </div>
            <button
              aria-label="关闭"
              onClick={() => setIsOpen(false)}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* 消息列表 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '8px 12px',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: m.role === 'user' ? '#fff' : 'rgba(255,255,255,0.85)',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: '14px 14px 14px 4px', background: 'rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 预制问题 */}
          {showQuickQ && (
            <div style={{ padding: '0 14px 10px', flexShrink: 0 }}>
              <button
                onClick={handleQuickQ}
                style={{
                  width: '100%', padding: '8px 12px',
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
                  fontSize: 12, color: 'rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left',
                }}
              >
                <Zap size={12} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                {QUICK_Q}
              </button>
            </div>
          )}

          {/* 输入框 */}
          <div
            style={{
              padding: '10px 14px 14px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="输入你的问题..."
              rows={1}
              style={{
                flex: 1, resize: 'none', outline: 'none',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '8px 10px',
                fontSize: 13, color: '#fff',
                caretColor: '#fff', lineHeight: 1.4,
                maxHeight: 80, overflowY: 'auto',
              }}
            />
            <button
              aria-label="发送"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{
                width: 34, height: 34, borderRadius: 10, border: 'none',
                background: input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.1)',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s', flexShrink: 0,
                color: input.trim() && !loading ? '#000' : 'rgba(255,255,255,0.3)',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 悬浮球 */}
      <div
        aria-label="打开赛乔智能体"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: BALL_SIZE,
          height: BALL_SIZE,
          zIndex: 9998,
          cursor: isOpen ? 'default' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {!isOpen && (
          <div
            className="animate-pulse-ring"
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.2)',
              pointerEvents: 'none',
            }}
          />
        )}
        <div
          style={{
            width: BALL_SIZE,
            height: BALL_SIZE,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 60%, rgba(0,0,0,0.4) 100%)',
            border: '1px solid rgba(255,255,255,0.15)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <MiniParticleSphere />
        </div>
      </div>
    </>
  );
}

export default memo(FloatingAgent);
