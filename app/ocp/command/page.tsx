'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Send,
  Sparkles,
  Brain,
  Megaphone,
  Palette,
  Briefcase,
  Wallet,
  Cpu,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { agents, type AgentId } from '@/lib/ocp-data';
import type { Bi, DictKey } from '@/lib/i18n';

const ICON: Record<AgentId, any> = {
  strategy: Brain,
  social: Megaphone,
  designer: Palette,
  bd: Briefcase,
  finance: Wallet,
};

type AgentStep = { agent: AgentId; action: Bi };
type Plan = {
  matchKey: 'raise' | 'marketing' | 'partners' | 'cut' | 'default';
  steps: AgentStep[];
};

const PLANS: Record<Plan['matchKey'], AgentStep[]> = {
  raise: [
    {
      agent: 'strategy',
      action: {
        en: 'Drafting a 90-day fundraise plan with milestones',
        zh: '起草 90 天融资计划与里程碑',
      },
    },
    {
      agent: 'bd',
      action: {
        en: 'Generating a 12-slide investor pitch deck',
        zh: '生成 12 页投资人路演材料',
      },
    },
    {
      agent: 'social',
      action: {
        en: 'Launching a 7-day awareness campaign on LinkedIn + WeChat',
        zh: '在 LinkedIn + 微信启动 7 天认知活动',
      },
    },
    {
      agent: 'finance',
      action: {
        en: 'Calculating funding need ($1.2M) and 18-month spend plan',
        zh: '计算融资需求（120 万美元）与 18 个月支出计划',
      },
    },
  ],
  marketing: [
    {
      agent: 'strategy',
      action: {
        en: 'Defining campaign goal and target persona',
        zh: '定义活动目标与目标人群',
      },
    },
    {
      agent: 'designer',
      action: {
        en: 'Generating 4 poster variants and a 60s demo video',
        zh: '生成 4 张海报变体与 60 秒演示视频',
      },
    },
    {
      agent: 'social',
      action: {
        en: 'Scheduling 9 posts across LinkedIn, X and WeChat',
        zh: '在 LinkedIn、X、微信安排 9 条内容',
      },
    },
  ],
  partners: [
    {
      agent: 'strategy',
      action: {
        en: 'Mapping top 12 candidate labs and corporates',
        zh: '梳理前 12 家候选实验室与企业',
      },
    },
    {
      agent: 'bd',
      action: {
        en: 'Drafting partnership proposal templates',
        zh: '起草合作提案模板',
      },
    },
    {
      agent: 'social',
      action: {
        en: 'Personalising outreach messages for each contact',
        zh: '为每位联系人定制外联文案',
      },
    },
  ],
  cut: [
    {
      agent: 'finance',
      action: {
        en: 'Auditing last 90 days of expenses, ranking by ROI',
        zh: '审计近 90 天支出，按投入产出排序',
      },
    },
    {
      agent: 'strategy',
      action: {
        en: 'Recommending which 3 line-items to cut first',
        zh: '建议优先削减的 3 个支出项',
      },
    },
    {
      agent: 'bd',
      action: {
        en: 'Renegotiating top 2 vendor contracts',
        zh: '重新协商前 2 大供应商合同',
      },
    },
  ],
  default: [
    {
      agent: 'strategy',
      action: {
        en: 'Breaking your goal into agent-level tasks',
        zh: '将你的目标拆解为智能体级任务',
      },
    },
    {
      agent: 'bd',
      action: { en: 'Preparing supporting materials', zh: '准备支撑材料' },
    },
    {
      agent: 'social',
      action: { en: 'Drafting a public update', zh: '起草对外更新' },
    },
  ],
};

function classify(text: string): Plan['matchKey'] {
  const s = text.toLowerCase();
  if (/(raise|fund|seed|investor|融资|种子|投资)/.test(s)) return 'raise';
  if (/(market|launch|awareness|campaign|brand|营销|认知|活动|品牌)/.test(s))
    return 'marketing';
  if (/(partner|collab|alliance|合作|伙伴)/.test(s)) return 'partners';
  if (/(cut|reduce|burn|spend|cost|削减|降低|燃烧|支出|成本)/.test(s))
    return 'cut';
  return 'default';
}

type Msg =
  | { role: 'user'; text: string; id: string }
  | {
      role: 'system';
      planKey: Plan['matchKey'];
      steps: AgentStep[];
      visible: number;
      id: string;
    };

export default function OCPCommandPage() {
  const { t, b } = useLang();
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroll.current?.scrollTo({
      top: scroll.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [msgs]);

  function dispatch(text: string) {
    if (!text.trim() || busy) return;
    const id = `u-${Date.now()}`;
    const sysId = `s-${Date.now()}`;
    const planKey = classify(text);
    const steps = PLANS[planKey];
    setMsgs((m) => [
      ...m,
      { role: 'user', text, id },
      { role: 'system', planKey, steps, visible: 0, id: sysId },
    ]);
    setInput('');
    setBusy(true);
    // Reveal each step every ~700ms to mimic agent collaboration.
    let n = 0;
    const tick = () => {
      n += 1;
      setMsgs((cur) =>
        cur.map((mm) =>
          mm.role === 'system' && mm.id === sysId
            ? { ...mm, visible: Math.min(n, mm.steps.length) }
            : mm
        )
      );
      if (n < steps.length) setTimeout(tick, 700);
      else setBusy(false);
    };
    setTimeout(tick, 600);
  }

  const examples: { key: DictKey; prompt: string }[] = [
    { key: 'ocp_cmd_ex1', prompt: 'I want to raise seed funding' },
    { key: 'ocp_cmd_ex2', prompt: 'Launch a product awareness campaign' },
    { key: 'ocp_cmd_ex3', prompt: 'Find 3 strategic partners' },
    { key: 'ocp_cmd_ex4', prompt: 'Cut my burn rate by 30%' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-3 border-b border-white/5">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {t('ocp_cmd_title')}
        </h1>
        <p className="mt-1 text-sm text-slate-400 max-w-2xl">
          {t('ocp_cmd_sub')}
        </p>
      </div>

      <div ref={scroll} className="flex-1 overflow-y-auto px-6 py-6">
        {msgs.length === 0 ? (
          <EmptyState examples={examples} onPick={dispatch} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {msgs.map((m) =>
              m.role === 'user' ? (
                <UserBubble key={m.id} text={m.text} />
              ) : (
                <SystemBubble key={m.id} msg={m} />
              )
            )}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-[#07080f]/80 backdrop-blur-md p-4">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              dispatch(input);
            }}
            className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-2 focus-within:border-fuchsia-400/50 focus-within:bg-white/[0.06] transition-colors"
          >
            <Sparkles size={16} className="text-fuchsia-300 shrink-0" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ocp_cmd_placeholder')}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              <Send size={13} />
              {t('ocp_cmd_send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  examples,
  onPick,
}: {
  examples: { key: DictKey; prompt: string }[];
  onPick: (text: string) => void;
}) {
  const { t } = useLang();
  return (
    <div className="max-w-2xl mx-auto pt-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 grid place-items-center text-white shadow-[0_0_40px_-10px_rgba(217,70,239,0.6)]">
        <Cpu size={22} />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-white">
        {t('ocp_cmd_title')}
      </h2>
      <p className="mt-1 text-sm text-slate-400">{t('ocp_cmd_sub')}</p>
      <div className="mt-6 text-[10px] uppercase tracking-wider text-slate-500">
        {t('ocp_cmd_examples')}
      </div>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {examples.map((e) => (
          <button
            key={e.key}
            onClick={() => onPick(e.prompt)}
            className="text-left p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-fuchsia-400/40 transition-colors text-sm text-slate-200"
          >
            {t(e.key)}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  const { t } = useLang();
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2.5">
        <div className="text-[10px] uppercase tracking-wider text-fuchsia-300 mb-0.5">
          {t('ocp_cmd_youLabel')}
        </div>
        <div className="text-sm text-white whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
}

function SystemBubble({
  msg,
}: {
  msg: { steps: AgentStep[]; visible: number };
}) {
  const { t, b } = useLang();
  const agentMap = new Map(agents.map((a) => [a.id, a] as const));
  const isThinking = msg.visible === 0;
  const isDone = msg.visible >= msg.steps.length;

  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] w-full rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-2">
          <span className="text-cyan-300 inline-flex items-center gap-1.5">
            <Cpu size={11} /> {t('ocp_cmd_systemLabel')}
          </span>
          {!isThinking && (
            <span className="text-slate-500 normal-case tracking-normal text-[11px]">
              {t('ocp_cmd_dispatched').replace('{n}', String(msg.steps.length))}
            </span>
          )}
        </div>

        {isThinking ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="flex gap-1">
              <Dot delay="0ms" />
              <Dot delay="150ms" />
              <Dot delay="300ms" />
            </span>
            {t('ocp_cmd_thinking')}
          </div>
        ) : (
          <div className="space-y-2">
            {msg.steps.slice(0, msg.visible).map((s, i) => {
              const a = agentMap.get(s.agent)!;
              const Icon = ICON[s.agent];
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 animate-[fadeIn_0.3s_ease-out]"
                >
                  <div
                    className="w-7 h-7 rounded-md grid place-items-center shrink-0 border"
                    style={{
                      backgroundColor: a.color + '20',
                      borderColor: a.color + '50',
                      color: a.color,
                    }}
                  >
                    <Icon size={12} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[11px] font-semibold"
                      style={{ color: a.color }}
                    >
                      {t(a.nameKey)}
                    </div>
                    <div className="text-[13px] text-slate-200 mt-0.5">
                      {b(s.action)}
                    </div>
                  </div>
                </div>
              );
            })}
            {!isDone && (
              <div className="flex items-center gap-1.5 px-2 text-[11px] text-slate-500">
                <Dot delay="0ms" />
                <Dot delay="150ms" />
                <Dot delay="300ms" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 inline-block animate-pulse"
      style={{ animationDelay: delay }}
    />
  );
}
