'use client';

import { Settings } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';

export default function EnterpriseSettingsPage() {
  const { t } = useLang();
  return (
    <div className="max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('ent_nav_settings')}</h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">{t('ent_brand_tagline')}</p>
      </div>
      <div className="card p-12 mt-6 text-center text-slate-400 text-sm">
        <Settings size={28} className="mx-auto mb-3 text-slate-300" />
        {t('loading')}
      </div>
    </div>
  );
}
