'use client';

import {
  Plus,
  Target,
  CheckCircle2,
  Circle,
  Brain,
  Megaphone,
  Palette,
  Briefcase,
  Wallet,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { agents, missions, type AgentId } from '@/lib/ocp-data';

const ICON: Record<AgentId, any> = {
  strategy: Brain,
  social: Megaphone,
  designer: Palette,
  bd: Briefcase,
  finance: Wallet,
};

export default function OCPMissionsPage() {
  const { t, b } = useLang();
  const agentMap = new Map(agents.map((a) => [a.id, a] as const));

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {t('ocp_mi_title')}
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              {t('ocp_mi_sub')}
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={14} />
            {t('ocp_mi_new')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {missions.map((m) => {
            const owner = agentMap.get(m.owner)!;
            const OwnerIcon = ICON[m.owner];
            const done = m.tasks.filter((tk) => tk.done).length;
            const pct = Math.round((done / m.tasks.length) * 100);
            const statusKey =
              m.status === 'active'
                ? 'ocp_mi_status_active'
                : m.status === 'done'
                ? 'ocp_mi_status_done'
                : 'ocp_mi_status_queued';
            const statusTone =
              m.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                : m.status === 'done'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                : 'bg-slate-500/15 text-slate-400 border-slate-500/30';
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-400/30 grid place-items-center text-fuchsia-300 shrink-0">
                      <Target size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-white truncate">
                        {b(m.title)}
                      </div>
                      <div className="mt-0.5 text-[12px] text-slate-400 inline-flex items-center gap-1.5">
                        <span className="text-slate-500">
                          {t('ocp_mi_owner')}:
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5"
                          style={{ color: owner.color }}
                        >
                          <OwnerIcon size={11} />
                          {t(owner.nameKey)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={
                      'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ' +
                      statusTone
                    }
                  >
                    {t(statusKey)}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      {t('ocp_mi_progress')}
                    </span>
                    <span className="text-slate-300 tabular-nums">
                      {done}/{m.tasks.length} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                    {t('ocp_mi_tasks')}
                  </div>
                  <div className="space-y-1.5">
                    {m.tasks.map((tk, i) => {
                      const ag = agentMap.get(tk.agent)!;
                      const TIcon = ICON[tk.agent];
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 text-[13px]"
                        >
                          {tk.done ? (
                            <CheckCircle2
                              size={14}
                              className="text-emerald-400 shrink-0"
                            />
                          ) : (
                            <Circle
                              size={14}
                              className="text-slate-600 shrink-0"
                            />
                          )}
                          <span
                            className={
                              tk.done
                                ? 'text-slate-500 line-through truncate flex-1'
                                : 'text-slate-200 truncate flex-1'
                            }
                          >
                            {b(tk.label)}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border shrink-0"
                            style={{
                              color: ag.color,
                              backgroundColor: ag.color + '15',
                              borderColor: ag.color + '35',
                            }}
                          >
                            <TIcon size={9} />
                            {t(ag.nameKey).split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
