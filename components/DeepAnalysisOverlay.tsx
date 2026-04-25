'use client';

import { Check, Loader2, Sparkles, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { deepAnalysisSteps } from '@/lib/mock-data';

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
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-20 bg-white/85 backdrop-blur-sm grid place-items-center animate-fade-in">
      <div className="card max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-fuchsia-500 text-white grid place-items-center">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="font-semibold text-sm">Deep Analysis</div>
            <div className="text-[11px] text-slate-500">
              {done
                ? 'Analysis complete'
                : 'Running multi-agent research pipeline…'}
            </div>
          </div>
        </div>

        <ul className="space-y-2.5">
          {deepAnalysisSteps.map((s, i) => {
            const status =
              i < stepIndex || done
                ? 'done'
                : i === stepIndex
                  ? 'active'
                  : 'pending';
            return (
              <li key={s.key} className="flex items-center gap-3 text-sm">
                <span
                  className={
                    'w-5 h-5 rounded-full grid place-items-center shrink-0 ' +
                    (status === 'done'
                      ? 'bg-emerald-500 text-white'
                      : status === 'active'
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-slate-100 text-slate-400')
                  }
                >
                  {status === 'done' ? (
                    <Check size={12} />
                  ) : status === 'active' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                </span>
                <span
                  className={
                    status === 'pending' ? 'text-slate-400' : 'text-slate-700'
                  }
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>

        {done && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-sm">
              <FileText size={14} className="text-brand-600" />
              <span className="font-medium">
                Full AI Report Generated
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/outputs?tab=report" className="btn-accent">
                <Download size={14} /> Download PDF
              </Link>
              <Link href="/outputs?tab=deck" className="btn-outline">
                Export Pitch Deck
              </Link>
              <button onClick={onClose} className="btn-ghost">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
