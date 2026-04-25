'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Paperclip,
  ArrowUp,
  Sparkles,
  FlaskConical,
  Rocket,
  Users,
  FolderOpen,
  ArrowUpRight,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';
import { stageDictKey } from '@/lib/types';
import { useLang } from '@/components/LanguageProvider';
import type { DictKey } from '@/lib/i18n';

type QuickAction = {
  icon: any;
  titleKey: DictKey;
  descKey: DictKey;
  promptKey: DictKey;
};

const quickActions: QuickAction[] = [
  {
    icon: FlaskConical,
    titleKey: 'dash_qa1_title',
    descKey: 'dash_qa1_desc',
    promptKey: 'dash_qa1_prompt',
  },
  {
    icon: Rocket,
    titleKey: 'dash_qa2_title',
    descKey: 'dash_qa2_desc',
    promptKey: 'dash_qa2_prompt',
  },
  {
    icon: Users,
    titleKey: 'dash_qa3_title',
    descKey: 'dash_qa3_desc',
    promptKey: 'dash_qa3_prompt',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { t, b } = useLang();
  const [prompt, setPrompt] = useState('');

  function send(p?: string) {
    const text = (p ?? prompt).trim();
    if (!text) return;
    router.push(`/chat?q=${encodeURIComponent(text)}`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 px-6 py-10">
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 chip bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <Sparkles size={12} /> {t('dash_chip')}
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {t('dash_h1_a')}{' '}
          <span className="gradient-text">{t('dash_h1_tech')}</span>
          {t('dash_h1_b')}
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto">{t('dash_sub')}</p>
      </header>

      <div className="card p-3 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
          }}
          rows={3}
          placeholder={t('dash_placeholder')}
          className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-[15px] px-3 py-2 placeholder:text-slate-400 bg-transparent"
        />
        <div className="flex items-center justify-between gap-2 px-2 pb-1">
          <button
            type="button"
            className="btn-ghost text-slate-500"
            onClick={() => router.push('/chat?upload=1')}
          >
            <Paperclip size={16} /> {t('dash_uploadBtn')}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:block">
              {t('dash_kbdHint')}
            </span>
            <button
              type="button"
              onClick={() => send()}
              disabled={!prompt.trim()}
              className="btn-accent rounded-full !p-2"
              aria-label={t('send')}
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>

      <section>
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Lightbulb size={12} /> {t('dash_quickActions')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map(({ icon: Icon, titleKey, descKey, promptKey }) => (
            <button
              key={titleKey}
              onClick={() => send(t(promptKey))}
              className="card p-4 text-left hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center mb-3 group-hover:bg-brand-100">
                <Icon size={16} />
              </div>
              <div className="font-medium text-sm">{t(titleKey)}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t(descKey)}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FolderOpen size={12} /> {t('dash_recent')}
          </div>
          <Link
            href="/outputs"
            className="text-xs text-brand-700 hover:underline inline-flex items-center gap-1"
          >
            {t('dash_viewSaved')} <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="card divide-y divide-slate-100">
          {mockProjects.map((p) => (
            <Link
              key={p.id}
              href={`/chat?project=${p.id}`}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 grid place-items-center text-slate-500 shrink-0">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm truncate">
                    {b(p.name)}
                  </div>
                  <span className="chip bg-slate-100 text-slate-600">
                    {t(stageDictKey[p.stage])}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {b(p.summary)}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                {b(p.field)}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
