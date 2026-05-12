'use client';

import { Check, Loader2, Zap, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { deepAnalysisSteps } from '@/lib/mock-data';
import { useLang } from '@/components/LanguageProvider';

export default function DeepAnalysisOverlay({
  open,
  stepIndex,
  done,
  onClose,
}: {
  open: boolean;
  stepIndex: number;
  done: boolean;
  onClose: () => void;
}) {
  const { t, b } = useLang();
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-20 grid place-items-center animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="max-w-md w-full p-6 rounded-2xl shadow-2xl"
        style={{
          background: '#0f0f11',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 0 30px rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-8 h-8 rounded-lg grid place-items-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <Zap size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </div>
          <div>
            <div className="font-semibold text-sm text-white">{t('da_title')}</div>
            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {done ? t('da_done') : t('da_running')}
            </div>
          </div>
        </div>

        <ul className="space-y-2.5">
          {deepAnalysisSteps.map((s, i) => {
            const status =
              i < stepIndex || done ? 'done' : i === stepIndex ? 'active' : 'pending';
            return (
              <li key={s.key} className="flex items-center gap-3 text-sm">
                <span
                  className="w-5 h-5 rounded-full grid place-items-center shrink-0"
                  style={{
                    background:
                      status === 'done'
                        ? 'rgba(52,211,153,0.2)'
                        : status === 'active'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(255,255,255,0.04)',
                    color:
                      status === 'done'
                        ? '#34d399'
                        : status === 'active'
                        ? 'rgba(255,255,255,0.9)'
                        : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {status === 'done' ? (
                    <Check size={11} />
                  ) : status === 'active' ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                    />
                  )}
                </span>
                <span
                  style={{
                    color: status === 'pending' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.9)',
                  }}
                >
                  {b(s.label)}
                </span>
              </li>
            );
          })}
        </ul>

        {done && (
          <div
            className="mt-5 pt-4 space-y-2 animate-fade-in"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2 text-sm text-white">
              <FileText size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span className="font-medium">{t('da_reportReady')}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/outputs?tab=report"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-black transition-opacity hover:opacity-90"
                style={{ background: '#fff' }}
              >
                <Download size={14} /> {t('da_downloadPdf')}
              </Link>
              <Link
                href="/outputs?tab=deck"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {t('da_exportDeck')}
              </Link>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
