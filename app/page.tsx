'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  FlaskConical,
  Rocket,
  Users,
} from 'lucide-react';
import { signIn } from '@/lib/auth';

const ACCOUNT_EMAIL = 'admin@scibridge.ai';
const ACCOUNT_PASSWORD = 'SciBridge@2026';

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
      setError('Incorrect email or password. Please try again.');
      return;
    }
    signIn(normalizedEmail);
    setLoading(true);
    setTimeout(() => router.push('/dashboard'), 400);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-ink-900 text-white">
      <div className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(60% 50% at 20% 10%, rgba(124,58,237,0.55) 0%, transparent 60%), radial-gradient(40% 40% at 90% 90%, rgba(217,70,239,0.35) 0%, transparent 60%)',
          }}
        />
        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/10 ring-1 ring-white/15 grid place-items-center">
            <Sparkles size={18} />
          </div>
          <div className="font-semibold tracking-tight">Sci-Bridge Agent</div>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-semibold leading-tight mb-4">
            ChatGPT for scientific{' '}
            <span className="gradient-text">commercialization</span>
          </h1>
          <p className="text-white/70 max-w-md">
            Upload your research, chat with the agent, and instantly receive
            structured evaluation, investor matches, and a generated pitch deck.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <FlaskConical size={14} className="text-brand-400" /> TRL & market
              scoring from a single PDF
            </li>
            <li className="flex items-center gap-2">
              <Users size={14} className="text-brand-400" /> Investor matching
              across global VCs
            </li>
            <li className="flex items-center gap-2">
              <Rocket size={14} className="text-brand-400" /> One-click pitch
              deck and roadmap export
            </li>
          </ul>
        </div>
        <div className="relative text-xs text-white/40">
          © 2026 Sci-Bridge · Research → Market, in minutes
        </div>
      </div>

      <div className="flex items-center justify-center p-6 bg-white text-ink-900">
        <form onSubmit={submit} className="card p-8 w-full max-w-sm space-y-5">
          <div>
            <div className="text-xs tracking-widest text-brand-600 font-medium uppercase">
              Sign in
            </div>
            <h2 className="text-xl font-semibold mt-1">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your credentials to continue to the agent workspace.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Email
              </label>
              <input
                className="input mt-1"
                type="email"
                autoComplete="email"
                placeholder="admin@scibridge.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Password
              </label>
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
            className="btn-accent w-full justify-center"
          >
            {loading ? 'Signing in…' : 'Continue'}
            <ArrowRight size={16} />
          </button>
          <div className="text-[11px] text-slate-400 text-center">
            Demo: admin@scibridge.ai / SciBridge@2026
          </div>
        </form>
      </div>
    </div>
  );
}
