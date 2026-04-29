'use client';

import Link from 'next/link';
import {
  Brain,
  Megaphone,
  Palette,
  Briefcase,
  Wallet,
  Settings2,
  Zap,
  Activity,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { agents, type AgentId } from '@/lib/ocp-data';

const ICON: Record<AgentId, any> = {
  strategy: Brain,
  social: Megaphone,
  designer: Palette,
  bd: Briefcase,
  finance: Wallet,
};

export default function OCPAgentsPage() {
  const { t, b } = useLang();
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {t('ocp_ag_title')}
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            {t('ocp_ag_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((a) => {
            const Icon = ICON[a.id];
            const statusKey =
              a.status === 'active'
                ? 'ocp_ag_status_active'
                : a.status === 'thinking'
                ? 'ocp_ag_status_thinking'
                : 'ocp_ag_status_idle';
            const statusTone =
              a.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                : a.status === 'thinking'
                ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                : 'bg-slate-500/15 text-slate-400 border-slate-500/30';
            return (
              <div
                key={a.id}
                className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/20 transition-colors overflow-hidden"
              >
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
                  style={{ backgroundColor: a.color }}
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl grid place-items-center shrink-0 border"
                    style={{
                      backgroundColor: a.color + '1a',
                      borderColor: a.color + '50',
                      color: a.color,
                      boxShadow: `0 0 28px -10px ${a.color}`,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-white truncate">
                          {t(a.nameKey)}
                        </div>
                        <div className="text-[12px] text-slate-400">
                          {t(a.roleKey)}
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
                  </div>
                </div>

                <div className="relative mt-4 space-y-2">
                  <Row
                    icon={Activity}
                    labelKey="ocp_ag_lastAction"
                    value={b(a.lastAction)}
                  />
                  <Row
                    icon={Zap}
                    labelKey="ocp_ag_impact"
                    value={b(a.impact)}
                    accent={a.color}
                  />
                </div>

                <div className="relative mt-5 flex items-center gap-2">
                  <Link
                    href={`/ocp/agents/${a.id}`}
                    className="flex-1 h-9 rounded-lg text-sm font-medium text-white border border-white/15 hover:bg-white/10 transition-colors inline-flex items-center justify-center"
                  >
                    {t('ocp_ag_open')}
                  </Link>
                  <Link
                    href={`/ocp/agents/${a.id}/configure`}
                    className="h-9 px-3 rounded-lg text-sm text-slate-300 border border-white/10 hover:bg-white/5 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Settings2 size={13} />
                    {t('ocp_ag_configure')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  labelKey,
  value,
  accent,
}: {
  icon: any;
  labelKey: any;
  value: string;
  accent?: string;
}) {
  const { t } = useLang();
  return (
    <div className="flex items-start gap-2.5 text-[12.5px]">
      <Icon size={13} className="text-slate-500 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">
          {t(labelKey)}
        </div>
        <div
          className="text-slate-200 mt-0.5"
          style={accent ? { color: accent } : undefined}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
