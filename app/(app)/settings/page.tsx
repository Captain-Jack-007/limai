'use client';

import { useState } from 'react';
import { Bot, Gauge, Shield, Save, Sparkles } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import type { DictKey } from '@/lib/i18n';

type Model = 'deepseek' | 'qwen' | 'openai';
type Mode = 'fast' | 'standard' | 'deep';
type Privacy = 'local' | 'cloud';

type Option<T extends string> = {
  value: T;
  labelKey: DictKey;
  descKey: DictKey;
};

const models: Option<Model>[] = [
  {
    value: 'deepseek',
    labelKey: 'set_model_deepseek',
    descKey: 'set_model_deepseek_desc',
  },
  { value: 'qwen', labelKey: 'set_model_qwen', descKey: 'set_model_qwen_desc' },
  {
    value: 'openai',
    labelKey: 'set_model_openai',
    descKey: 'set_model_openai_desc',
  },
];

const modes: Option<Mode>[] = [
  { value: 'fast', labelKey: 'set_mode_fast', descKey: 'set_mode_fast_desc' },
  {
    value: 'standard',
    labelKey: 'set_mode_standard',
    descKey: 'set_mode_standard_desc',
  },
  { value: 'deep', labelKey: 'set_mode_deep', descKey: 'set_mode_deep_desc' },
];

const privacy: Option<Privacy>[] = [
  {
    value: 'local',
    labelKey: 'set_priv_local',
    descKey: 'set_priv_local_desc',
  },
  {
    value: 'cloud',
    labelKey: 'set_priv_cloud',
    descKey: 'set_priv_cloud_desc',
  },
];

export default function SettingsPage() {
  const { t } = useLang();
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
          <Sparkles size={12} /> {t('set_chip')}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('set_title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t('set_subhead')}</p>
      </header>

      <Group icon={Bot} title={t('set_aiModel')} hint={t('set_aiModelHint')}>
        <RadioGrid value={model} onChange={setModel} options={models} />
      </Group>

      <Group icon={Gauge} title={t('set_mode')} hint={t('set_modeHint')}>
        <RadioGrid value={mode} onChange={setMode} options={modes} />
      </Group>

      <Group icon={Shield} title={t('set_privacy')} hint={t('set_privacyHint')}>
        <RadioGrid value={priv} onChange={setPriv} options={privacy} />
      </Group>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-xs text-emerald-600 animate-fade-in">
            {t('set_saved')}
          </span>
        )}
        <button onClick={save} className="btn-primary">
          <Save size={14} /> {t('set_save')}
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
  options: Option<T>[];
}) {
  const { t } = useLang();
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
              <div className="text-sm font-medium">{t(o.labelKey)}</div>
              <span
                className={
                  'w-3.5 h-3.5 rounded-full border-2 ' +
                  (active
                    ? 'border-brand-500 bg-brand-500 shadow-[inset_0_0_0_2px_white]'
                    : 'border-slate-300')
                }
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">{t(o.descKey)}</div>
          </button>
        );
      })}
    </div>
  );
}
