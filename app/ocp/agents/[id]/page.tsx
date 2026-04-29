'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Brain,
  Megaphone,
  Palette,
  Briefcase,
  Wallet,
  Settings2,
  Sparkles,
  Activity,
  Target,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { agents, feedEvents, missions, type AgentId } from '@/lib/ocp-data';
import type { Bi } from '@/lib/i18n';

const ICON: Record<AgentId, any> = {
  strategy: Brain,
  social: Megaphone,
  designer: Palette,
  bd: Briefcase,
  finance: Wallet,
};

const CAPABILITIES: Record<AgentId, Bi[]> = {
  strategy: [
    { en: 'Roadmap planning', zh: '路线图规划' },
    { en: 'Mission decomposition', zh: '任务拆解' },
    { en: 'Competitive analysis', zh: '竞品分析' },
    { en: 'Goal tracking', zh: '目标追踪' },
  ],
  social: [
    { en: 'Post drafting', zh: '内容起草' },
    { en: 'Hashtag strategy', zh: '话题策略' },
    { en: 'Engagement monitoring', zh: '互动监测' },
    { en: 'Audience growth', zh: '粉丝增长' },
  ],
  designer: [
    { en: 'Brand assets', zh: '品牌素材' },
    { en: 'Poster generation', zh: '海报生成' },
    { en: 'Video templates', zh: '视频模板' },
    { en: 'Style guides', zh: '视觉规范' },
  ],
  bd: [
    { en: 'Pitch decks', zh: '路演材料' },
    { en: 'Investor mapping', zh: '投资人梳理' },
    { en: 'Outreach templates', zh: '外联模板' },
    { en: 'Deal pipeline', zh: '交易管线' },
  ],
  finance: [
    { en: 'Burn tracking', zh: '燃烧率追踪' },
    { en: 'Runway forecasting', zh: '运营周期预测' },
    { en: 'Expense audit', zh: '支出审计' },
    { en: 'Funding modelling', zh: '融资建模' },
  ],
};

export default function OCPAgentDetailPage() {
  const { t, b } = useLang();
  const params = useParams<{ id: string }>();
  const agent = agents.find((a) => a.id === params.id);
  if (!agent) return notFound();

  const Icon = ICON[agent.id];
  const events = feedEvents.filter((e) => e.agent === agent.id);
  const involved = missions.filter(
    (m) => m.owner === agent.id || m.tasks.some((tk) => tk.agent === agent.id)
  );
  const actionsToday = events.length;
  const activeMissions = involved.filter((m) => m.status === 'active').length;
  const statusKey =
    agent.status === 'active'
      ? 'ocp_ag_status_active'
      : agent.status === 'thinking'
      ? 'ocp_ag_status_thinking'
      : 'ocp_ag_status_idle';

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-[1200px] mx-auto">
        <Link
          href="/ocp/agents"
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={13} />
          {t('ocp_ag_back')}
        </Link>

        {/* Hero */}
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden">
          <div
            className="absolute -top-20 -right-10 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ backgroundColor: agent.color }}
          />
          <div className="relative flex items-start gap-4 flex-wrap">
            <div
              className="w-16 h-16 rounded-2xl grid place-items-center shrink-0 border"
              style={{
                backgroundColor: agent.color + '1a',
                borderColor: agent.color + '60',
                color: agent.color,
                boxShadow: `0 0 36px -10px ${agent.color}`,
              }}
            >
              <Icon size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {t(agent.nameKey)}
              </h1>
              <div className="text-sm text-slate-400 mt-0.5">
                {t(agent.roleKey)}
              </div>
              <div className="mt-3 flex items-center gap-4 flex-wrap text-[12px]">
                <Stat
                  label={t('ocp_ag_stat_status')}
                  value={t(statusKey)}
                  accent={agent.color}
                />
                <Stat
                  label={t('ocp_ag_stat_actions')}
                  value={String(actionsToday)}
                />
                <Stat
                  label={t('ocp_ag_stat_missions')}
                  value={String(activeMissions)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/ocp/command"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Sparkles size={13} />
                {t('ocp_ag_runNow')}
              </Link>
              <Link
                href={`/ocp/agents/${agent.id}/configure`}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm text-slate-200 border border-white/15 hover:bg-white/10 transition-colors"
              >
                <Settings2 size={13} />
                {t('ocp_ag_configure')}
              </Link>
            </div>
          </div>
        </div>

        <BodyGrid agent={agent} events={events} involved={involved} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div
        className="text-sm font-medium mt-0.5"
        style={accent ? { color: accent } : { color: '#e2e8f0' }}
      >
        {value}
      </div>
    </div>
  );
}

function BodyGrid({
  agent,
  events,
  involved,
}: {
  agent: (typeof agents)[number];
  events: typeof feedEvents;
  involved: typeof missions;
}) {
  const { t, b } = useLang();
  const caps = CAPABILITIES[agent.id];

  function rel(min: number) {
    if (min < 60) return t('ocp_ag_minutesAgo').replace('{n}', String(min));
    return t('ocp_ag_hoursAgo').replace('{n}', String(Math.round(min / 60)));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Capabilities */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="text-sm font-semibold text-white">
          {t('ocp_ag_capabilities')}
        </div>
        <ul className="mt-3 space-y-2">
          {caps.map((c, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-[13px] text-slate-200"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: agent.color,
                  boxShadow: `0 0 8px ${agent.color}`,
                }}
              />
              {b(c)}
            </li>
          ))}
        </ul>
      </div>

      {/* Recent activity */}
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white inline-flex items-center gap-2">
            <Activity size={14} className="text-slate-400" />
            {t('ocp_ag_recent')}
          </div>
          <span className="text-[11px] text-slate-500">{events.length}</span>
        </div>
        {events.length === 0 ? (
          <div className="mt-4 text-[13px] text-slate-500">
            {t('ocp_ag_recent_empty')}
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-white/5">
            {events.map((e) => (
              <li key={e.id} className="py-2.5 flex items-start gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{
                    backgroundColor: agent.color,
                    boxShadow: `0 0 8px ${agent.color}`,
                  }}
                />
                <div className="min-w-0 flex-1 text-[13px] text-slate-200">
                  {b(e.message)}
                </div>
                <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                  {rel(e.minutesAgo)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Missions involved */}
      <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="text-sm font-semibold text-white inline-flex items-center gap-2">
          <Target size={14} className="text-slate-400" />
          {t('ocp_ag_missions_involved')}
        </div>
        {involved.length === 0 ? (
          <div className="mt-4 text-[13px] text-slate-500">
            {t('ocp_ag_no_missions')}
          </div>
        ) : (
          <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            {involved.map((m) => {
              const mine = m.tasks.filter((tk) => tk.agent === agent.id);
              const done = mine.filter((tk) => tk.done).length;
              return (
                <li
                  key={m.id}
                  className="p-3 rounded-lg border border-white/5 bg-white/[0.02]"
                >
                  <div className="text-[13px] font-medium text-slate-100">
                    {b(m.title)}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {mine.map((tk, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-[12.5px]"
                      >
                        {tk.done ? (
                          <CheckCircle2
                            size={12}
                            className="text-emerald-400 shrink-0"
                          />
                        ) : (
                          <Circle
                            size={12}
                            className="text-slate-600 shrink-0"
                          />
                        )}
                        <span
                          className={
                            tk.done
                              ? 'text-slate-500 line-through truncate'
                              : 'text-slate-200 truncate'
                          }
                        >
                          {b(tk.label)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-[11px] text-slate-500 tabular-nums">
                    {done}/{mine.length}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
