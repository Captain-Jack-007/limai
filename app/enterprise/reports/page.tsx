'use client';

import {
  ArrowUpRight,
  BarChart3,
  Crown,
  CalendarRange,
  ScrollText,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import type { DictKey } from '@/lib/i18n';

type Report = {
  id: string;
  titleKey: DictKey;
  descKey: DictKey;
  icon: any;
  tone: string;
};

const reports: Report[] = [
  {
    id: 'top10',
    titleKey: 'rp_card_top10_title',
    descKey: 'rp_card_top10_desc',
    icon: Crown,
    tone: 'from-amber-100 to-amber-50 text-amber-700',
  },
  {
    id: 'industry',
    titleKey: 'rp_card_industry_title',
    descKey: 'rp_card_industry_desc',
    icon: BarChart3,
    tone: 'from-brand-100 to-brand-50 text-brand-700',
  },
  {
    id: 'monthly',
    titleKey: 'rp_card_monthly_title',
    descKey: 'rp_card_monthly_desc',
    icon: CalendarRange,
    tone: 'from-blue-100 to-blue-50 text-blue-700',
  },
  {
    id: 'policy',
    titleKey: 'rp_card_policy_title',
    descKey: 'rp_card_policy_desc',
    icon: ScrollText,
    tone: 'from-emerald-100 to-emerald-50 text-emerald-700',
  },
];

export default function ReportsPage() {
  const { t } = useLang();
  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('rp_title')}</h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">{t('rp_subhead')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.id} className="card p-6 flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl grid place-items-center bg-gradient-to-br shrink-0 ${r.tone}`}
              >
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold">{t(r.titleKey)}</div>
                <p className="mt-1 text-sm text-slate-500">{t(r.descKey)}</p>
                <button className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
                  {t('rp_open')}
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
