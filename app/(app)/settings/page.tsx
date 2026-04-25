'use client';

import { useState } from 'react';
import { Bot, Gauge, Shield, Save, Sparkles } from 'lucide-react';

type Model = 'deepseek' | 'qwen' | 'openai';
type Mode = 'fast' | 'standard' | 'deep';
type Privacy = 'local' | 'cloud';

const models: { value: Model; label: string; desc: string }[] = [
  { value: 'deepseek', label: 'DeepSeek', desc: 'Fast reasoning, low cost.' },
  { value: 'qwen', label: 'Qwen', desc: 'Bilingual EN/中, strong on Chinese context.' },
  { value: 'openai', label: 'OpenAI', desc: 'Highest analytical depth, slower.' },
];

const modes: { value: Mode; label: string; desc: string }[] = [
  { value: 'fast', label: 'Fast', desc: 'Single-pass evaluation in ~10s.' },
  { value: 'standard', label: 'Standard', desc: 'Balanced multi-step analysis.' },
  { value: 'deep', label: 'Deep', desc: 'Patents + market + investor matching.' },
];

const privacy: { value: Privacy; label: string; desc: string }[] = [
  { value: 'local', label: 'Local', desc: 'Files processed on-device only.' },
  { value: 'cloud', label: 'Cloud', desc: 'Use hosted inference for richer outputs.' },
];

export default function SettingsPage() {
  const [model, setModel] = useState<Model>('deepseek');
  const [mode, setMode] = useState<Mode>('standard');
  const [priv, setPriv] = useState<Privacy>('cloud');
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <header>
        <div className="inline-flex items-center gap-1.5 chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 mb-2">
          <Sparkles size={12} /> Model & privacy controls
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tune the agent's underlying model, depth, and privacy mode.
        </p>
      </header>

      <Group icon={Bot} title="AI Model" hint="Backbone LLM used for evaluation and chat.">
        <RadioGrid value={model} onChange={setModel} options={models} />
      </Group>

      <Group icon={Gauge} title="Analysis Mode" hint="Trade-off between speed and depth.">
        <RadioGrid value={mode} onChange={setMode} options={modes} />
      </Group>

      <Group icon={Shield} title="Data Privacy" hint="Where your uploaded papers are processed.">
        <RadioGrid value={priv} onChange={setPriv} options={privacy} />
      </Group>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-xs text-emerald-600 animate-fade-in">
            ✓ Settings saved
          </span>
        )}
        <button onClick={save} className="btn-primary">
          <Save size={14} /> Save changes
        </button>
      </div>
    </div>
  );
}

function Group({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: any;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center text-slate-600 shrink-0">
          <Icon size={16} />
        </div>
        <div>
          <div className="font-medium text-sm">{title}</div>
          {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}

function RadioGrid<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; desc: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={
              'text-left p-3 rounded-xl border transition-all ' +
              (active
                ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white')
            }
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{o.label}</div>
              <span
                className={
                  'w-3.5 h-3.5 rounded-full border-2 ' +
                  (active
                    ? 'border-brand-500 bg-brand-500 shadow-[inset_0_0_0_2px_white]'
                    : 'border-slate-300')
                }
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">{o.desc}</div>
          </button>
        );
      })}
    </div>
  );
}
