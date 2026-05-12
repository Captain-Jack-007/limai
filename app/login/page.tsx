'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, FlaskConical, Rocket, Users } from 'lucide-react';
import { signIn } from '@/lib/auth';
import { useLang } from '@/components/LanguageProvider';

const ACCOUNT_EMAIL = 'admin@scibridge.ai';
const ACCOUNT_PASSWORD = 'SciBridge@2026';

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim();
    if (normalizedEmail !== ACCOUNT_EMAIL || password !== ACCOUNT_PASSWORD) {
      setError(t('login_invalidCreds'));
      return;
    }
    signIn(normalizedEmail);
    setLoading(true);
    setTimeout(() => router.push('/dashboard'), 400);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2" style={{ background: '#0a0a0c' }}>

      {/* Left: Brand */}
      <div
        className="hidden md:flex flex-col justify-between p-10"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl grid place-items-center"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <FlaskConical size={18} className="text-white" />
            </div>
            <div className="font-semibold tracking-tight text-white">{t('login_brand')}</div>
          </div>
          <div
            role="group"
            aria-label="Language"
            className="flex items-center rounded-lg p-0.5 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <button
              type="button"
              onClick={() => setLang('en')}
              className="px-2 py-1 rounded-md transition-colors"
              style={{
                background: lang === 'en' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: lang === 'en' ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('zh')}
              className="px-2 py-1 rounded-md transition-colors"
              style={{
                background: lang === 'zh' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: lang === 'zh' ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            >
              中文
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-semibold leading-tight mb-4 text-white">
            {t('login_h1_a')} {t('login_h1_b')}
          </h1>
          <p className="max-w-md" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {t('login_sub')}
          </p>
          <ul className="mt-6 space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <li className="flex items-center gap-2">
              <FlaskConical size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
              {t('login_b1')}
            </li>
            <li className="flex items-center gap-2">
              <Users size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
              {t('login_b2')}
            </li>
            <li className="flex items-center gap-2">
              <Rocket size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
              {t('login_b3')}
            </li>
          </ul>
        </div>

        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {t('login_footer')}
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-6">
        <form
          onSubmit={submit}
          className="relative glow-border rounded-2xl w-full max-w-sm space-y-5 p-8"
          style={{ background: '#111113' }}
        >
          <div>
            <div
              className="text-xs tracking-widest font-medium uppercase"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {t('login_signIn')}
            </div>
            <h2 className="text-xl font-semibold mt-1 text-white">{t('login_welcome')}</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('login_enterCreds')}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {t('login_email')}
              </label>
              <div
                className="relative glow-border glow-border-focus rounded-xl mt-1"
                style={{ background: '#0a0a0c' }}
              >
                <input
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-transparent placeholder:text-white/35"
                  style={{ color: '#fff', caretColor: '#fff' }}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@scibridge.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {t('login_password')}
              </label>
              <div
                className="relative glow-border glow-border-focus rounded-xl mt-1"
                style={{ background: '#0a0a0c' }}
              >
                <input
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-transparent placeholder:text-white/35"
                  style={{ color: '#fff', caretColor: '#fff' }}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="text-xs rounded-lg px-3 py-2"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: 'rgba(252,165,165,0.9)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ background: '#fff', color: '#0a0a0c' }}
          >
            {loading ? t('login_signingIn') : t('login_continue')}
            <ArrowRight size={16} />
          </button>

          <div
            className="rounded-lg px-4 py-3 mt-1 text-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <span className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'en' ? 'Demo account' : '演示账号'}
            </span>
            <span className="block text-sm font-semibold text-white">admin@scibridge.ai</span>
            <span className="block text-sm font-semibold text-white">SciBridge@2026</span>
          </div>
        </form>
      </div>
    </div>
  );
}
