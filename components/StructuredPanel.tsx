'use client';

import {
  Atom,
  Lightbulb,
  AlertTriangle,
  ListChecks,
  Gauge,
  Loader2,
} from 'lucide-react';
import { mockEvaluation } from '@/lib/mock-data';
import { useLang } from '@/components/LanguageProvider';

function ScoreRow({
  label,
  value,
  scale,
  hint,
}: {
  label: string;
  value: number;
  scale: 10 | 100;
  hint?: string;
}) {
  const pct = (value / scale) * 100;
  const tone =
    pct >= 70 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
        <span className="tabular-nums font-medium text-white">
          {value}
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>/{scale}</span>
        </span>
      </div>
      {hint && (
        <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {hint}
        </div>
      )}
      <div
        className="h-1.5 rounded-full overflow-hidden mt-1.5"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className={`h-full ${tone} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div
        className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider mb-2"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        <Icon size={12} /> {title}
      </div>
      {children}
    </section>
  );
}

export default function StructuredPanel({
  populated,
  loading,
}: {
  populated: boolean;
  loading?: boolean;
}) {
  const { t, b } = useLang();
  const ev = mockEvaluation;

  if (!populated) {
    return (
      <div className="h-full grid place-items-center text-center px-6">
        <div className="space-y-2 max-w-xs">
          <div
            className="w-10 h-10 rounded-xl grid place-items-center mx-auto"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }}
          >
            <Atom size={18} />
          </div>
          <div className="text-sm font-medium text-white">{t('sp_emptyTitle')}</div>
          <div
            className="text-xs leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {t('sp_emptyDesc')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm text-white">{t('sp_evaluation')}</div>
        {loading && (
          <span
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <Loader2 size={12} className="animate-spin" /> {t('sp_updating')}
          </span>
        )}
      </div>

      <Section icon={Atom} title={t('sp_techOverview')}>
        <dl className="text-sm space-y-1.5">
          {[
            { key: t('sp_field'), val: b(ev.overview.field) },
            { key: t('sp_innovation'), val: b(ev.overview.innovation) },
            { key: t('sp_application'), val: b(ev.overview.application) },
          ].map(({ key, val }) => (
            <div key={key} className="flex gap-2">
              <dt className="w-20 shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }}>{key}</dt>
              <dd className="font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>{val}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section icon={Gauge} title={t('sp_evalScore')}>
        <div className="space-y-3">
          {ev.scores.map((s) => (
            <ScoreRow
              key={s.key}
              label={b(s.label)}
              value={s.value}
              scale={s.scale}
              hint={s.hint ? b(s.hint) : undefined}
            />
          ))}
        </div>
      </Section>

      <Section icon={Lightbulb} title={t('sp_keyInsights')}>
        <ul className="text-sm space-y-1.5 pl-3">
          {ev.insights.map((i) => (
            <li
              key={i.en}
              className="flex gap-2 items-start leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.82)' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>•</span>
              <span>{b(i)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={AlertTriangle} title={t('sp_risks')}>
        <ul className="text-sm space-y-1.5 pl-3">
          {ev.risks.map((r) => (
            <li
              key={r.en}
              className="flex gap-2 items-start leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.82)' }}
            >
              <span style={{ color: 'rgba(255,150,150,0.65)', marginTop: 2 }}>•</span>
              <span>{b(r)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={ListChecks} title={t('sp_nextSteps')}>
        <ol className="text-sm space-y-1.5 list-decimal pl-5" style={{ color: 'rgba(255,255,255,0.82)' }}>
          {ev.nextSteps.map((n) => (
            <li key={n.en} className="leading-relaxed">{b(n)}</li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
