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
    pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="tabular-nums font-medium">
          {value}
          <span className="text-slate-400">/{scale}</span>
        </span>
      </div>
      {hint && <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
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
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 mb-2">
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
  const ev = mockEvaluation;
  if (!populated) {
    return (
      <div className="h-full grid place-items-center text-center px-6">
        <div className="space-y-2 max-w-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center mx-auto text-slate-400">
            <Atom size={18} />
          </div>
          <div className="text-sm font-medium text-slate-700">
            Structured output appears here
          </div>
          <div className="text-xs text-slate-500 leading-relaxed">
            Send a message or upload a paper. The agent will populate the
            evaluation as it analyzes.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm">Evaluation</div>
        {loading && (
          <span className="inline-flex items-center gap-1 text-[11px] text-brand-700">
            <Loader2 size={12} className="animate-spin" /> updating
          </span>
        )}
      </div>

      <Section icon={Atom} title="Technology Overview">
        <dl className="text-sm space-y-1.5">
          <div className="flex gap-2">
            <dt className="text-slate-500 w-24 shrink-0">Field</dt>
            <dd className="font-medium">{ev.overview.field}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-slate-500 w-24 shrink-0">Innovation</dt>
            <dd className="font-medium">{ev.overview.innovation}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-slate-500 w-24 shrink-0">Application</dt>
            <dd className="font-medium">{ev.overview.application}</dd>
          </div>
        </dl>
      </Section>

      <Section icon={Gauge} title="Evaluation Score">
        <div className="space-y-3">
          {ev.scores.map((s) => (
            <ScoreRow
              key={s.key}
              label={s.label}
              value={s.value}
              scale={s.scale}
              hint={s.hint}
            />
          ))}
        </div>
      </Section>

      <Section icon={Lightbulb} title="Key Insights">
        <ul className="text-sm space-y-1.5 text-slate-700 list-disc pl-4 marker:text-brand-500">
          {ev.insights.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </Section>

      <Section icon={AlertTriangle} title="Risks">
        <ul className="text-sm space-y-1.5 text-slate-700 list-disc pl-4 marker:text-rose-400">
          {ev.risks.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section icon={ListChecks} title="Suggested Next Steps">
        <ol className="text-sm space-y-1.5 text-slate-700 list-decimal pl-4 marker:text-slate-400">
          {ev.nextSteps.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
