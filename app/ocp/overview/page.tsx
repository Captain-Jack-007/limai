'use client';

import Link from 'next/link';
import {
  Activity,
  Brain,
  Briefcase,
  Megaphone,
  Palette,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Users2,
  Handshake,
  Rocket,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { agents, company, missions, type AgentId } from '@/lib/ocp-data';
import type { DictKey } from '@/lib/i18n';

const AGENT_ICON: Record<AgentId, any> = {
  strategy: Brain,
  social: Megaphone,
  designer: Palette,
  bd: Briefcase,
  finance: Wallet,
};

export default function OCPOverviewPage() {
  const { t, b } = useLang();

  const kpis: { value: number; labelKey: DictKey; icon: any }[] = [
    {
      value: company.campaignsRunning,
      labelKey: 'ocp_ov_kpi_campaigns',
      icon: Megaphone,
    },
    {
      value: company.leadsIdentified,
      labelKey: 'ocp_ov_kpi_leads',
      icon: Users2,
    },
    {
      value: company.postsToday,
      labelKey: 'ocp_ov_kpi_posts',
      icon: TrendingUp,
    },
    {
      value: company.agentActions,
      labelKey: 'ocp_ov_kpi_actions',
      icon: Activity,
    },
  ];

  const quickActions: {
    titleKey: DictKey;
    descKey: DictKey;
    icon: any;
    agents: AgentId[];
  }[] = [
    {
      titleKey: 'ocp_ov_qa_raise',
      descKey: 'ocp_ov_qa_raise_desc',
      icon: Rocket,
      agents: ['strategy', 'bd', 'finance', 'social'],
    },
    {
      titleKey: 'ocp_ov_qa_marketing',
      descKey: 'ocp_ov_qa_marketing_desc',
      icon: Megaphone,
      agents: ['designer', 'social'],
    },
    {
      titleKey: 'ocp_ov_qa_partners',
      descKey: 'ocp_ov_qa_partners_desc',
      icon: Handshake,
      agents: ['strategy', 'bd'],
    },
  ];

  const activeMissions = missions.filter((m) => m.status === 'active');

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-violet-500/5 to-cyan-400/5 p-6">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-medium text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('ocp_ov_chip')}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {t('ocp_ov_title')}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400 max-w-2xl">
              {t('ocp_ov_sub')}
            </p>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label={t('ocp_ov_stage')}
                value={t('ocp_ov_stage_value')}
                icon={Target}
                accent="#a855f7"
              />
              <StatCard
                label={t('ocp_ov_readiness')}
                value={`${company.readiness}%`}
                icon={TrendingUp}
                accent="#22d3ee"
                progress={company.readiness}
              />
              <StatCard
                label={t('ocp_ov_funding')}
                value={t('ocp_ov_funding_value')}
                icon={DollarSign}
                accent="#fbbf24"
              />
              <StatCard
                label={t('ocp_ov_runway')}
                value={t('ocp_ov_runway_value')}
                icon={Wallet}
                accent="#34d399"
              />
            </div>
          </div>
        </div>

        {/* AI Activity KPIs */}
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 px-1">
            {t('ocp_ov_aiActivity')}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <div
                  key={k.labelKey}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-semibold text-white tabular-nums">
                      {k.value}
                    </div>
                    <Icon size={18} className="text-slate-500" />
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {t(k.labelKey)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 px-1">
            {t('ocp_ov_quickActions')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <Link
                  key={qa.titleKey}
                  href="/ocp/command"
                  className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4 hover:border-fuchsia-400/40 hover:from-fuchsia-500/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg grid place-items-center bg-fuchsia-500/10 border border-fuchsia-400/30 text-fuchsia-300">
                      <Icon size={16} />
                    </div>
                    <ArrowUpRight
                      size={14}
                      className="text-slate-500 group-hover:text-fuchsia-300 transition-colors"
                    />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-white">
                    {t(qa.titleKey)}
                  </div>
                  <div className="mt-1 text-[12px] text-slate-400 leading-relaxed">
                    {t(qa.descKey)}
                  </div>
                  <div className="mt-3 flex -space-x-1.5">
                    {qa.agents.map((id) => {
                      const a = agents.find((x) => x.id === id)!;
                      const AI = AGENT_ICON[id];
                      return (
                        <div
                          key={id}
                          className="w-6 h-6 rounded-full grid place-items-center border-2"
                          style={{
                            backgroundColor: a.color + '22',
                            borderColor: '#0b0c14',
                            color: a.color,
                          }}
                          title={t(a.nameKey)}
                        >
                          <AI size={11} />
                        </div>
                      );
                    })}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <TeamAndMissions activeMissions={activeMissions} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  progress,
}: {
  label: string;
  value: string;
  icon: any;
  accent: string;
  progress?: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0b14]/60 backdrop-blur-sm p-3.5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
        {label}
        <Icon size={14} style={{ color: accent }} />
      </div>
      <div className="mt-1.5 text-base font-semibold text-white truncate">
        {value}
      </div>
      {typeof progress === 'number' && (
        <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: accent }}
          />
        </div>
      )}
    </div>
  );
}

function TeamAndMissions({
  activeMissions,
}: {
  activeMissions: typeof missions;
}) {
  const { t, b } = useLang();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-white">
              {t('ocp_ov_team')}
            </div>
            <div className="text-xs text-slate-500">{t('ocp_ov_team_sub')}</div>
          </div>
          <Link
            href="/ocp/agents"
            className="text-xs text-fuchsia-300 hover:text-fuchsia-200 inline-flex items-center gap-1"
          >
            {t('ocp_ov_view_all')} <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {agents.map((a) => {
            const Icon = AGENT_ICON[a.id];
            return (
              <Link
                href="/ocp/agents"
                key={a.id}
                className="group flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-lg grid place-items-center shrink-0 border"
                  style={{
                    backgroundColor: a.color + '18',
                    borderColor: a.color + '40',
                    color: a.color,
                  }}
                >
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-white truncate">
                      {t(a.nameKey)}
                    </div>
                    <span
                      className={
                        'text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ' +
                        (a.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                          : a.status === 'thinking'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                          : 'bg-slate-500/15 text-slate-400 border border-slate-500/30')
                      }
                    >
                      {a.status === 'active'
                        ? t('ocp_ag_status_active')
                        : a.status === 'thinking'
                        ? t('ocp_ag_status_thinking')
                        : t('ocp_ag_status_idle')}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-400 truncate">
                    {b(a.lastAction)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-white">
            {t('ocp_ov_recent_missions')}
          </div>
          <Link
            href="/ocp/missions"
            className="text-xs text-fuchsia-300 hover:text-fuchsia-200 inline-flex items-center gap-1"
          >
            {t('ocp_ov_view_all')} <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="space-y-2.5">
          {activeMissions.map((m) => {
            const done = m.tasks.filter((tk) => tk.done).length;
            const pct = Math.round((done / m.tasks.length) * 100);
            return (
              <Link
                href="/ocp/missions"
                key={m.id}
                className="block p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-white truncate">
                    {b(m.title)}
                  </div>
                  <div className="text-[10px] text-slate-500 shrink-0">
                    {done}/{m.tasks.length}
                  </div>
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            );
          })}
          {activeMissions.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-4 inline-flex items-center gap-1.5">
              <CheckCircle2 size={12} /> All clear
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
