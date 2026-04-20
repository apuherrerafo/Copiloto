'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { APP_NAME, APP_TAGLINE } from '@/lib/brand';
import { useAppLoading } from '@/contexts/app-loading';
import HypoSplashHero from '@/components/ui/HypoSplashHero';
import HypoWalkStrip from '@/components/ui/HypoWalkStrip';
import LoginSplash from '@/components/ui/LoginSplash';

const showGoogle = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === 'true';

export default function EntrarPage() {
  const { show: showLoader, hide: hideLoader } = useAppLoading();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [splash, setSplash] = useState(false);
  const [splashName, setSplashName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    if (u.get('creado') === '1') setSuccess('Account created! Sign in with your email and password.');
  }, []);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setSuccess('');
    setBusy(true);
    showLoader({
      title: 'Signing you in…',
      subtitle: 'Verifying your account. One moment.',
    });
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        hideLoader();
        setErr('Incorrect email or password. Check and try again.');
        setBusy(false);
        return;
      }
      hideLoader();
      const local = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
      setSplashName(local || undefined);
      setSplash(true);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2200);
    } catch {
      hideLoader();
      setErr('Couldn’t sign in. Check your connection.');
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setErr('');
    setBusy(true);
    showLoader({
      title: 'Connecting to Google…',
      subtitle: 'You may be redirected to complete sign-in.',
    });
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch {
      hideLoader();
      setErr('Couldn’t open Google. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatePresence>
        {splash ? <LoginSplash key="login-splash" name={splashName} /> : null}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col flex-1 min-h-screen"
      >
        <div className="relative h-[44vh] min-h-[240px] w-full overflow-hidden bg-ink/5">
          <HypoSplashHero />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 pt-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sage mb-2 drop-shadow-sm">
              {APP_NAME}
            </p>
            <p className="font-serif italic text-2xl text-ink leading-tight drop-shadow-sm">Gentle rhythm, day by day</p>
            <p className="text-sm text-muted mt-2 max-w-sm leading-relaxed drop-shadow-sm">
              {APP_TAGLINE}
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full max-w-md mx-auto px-6 py-1 pointer-events-none">
          <HypoWalkStrip mascotSize={76} edgeInset={8} duration={15} direction="ltr" />
        </div>

        <div className="flex-1 px-6 pt-2 pb-10 flex flex-col justify-end gap-2 max-w-md mx-auto w-full">
          <AnimatePresence>
            {success ? (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-sage text-center font-medium py-1"
              >
                {success}
              </motion.p>
            ) : null}
            {err ? (
              <motion.p
                key="err"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-coral text-center py-1"
              >
                {err}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <form onSubmit={(e) => void handleCredentials(e)} className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
              placeholder="you@email.com"
            />
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
            />
            <motion.button
              type="submit"
              disabled={busy}
              whileTap={{ scale: busy ? 1 : 0.98 }}
              className="w-full rounded-2xl bg-ink py-3.5 text-sm font-semibold text-white shadow-soft hover:opacity-95 transition-opacity disabled:opacity-50 mt-1"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </motion.button>
          </form>

          <p className="text-xs text-muted text-center pt-1">
            First time here?{' '}
            <Link href="/registro" className="font-semibold text-ink underline-offset-2 hover:underline">
              Create account
            </Link>
          </p>

          {showGoogle ? (
            <>
              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-hairline" />
                <span className="text-[10px] text-muted uppercase tracking-wider">or</span>
                <span className="h-px flex-1 bg-hairline" />
              </div>
              <motion.button
                type="button"
                disabled={busy}
                whileTap={{ scale: busy ? 1 : 0.98 }}
                onClick={() => void handleGoogle()}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white border border-hairline py-3.5 text-sm font-semibold text-ink shadow-soft hover:bg-surface transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {busy ? 'Opening Google…' : 'Continue with Google'}
              </motion.button>
            </>
          ) : null}

          <p className="text-[10px] text-muted/80 text-center leading-relaxed pt-1">
            HypoCopilot helps with habits and education: it does not diagnose or change medication. By continuing you
            accept the notices you’ll see after signing in. Your data may sync to the cloud if your account allows it.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
