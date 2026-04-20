'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Upload as UploadIcon,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { UploadFileMeta } from '@/lib/types';

const dataKinds: {
  kind: UploadFileMeta['kind'];
  label: string;
  hint: string;
}[] = [
  { kind: 'payroll', label: '工资表', hint: '月度工资表（.xlsx / .csv）' },
  { kind: 'social_security', label: '社保数据', hint: '社保缴费明细导出' },
  { kind: 'invoice', label: '发票', hint: '增值税发票台账' },
  { kind: 'bank', label: '银行流水', hint: '银行对账单导出' },
  {
    kind: 'tax_declaration',
    label: '纳税申报',
    hint: '增值税 / 企业所得税 申报表',
  },
];

const kindLabels: Record<UploadFileMeta['kind'], string> = {
  payroll: '工资表',
  social_security: '社保数据',
  invoice: '发票',
  bank: '银行流水',
  tax_declaration: '纳税申报',
};

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFileMeta[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  function addFiles(kind: UploadFileMeta['kind'], list: FileList | null) {
    if (!list) return;
    const next: UploadFileMeta[] = Array.from(list).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      kind,
      status: 'uploading',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...next]);
    next.forEach((meta) => simulateUpload(meta.id));
  }

  function simulateUpload(id: string) {
    const tick = () => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id || f.status === 'parsed') return f;
          const p = Math.min(100, f.progress + 10 + Math.random() * 20);
          return {
            ...f,
            progress: p,
            status: p >= 100 ? 'parsed' : 'uploading',
          };
        })
      );
    };
    const interval = setInterval(() => {
      tick();
      setFiles((prev) => {
        const done = prev.find((f) => f.id === id)?.status === 'parsed';
        if (done) clearInterval(interval);
        return prev;
      });
    }, 300);
  }

  function remove(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  const ready = files.length > 0 && files.every((f) => f.status === 'parsed');

  function analyze() {
    setAnalyzing(true);
    setTimeout(() => router.push('/dashboard'), 1200);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold">上传企业数据</h1>
        <p className="text-sm text-slate-500">
          上传 Excel / CSV 导出文件。MVP 阶段数据仅保留在本地。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataKinds.map((k) => (
          <label
            key={k.kind}
            className="card p-5 flex gap-4 cursor-pointer hover:border-brand-500 hover:bg-brand-50/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 grid place-items-center shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{k.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{k.hint}</div>
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-brand-600">
                <UploadIcon size={14} />
                选择文件
              </div>
            </div>
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              multiple
              className="hidden"
              onChange={(e) => addFiles(k.kind, e.target.files)}
            />
          </label>
        ))}
      </div>

      {files.length > 0 && (
        <div className="card">
          <div className="px-5 py-3 border-b border-slate-100 font-medium text-sm">
            已上传文件（{files.length}）
          </div>
          <ul>
            {files.map((f) => (
              <li
                key={f.id}
                className="px-5 py-3 border-b border-slate-100 last:border-0 flex items-center gap-3"
              >
                <FileSpreadsheet
                  size={18}
                  className="text-slate-400 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{f.name}</div>
                  <div className="text-xs text-slate-500">
                    {(f.size / 1024).toFixed(1)} KB · {kindLabels[f.kind]}
                  </div>
                  {f.status === 'uploading' && (
                    <div className="h-1.5 mt-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 transition-all"
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                {f.status === 'parsed' ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <Loader2 size={18} className="text-slate-400 animate-spin" />
                )}
                <button
                  onClick={() => remove(f.id)}
                  className="text-slate-400 hover:text-red-500"
                  aria-label="移除"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={analyze}
          disabled={!ready || analyzing}
          className="btn-primary"
        >
          {analyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              分析中…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              运行 AI 风险分析
            </>
          )}
        </button>
      </div>
    </div>
  );
}
