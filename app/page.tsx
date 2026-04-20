'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { signIn } from '@/lib/auth';

// Single-tenant credentials. Update these values to change the login.
const ACCOUNT_EMAIL = 'admin@limai.cn';
const ACCOUNT_PASSWORD = 'Limai@2026';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim();
    if (normalizedEmail !== ACCOUNT_EMAIL || password !== ACCOUNT_PASSWORD) {
      setError('邮箱或密码错误，请重试。');
      return;
    }
    signIn(normalizedEmail);
    setLoading(true);
    setTimeout(() => router.push('/dashboard'), 500);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white/15 grid place-items-center">
            <ShieldCheck size={20} />
          </div>
          <div className="font-semibold">力迈 AI</div>
        </div>
        <div>
          <h1 className="text-3xl font-semibold leading-tight mb-4">
            AI 驱动的中小企业税务风险检测
          </h1>
          <p className="text-white/80 max-w-md">
            自动识别工资与社保不一致、无票支出、税负异常和账实不符问题 ——
            附法规依据与整改建议。
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            <li>• 规则引擎自动扫描，LLM 输出专业解释</li>
            <li>• 一键生成审计级 PDF 报告</li>
            <li>• 专为财务经理与税务顾问打造</li>
          </ul>
        </div>
        <div className="text-xs text-white/60">
          © 2026 力迈 AI · 企业税务风险智能检测平台
        </div>
      </div>

      <div className="flex items-center justify-center p-6 bg-slate-50">
        <form onSubmit={submit} className="card p-8 w-full max-w-sm space-y-5">
          <div>
            <div className="text-xs tracking-wide text-slate-400">登录</div>
            <h2 className="text-xl font-semibold">欢迎回来</h2>
            <p className="text-sm text-slate-500 mt-1">
              请输入管理员邮箱与密码以继续。
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600">邮箱</label>
              <input
                className="input mt-1"
                type="email"
                autoComplete="email"
                placeholder="admin@limai.cn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">密码</label>
              <input
                className="input mt-1"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && (
            <div
              role="alert"
              className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading ? '登录中…' : '登录'}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
