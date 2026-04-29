'use client';

import { Wallet, TrendingDown, Calendar, Sparkles } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { finance } from '@/lib/ocp-data';

const COLORS = [
  '#a855f7',
  '#22d3ee',
  '#f472b6',
  '#fbbf24',
  '#34d399',
  '#60a5fa',
];

export default function OCPFinancePage() {
  const { t, b } = useLang();
  const total = finance.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {t('ocp_fi_title')}
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            {t('ocp_fi_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BigCard
            label={t('ocp_fi_balance')}
            value={`$${finance.cash.toLocaleString()}`}
            icon={Wallet}
            accent="#34d399"
          />
          <BigCard
            label={t('ocp_fi_burn')}
            value={`$${finance.burn.toLocaleString()}`}
            icon={TrendingDown}
            accent="#f472b6"
          />
          <BigCard
            label={t('ocp_fi_runway')}
            value={`${finance.runwayMonths} ${t('ocp_fi_runway_months')}`}
            icon={Calendar}
            accent={finance.runwayMonths < 6 ? '#fbbf24' : '#22d3ee'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-white">
                {t('ocp_fi_expenses')}
              </div>
              <div className="text-[12px] text-slate-400 tabular-nums">
                ${total.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3">
              {finance.expenses.map((e, i) => {
                const pct = (e.amount / total) * 100;
                const color = COLORS[i % COLORS.length];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-[12.5px] mb-1">
                      <span className="text-slate-200">{b(e.category)}</span>
                      <span className="text-slate-400 tabular-nums">
                        ${e.amount.toLocaleString()}{' '}
                        <span className="text-slate-600">
                          · {pct.toFixed(0)}%
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                          boxShadow: `0 0 12px -2px ${color}`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/10 to-violet-500/5 p-5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-fuchsia-300">
              <Sparkles size={12} />
              {t('ocp_fi_recommendation')}
            </div>
            <div className="mt-2 text-sm text-slate-100 leading-relaxed">
              {t('ocp_fi_rec_text')}
            </div>
            <button className="mt-4 w-full h-9 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:opacity-90 transition-opacity">
              {t('ocp_ag_open')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BigCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: any;
  accent: string;
}) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 overflow-hidden">
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ backgroundColor: accent }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            {label}
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
            {value}
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-xl grid place-items-center border"
          style={{
            backgroundColor: accent + '1a',
            borderColor: accent + '50',
            color: accent,
          }}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}
