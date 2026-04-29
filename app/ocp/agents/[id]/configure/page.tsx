'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Brain,
  Megaphone,
  Palette,
  Briefcase,
  Wallet,
  Check,
  Linkedin,
  MessageCircle,
  Twitter,
  Mail,
  Globe,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { agents, type AgentId } from '@/lib/ocp-data';
import type { DictKey } from '@/lib/i18n';

const ICON: Record<AgentId, any> = {
  strategy: Brain,
  social: Megaphone,
  designer: Palette,
  bd: Briefcase,
  finance: Wallet,
};

type Autonomy = 'manual' | 'review' | 'auto';
const AUTONOMY: { id: Autonomy; key: DictKey; descKey: DictKey }[] = [
  {
    id: 'manual',
    key: 'ocp_ag_cfg_aut_manual',
    descKey: 'ocp_ag_cfg_aut_manual_d',
  },
  {
    id: 'review',
    key: 'ocp_ag_cfg_aut_review',
    descKey: 'ocp_ag_cfg_aut_review_d',
  },
  { id: 'auto', key: 'ocp_ag_cfg_aut_auto', descKey: 'ocp_ag_cfg_aut_auto_d' },
];

const TONES: { id: string; key: DictKey }[] = [
  { id: 'visionary', key: 'ocp_ag_cfg_tone_visionary' },
  { id: 'technical', key: 'ocp_ag_cfg_tone_technical' },
  { id: 'friendly', key: 'ocp_ag_cfg_tone_friendly' },
  { id: 'bold', key: 'ocp_ag_cfg_tone_bold' },
];

const CHANNELS = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0a66c2' },
  { id: 'wechat', name: 'WeChat', icon: MessageCircle, color: '#07c160' },
  { id: 'x', name: 'X', icon: Twitter, color: '#94a3b8' },
  { id: 'email', name: 'Email', icon: Mail, color: '#a855f7' },
  { id: 'web', name: 'Website', icon: Globe, color: '#22d3ee' },
];

const TRIGGERS: { id: string; key: DictKey }[] = [
  { id: 'schedule', key: 'ocp_ag_cfg_trg_schedule' },
  { id: 'event', key: 'ocp_ag_cfg_trg_event' },
  { id: 'command', key: 'ocp_ag_cfg_trg_command' },
];

const DEFAULT_CHANNELS: Record<AgentId, string[]> = {
  strategy: [],
  social: ['linkedin', 'wechat', 'x'],
  designer: [],
  bd: ['email', 'linkedin'],
  finance: [],
};

const DEFAULT_AUTONOMY: Record<AgentId, Autonomy> = {
  strategy: 'review',
  social: 'auto',
  designer: 'auto',
  bd: 'review',
  finance: 'review',
};

export default function OCPAgentConfigurePage() {
  const { t } = useLang();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const agent = agents.find((a) => a.id === params.id);
  if (!agent) return notFound();
  const Icon = ICON[agent.id];

  const [name, setName] = useState(t(agent.nameKey));
  const [autonomy, setAutonomy] = useState<Autonomy>(
    DEFAULT_AUTONOMY[agent.id]
  );
  const [tone, setTone] = useState('visionary');
  const [channels, setChannels] = useState<string[]>(
    DEFAULT_CHANNELS[agent.id]
  );
  const [trigger, setTrigger] = useState('event');
  const [saved, setSaved] = useState(false);

  function toggleChannel(id: string) {
    setChannels((cur) =>
      cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]
    );
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-[1100px] mx-auto">
        <Link
          href={`/ocp/agents/${agent.id}`}
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={13} />
          {t('ocp_ag_back')}
        </Link>

        {/* Header */}
        <div className="flex items-start gap-3 flex-wrap">
          <div
            className="w-12 h-12 rounded-xl grid place-items-center shrink-0 border"
            style={{
              backgroundColor: agent.color + '1a',
              borderColor: agent.color + '50',
              color: agent.color,
              boxShadow: `0 0 24px -10px ${agent.color}`,
            }}
          >
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {t('ocp_ag_cfg_title')} · {t(agent.nameKey)}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">{t(agent.roleKey)}</p>
          </div>
        </div>

        <ConfigBody
          agent={agent}
          name={name}
          setName={setName}
          autonomy={autonomy}
          setAutonomy={setAutonomy}
          tone={tone}
          setTone={setTone}
          channels={channels}
          toggleChannel={toggleChannel}
          trigger={trigger}
          setTrigger={setTrigger}
          save={save}
          saved={saved}
          onCancel={() => router.push(`/ocp/agents/${agent.id}`)}
        />
      </div>
    </div>
  );
}

function ConfigBody({
  agent,
  name,
  setName,
  autonomy,
  setAutonomy,
  tone,
  setTone,
  channels,
  toggleChannel,
  trigger,
  setTrigger,
  save,
  saved,
  onCancel,
}: {
  agent: (typeof agents)[number];
  name: string;
  setName: (v: string) => void;
  autonomy: Autonomy;
  setAutonomy: (v: Autonomy) => void;
  tone: string;
  setTone: (v: string) => void;
  channels: string[];
  toggleChannel: (id: string) => void;
  trigger: string;
  setTrigger: (v: string) => void;
  save: () => void;
  saved: boolean;
  onCancel: () => void;
}) {
  const { t } = useLang();
  return (
    <div className="space-y-4">
      {/* General */}
      <Section title={t('ocp_ag_cfg_general')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>{t('ocp_ag_cfg_displayName')}</Label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-fuchsia-400/50"
            />
          </div>
          <div>
            <Label>{t('ocp_ag_cfg_role')}</Label>
            <input
              defaultValue={t(agent.roleKey)}
              className="mt-1 w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-fuchsia-400/50"
            />
          </div>
        </div>
      </Section>

      {/* Autonomy */}
      <Section
        title={t('ocp_ag_cfg_autonomy')}
        subtitle={t('ocp_ag_cfg_autonomy_sub')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {AUTONOMY.map((a) => {
            const active = autonomy === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setAutonomy(a.id)}
                className={
                  'text-left p-3 rounded-xl border transition-colors ' +
                  (active
                    ? 'border-fuchsia-400/50 bg-fuchsia-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]')
                }
              >
                <div
                  className={
                    'text-sm font-medium ' +
                    (active ? 'text-fuchsia-200' : 'text-white')
                  }
                >
                  {t(a.key)}
                </div>
                <div className="mt-1 text-[12px] text-slate-400 leading-relaxed">
                  {t(a.descKey)}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Voice & tone */}
      <Section
        title={t('ocp_ag_cfg_voice')}
        subtitle={t('ocp_ag_cfg_voice_sub')}
      >
        <div className="flex flex-wrap gap-2">
          {TONES.map((to) => {
            const active = tone === to.id;
            return (
              <button
                key={to.id}
                onClick={() => setTone(to.id)}
                className={
                  'h-8 px-3 rounded-full text-[12px] border transition-colors ' +
                  (active
                    ? 'bg-fuchsia-500/15 border-fuchsia-400/50 text-fuchsia-200'
                    : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/5')
                }
              >
                {t(to.key)}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Channels */}
      <Section
        title={t('ocp_ag_cfg_channels')}
        subtitle={t('ocp_ag_cfg_channels_sub')}
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            const active = channels.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleChannel(c.id)}
                className={
                  'flex items-center gap-2 p-2.5 rounded-lg border transition-colors ' +
                  (active
                    ? 'border-fuchsia-400/50 bg-fuchsia-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]')
                }
              >
                <span
                  className="w-7 h-7 rounded-md grid place-items-center shrink-0"
                  style={{
                    backgroundColor: c.color + '22',
                    color: c.color,
                  }}
                >
                  <Icon size={12} />
                </span>
                <span className="text-[12.5px] text-slate-100">{c.name}</span>
                {active && (
                  <Check size={12} className="ml-auto text-fuchsia-300" />
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Triggers */}
      <Section
        title={t('ocp_ag_cfg_triggers')}
        subtitle={t('ocp_ag_cfg_triggers_sub')}
      >
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.map((tr) => {
            const active = trigger === tr.id;
            return (
              <button
                key={tr.id}
                onClick={() => setTrigger(tr.id)}
                className={
                  'h-8 px-3 rounded-full text-[12px] border transition-colors ' +
                  (active
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200'
                    : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/5')
                }
              >
                {t(tr.key)}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="h-9 px-4 rounded-lg text-[13px] text-slate-300 border border-white/10 hover:bg-white/5 transition-colors"
        >
          {t('ocp_ag_cfg_cancel')}
        </button>
        <button
          onClick={save}
          className="h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-fuchsia-500/80 border border-fuchsia-400/50 hover:bg-fuchsia-500 transition-colors inline-flex items-center gap-1.5"
        >
          {saved ? <Check size={14} /> : null}
          {saved ? t('ocp_ag_cfg_saved') : t('ocp_ag_cfg_save')}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-sm font-semibold text-white">{title}</div>
      {subtitle && (
        <div className="mt-0.5 text-[12px] text-slate-400">{subtitle}</div>
      )}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-slate-500">
      {children}
    </div>
  );
}
