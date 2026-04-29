'use client';

import {
  Plus,
  Megaphone,
  Linkedin,
  MessageCircle,
  Twitter,
  CheckCircle2,
  Clock,
  FileEdit,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { campaigns, type Channel, type PostStatus } from '@/lib/ocp-data';
import type { DictKey } from '@/lib/i18n';

const CH_ICON: Record<Channel, any> = {
  LinkedIn: Linkedin,
  WeChat: MessageCircle,
  X: Twitter,
};

const CH_COLOR: Record<Channel, string> = {
  LinkedIn: '#0a66c2',
  WeChat: '#07c160',
  X: '#94a3b8',
};

const STATUS_KEY: Record<PostStatus, DictKey> = {
  published: 'ocp_co_status_published',
  scheduled: 'ocp_co_status_scheduled',
  draft: 'ocp_co_status_draft',
};

const STATUS_ICON: Record<PostStatus, any> = {
  published: CheckCircle2,
  scheduled: Clock,
  draft: FileEdit,
};

const STATUS_TONE: Record<PostStatus, string> = {
  published: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
  scheduled: 'text-amber-300 bg-amber-500/10 border-amber-400/30',
  draft: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

export default function OCPContentPage() {
  const { t, b } = useLang();
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {t('ocp_co_title')}
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              {t('ocp_co_sub')}
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={14} />
            {t('ocp_co_newCampaign')}
          </button>
        </div>

        <div className="space-y-4">
          {campaigns.map((c) => {
            const statusKey =
              c.status === 'running'
                ? 'ocp_co_status_running'
                : c.status === 'scheduled'
                  ? 'ocp_co_status_scheduled'
                  : 'ocp_co_status_draft';
            const statusTone =
              c.status === 'running'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                : c.status === 'scheduled'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                  : 'bg-slate-500/15 text-slate-400 border-slate-500/30';
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-400/30 grid place-items-center text-fuchsia-300 shrink-0">
                      <Megaphone size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-white">
                        {b(c.name)}
                      </div>
                      <div className="text-[12px] text-slate-500 mt-0.5">
                        {c.posts.length} {t('ocp_co_posts').toLowerCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Stat label={t('ocp_co_reach')} value={c.reach.toLocaleString()} />
                    <Stat label={t('ocp_co_clicks')} value={c.clicks.toLocaleString()} />
                    <Stat
                      label={t('ocp_co_leads')}
                      value={c.leads.toLocaleString()}
                      accent="text-fuchsia-300"
                    />
                    <span
                      className={
                        'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ' +
                        statusTone
                      }
                    >
                      {t(statusKey)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {c.posts.map((p, i) => {
                    const ChIcon = CH_ICON[p.channel];
                    const StIcon = STATUS_ICON[p.status];
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-lg border border-white/5 bg-white/[0.02]"
                      >
                        <div
                          className="w-8 h-8 rounded-md grid place-items-center shrink-0"
                          style={{
                            backgroundColor: CH_COLOR[p.channel] + '22',
                            color: CH_COLOR[p.channel],
                          }}
                        >
                          <ChIcon size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] text-slate-100 truncate">
                            {b(p.title)}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{p.channel}</span>
                            <span>·</span>
                            <span>{b(p.when)}</span>
                          </div>
                        </div>
                        <span
                          className={
                            'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border shrink-0 ' +
                            STATUS_TONE[p.status]
                          }
                        >
                          <StIcon size={9} />
                          {t(STATUS_KEY[p.status])}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={'text-sm font-semibold tabular-nums ' + (accent || 'text-slate-100')}>
        {value}
      </div>
    </div>
  );
}
