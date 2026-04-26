'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User2 } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import {
  pipelineStages,
  pipelineStageDictKey,
  type EnterpriseProject,
  type PipelineStage,
} from '@/lib/enterprise-data';

const STAGE_TONE: Record<PipelineStage, string> = {
  submitted: 'border-slate-200',
  evaluation: 'border-amber-300',
  high_potential: 'border-brand-300',
  matching: 'border-blue-300',
  negotiation: 'border-fuchsia-300',
  completed: 'border-emerald-300',
};

const STAGE_DOT: Record<PipelineStage, string> = {
  submitted: 'bg-slate-400',
  evaluation: 'bg-amber-500',
  high_potential: 'bg-brand-500',
  matching: 'bg-blue-500',
  negotiation: 'bg-fuchsia-500',
  completed: 'bg-emerald-500',
};

type Props = {
  projects: EnterpriseProject[];
  onMove: (id: string, target: PipelineStage) => void;
};

export default function PipelineKanban({ projects, onMove }: Props) {
  const { t, b } = useLang();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<PipelineStage | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {pipelineStages.map((stage) => {
        const items = projects.filter((p) => p.pipeline === stage);
        const isDropTarget = dragOver === stage;
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(stage);
            }}
            onDragLeave={() => setDragOver((s) => (s === stage ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) onMove(dragId, stage);
              setDragId(null);
              setDragOver(null);
            }}
            className={
              'flex flex-col rounded-xl border bg-white min-h-[420px] transition-colors ' +
              STAGE_TONE[stage] +
              (isDropTarget ? ' ring-2 ring-brand-400/60 bg-brand-50/40' : '')
            }
          >
            <div className="px-3 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className={'w-2 h-2 rounded-full ' + STAGE_DOT[stage]} />
                <div className="text-xs font-semibold text-slate-700 truncate">
                  {t(pipelineStageDictKey[stage])}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{items.length}</span>
            </div>

            <div className="px-2 pb-2 flex-1 space-y-2 overflow-y-auto">
              {items.length === 0 && (
                <div className="text-[11px] text-slate-400 italic px-2 py-6 text-center">
                  {t('ep_emptyStage')}
                </div>
              )}
              {items.map((p) => (
                <Link
                  key={p.id}
                  href={`/enterprise/projects/${p.id}`}
                  draggable
                  onDragStart={() => setDragId(p.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setDragOver(null);
                  }}
                  className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-brand-300 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all"
                >
                  <div className="text-xs font-semibold text-ink-900 line-clamp-2 leading-snug">
                    {b(p.name)}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
                    <User2 size={10} />
                    <span className="truncate">{b(p.scientist)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="chip bg-slate-50 text-slate-600 text-[10px] truncate">
                      {b(p.industry)}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] shrink-0">
                      <span className="chip bg-slate-100 text-slate-600">TRL {p.trl}</span>
                      <span
                        className={
                          'chip ' +
                          (p.score >= 85
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.score >= 70
                              ? 'bg-brand-50 text-brand-700'
                              : 'bg-amber-50 text-amber-700')
                        }
                      >
                        {p.score}
                      </span>
                    </div>
                  </div>
                  {p.evaluator && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 truncate">
                      {t('ep_evaluator')}: {b(p.evaluator)}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
