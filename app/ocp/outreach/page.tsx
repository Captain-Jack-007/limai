'use client';

import {
  Plus,
  Briefcase,
  Building2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { leads, type LeadKind, type LeadStatus } from '@/lib/ocp-data';
import type { DictKey } from '@/lib/i18n';

const KIND_KEY: Record<LeadKind, DictKey> = {
  investor: 'ocp_ou_kind_investor',
  partner: 'ocp_ou_kind_partner',
  customer: 'ocp_ou_kind_customer',
};

const KIND_ICON: Record<LeadKind, any> = {
  investor: Briefcase,
  partner: Building2,
  customer: Users,
};

const KIND_TONE: Record<LeadKind, string> = {
  investor: 'text-amber-300 bg-amber-500/10 border-amber-400/30',
  partner: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/30',
  customer: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
};

const STATUS_KEY: Record<LeadStatus, DictKey> = {
  new: 'ocp_ou_status_new',
  contacted: 'ocp_ou_status_contacted',
  meeting: 'ocp_ou_status_meeting',
  negotiating: 'ocp_ou_status_negotiating',
  passed: 'ocp_ou_status_passed',
};

const STATUS_TONE: Record<LeadStatus, string> = {
  new: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
  contacted: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/30',
  meeting: 'text-violet-300 bg-violet-500/10 border-violet-400/30',
  negotiating: 'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-400/30',
  passed: 'text-slate-500 bg-slate-500/5 border-slate-600/30',
};

const STAGES: LeadStatus[] = [
  'new',
  'contacted',
  'meeting',
  'negotiating',
  'passed',
];

export default function OCPOutreachPage() {
  const { t, b } = useLang();

  const counts = STAGES.map((s) => leads.filter((l) => l.status === s).length);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {t('ocp_ou_title')}
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              {t('ocp_ou_sub')}
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={14} />
            {t('ocp_ou_addLead')}
          </button>
        </div>

        {/* Pipeline summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STAGES.map((s, i) => (
            <div
              key={s}
              className={
                'rounded-xl border p-3 ' +
                STATUS_TONE[s].replace('text-', 'border-l-4 border-l-').split(' ')[0]
              }
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                {t(STATUS_KEY[s])}
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-white">
                {counts[i]}
              </div>
            </div>
          ))}
        </div>

        {/* Leads list */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500">
            <span>{t('ocp_ou_title')}</span>
            <span>{leads.length}</span>
          </div>
          <ul className="divide-y divide-white/5">
            {leads.map((l) => {
              const KIcon = KIND_ICON[l.kind];
              return (
                <li
                  key={l.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div
                    className={
                      'w-9 h-9 rounded-lg grid place-items-center border shrink-0 ' +
                      KIND_TONE[l.kind]
                    }
                  >
                    <KIcon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white truncate">
                        {b(l.name)}
                      </span>
                      <span className="text-[12px] text-slate-500">
                        · {b(l.org)}
                      </span>
                      <span
                        className={
                          'text-[10px] px-1.5 py-0.5 rounded border ' +
                          KIND_TONE[l.kind]
                        }
                      >
                        {t(KIND_KEY[l.kind])}
                      </span>
                    </div>
                    <div className="mt-1 text-[12px] text-slate-400">
                      <span className="text-slate-500">
                        {t('ocp_ou_nextStep')}:
                      </span>{' '}
                      {b(l.nextStep)}
                    </div>
                  </div>
                  <span
                    className={
                      'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ' +
                      STATUS_TONE[l.status]
                    }
                  >
                    {t(STATUS_KEY[l.status])}
                  </span>
                  <ChevronRight size={14} className="text-slate-600 shrink-0" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
