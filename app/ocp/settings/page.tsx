'use client';

import { useState } from 'react';
import {
  Building,
  Bot,
  Plug,
  AlertTriangle,
  Brain,
  Megaphone,
  Palette,
  Briefcase,
  Wallet,
  Linkedin,
  MessageCircle,
  Twitter,
  Mail,
  Check,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { agents, company, type AgentId } from '@/lib/ocp-data';

const ICON: Record<AgentId, any> = {
  strategy: Brain,
  social: Megaphone,
  designer: Palette,
  bd: Briefcase,
  finance: Wallet,
};

const INTEGRATIONS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0a66c2',
    connected: true,
  },
  {
    id: 'wechat',
    name: 'WeChat',
    icon: MessageCircle,
    color: '#07c160',
    connected: true,
  },
  { id: 'x', name: 'X', icon: Twitter, color: '#94a3b8', connected: false },
  { id: 'email', name: 'Email', icon: Mail, color: '#a855f7', connected: true },
];

export default function OCPSettingsPage() {
  const { t, b } = useLang();
  const [perms, setPerms] = useState<Record<AgentId, 'auto' | 'review'>>({
    strategy: 'review',
    social: 'auto',
    designer: 'auto',
    bd: 'review',
    finance: 'review',
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-[1100px] mx-auto">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {t('ocp_se_title')}
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            {t('ocp_se_sub')}
          </p>
        </div>

        {/* Company */}
        <Section icon={Building} title={t('ocp_se_company')}>
          <Field label={t('ocp_se_company_name')} value={b(company.name)} />
          <Field label={t('ocp_se_company_stage')} value={b(company.stage)} />
          <Field
            label={t('ocp_se_company_industry')}
            value={t('ocp_se_company_industry_value')}
          />
        </Section>

        {/* Agents */}
        <Section
          icon={Bot}
          title={t('ocp_se_agents')}
          subtitle={t('ocp_se_agents_sub')}
        >
          <ul className="divide-y divide-white/5">
            {agents.map((a) => {
              const Icon = ICON[a.id];
              const cur = perms[a.id];
              return (
                <li
                  key={a.id}
                  className="py-3 flex items-center gap-3 first:pt-0 last:pb-0"
                >
                  <div
                    className="w-9 h-9 rounded-lg grid place-items-center border shrink-0"
                    style={{
                      backgroundColor: a.color + '1a',
                      borderColor: a.color + '40',
                      color: a.color,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white">
                      {t(a.nameKey)}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {t(a.roleKey)}
                    </div>
                  </div>
                  <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
                    {(['auto', 'review'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() =>
                          setPerms((p) => ({ ...p, [a.id]: mode }))
                        }
                        className={
                          'px-3 py-1 text-[11px] rounded-md transition-colors ' +
                          (cur === mode
                            ? 'bg-white/10 text-white'
                            : 'text-slate-400 hover:text-slate-200')
                        }
                      >
                        {t(
                          mode === 'auto'
                            ? 'ocp_se_perm_auto'
                            : 'ocp_se_perm_review'
                        )}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* Integrations */}
        <Section
          icon={Plug}
          title={t('ocp_se_integrations')}
          subtitle={t('ocp_se_integrations_sub')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INTEGRATIONS.map((i) => {
              const Icon = i.icon;
              return (
                <div
                  key={i.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.02]"
                >
                  <div
                    className="w-9 h-9 rounded-lg grid place-items-center"
                    style={{
                      backgroundColor: i.color + '22',
                      color: i.color,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0 text-sm font-medium text-white">
                    {i.name}
                  </div>
                  {i.connected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30 bg-emerald-500/10">
                      <Check size={11} />
                      {t('ocp_se_int_connected')}
                    </span>
                  ) : (
                    <button className="text-[11px] text-fuchsia-300 px-2 py-0.5 rounded-md border border-fuchsia-400/30 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 transition-colors">
                      {t('ocp_se_int_connect')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Danger zone */}
        <Section icon={AlertTriangle} title={t('ocp_se_danger')} danger>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DangerCard
              title={t('ocp_se_danger_pause')}
              desc={t('ocp_se_danger_pause_desc')}
            />
            <DangerCard
              title={t('ocp_se_danger_reset')}
              desc={t('ocp_se_danger_reset_desc')}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  danger,
  children,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        'rounded-2xl border p-5 ' +
        (danger
          ? 'border-rose-400/30 bg-rose-500/[0.04]'
          : 'border-white/10 bg-white/[0.02]')
      }
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className={
            'w-9 h-9 rounded-lg grid place-items-center border shrink-0 ' +
            (danger
              ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
              : 'bg-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-300')
          }
        >
          <Icon size={14} />
        </div>
        <div className="min-w-0">
          <div className="text-base font-semibold text-white">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-[12.5px] text-slate-400">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
      <span className="text-[12.5px] text-slate-500">{label}</span>
      <span className="text-sm text-slate-100">{value}</span>
    </div>
  );
}

function DangerCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-rose-400/20 bg-rose-500/5 p-4">
      <div className="text-sm font-semibold text-rose-200">{title}</div>
      <div className="mt-1 text-[12.5px] text-slate-400">{desc}</div>
      <button className="mt-3 h-8 px-3 rounded-md text-[12px] font-medium text-rose-200 border border-rose-400/40 hover:bg-rose-500/10 transition-colors">
        {title}
      </button>
    </div>
  );
}
