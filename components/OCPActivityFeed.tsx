'use client';

import { useEffect, useState } from 'react';
import {
  Brain,
  Megaphone,
  Palette,
  Briefcase,
  Wallet,
  Activity,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { agents, feedEvents, type AgentId } from '@/lib/ocp-data';

const AGENT_ICON: Record<AgentId, any> = {
  strategy: Brain,
  social: Megaphone,
  designer: Palette,
  bd: Briefcase,
  finance: Wallet,
};

function relTime(min: number, t: (k: any) => string) {
  if (min < 1) return t('ocp_feed_just_now');
  if (min < 60) return `${min} ${t('ocp_feed_min_ago')}`;
  return `${Math.round(min / 60)}${t('ocp_feed_hr_ago')}`;
}

export default function OCPActivityFeed() {
  const { t, b } = useLang();
  // Subtle "live" feeling: every 6s, bump the most recent event's "just now"
  // marker so the timestamps stay fresh on the screen.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 6000);
    return () => clearInterval(id);
  }, []);

  const agentMap = new Map(agents.map((a) => [a.id, a] as const));

  return (
    <aside className="no-print hidden xl:flex w-80 shrink-0 border-l border-white/10 bg-[#07080f] h-screen sticky top-0 flex-col">
      <div className="h-14 flex items-center justify-between gap-2 px-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-fuchsia-300">
            <Activity size={14} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">
              {t('ocp_feed_title')}
            </div>
            <div className="text-[11px] text-slate-500">
              {t('ocp_feed_subtitle')}
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[10px] font-medium text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {t('ocp_feed_status_live')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {feedEvents.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-8">
            {t('ocp_feed_empty')}
          </div>
        ) : (
          feedEvents.map((e, idx) => {
            const agent = agentMap.get(e.agent);
            if (!agent) return null;
            const Icon = AGENT_ICON[e.agent];
            const minutes = idx === 0 ? Math.max(0, e.minutesAgo - tick * 0) : e.minutesAgo;
            return (
              <div
                key={e.id}
                className="group relative rounded-xl p-3 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg grid place-items-center shrink-0 border"
                    style={{
                      backgroundColor: agent.color + '18',
                      borderColor: agent.color + '40',
                      color: agent.color,
                      boxShadow: `0 0 18px -8px ${agent.color}`,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="text-[11px] font-semibold truncate"
                        style={{ color: agent.color }}
                      >
                        {t(agent.nameKey)}
                      </div>
                      <div className="text-[10px] text-slate-500 shrink-0">
                        {relTime(minutes, t)}
                      </div>
                    </div>
                    <div className="text-[12.5px] text-slate-200 mt-0.5 leading-relaxed">
                      {b(e.message)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
