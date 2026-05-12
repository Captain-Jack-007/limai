'use client';

import { useState } from 'react';
import { Bot, Gauge, Shield, Save } from 'lucide-react';
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
  { value: 'deepseek', labelKey: 'set_model_deepseek', descKey: 'set_model_deepseek_desc' },
  { value: 'qwen', labelKey: 'set_model_qwen', descKey: 'set_model_qwen_desc' },
  { value: 'openai', labelKey: 'set_model_openai', descKey: 'set_model_openai_desc' },
];

const modes: Option<Mode>[] = [
  { value: 'fast', labelKey: 'set_mode_fast', descKey: 'set_mode_fast_desc' },
  { value: 'standard', labelKey: 'set_mode_standard', descKey: 'set_mode_standard_desc' },
  { value: 'deep', labelKey: 'set_mode_deep', descKey: 'set_mode_deep_desc' },
];

const privacy: Option<Privacy>[] = [
  { value: 'local', labelKey: 'set_priv_local', descKey: 'set_priv_local_desc' },
  { value: 'cloud', labelKey: 'set_priv_cloud', descKey: 'set_priv_cloud_desc' },
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
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">{t('set_title')}</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {t('set_subhead')}
        </p>
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
          <span className="text-xs text-emerald-400 animate-fade-in">{t('set_saved')}</span>
        )}
        <button
          onClick={save}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: '#fff', color: '#0a0a0c' }}
        >
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
  icon: React.ElementType;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl p-5 space-y-4 glow-border"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
        >
          <Icon size={16} />
        </div>
        <div>
          <div className="font-medium text-sm text-white">{title}</div>
          {hint && (
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {hint}
            </div>
          )}
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
            className="text-left p-3 rounded-xl transition-all"
            style={{
              background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
              border: active
                ? '1px solid rgba(255,255,255,0.3)'
                : '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-white">{t(o.labelKey)}</div>
              <span
                className="w-3.5 h-3.5 rounded-full border-2 shrink-0"
                style={{
                  borderColor: active ? '#fff' : 'rgba(255,255,255,0.3)',
                  background: active ? '#fff' : 'transparent',
                  boxShadow: active ? 'inset 0 0 0 2px #0a0a0c' : 'none',
                }}
              />
            </div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t(o.descKey)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
