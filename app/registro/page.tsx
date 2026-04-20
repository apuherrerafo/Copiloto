'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { APP_NAME } from '@/lib/brand';
import HypoSplashHero from '@/components/ui/HypoSplashHero';

export default function RegistroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? 'No se pudo crear la cuenta');
        setBusy(false);
        return;
      }
      window.location.href = '/entrar?creado=1';
    } catch {
      setErr('Error de red. Intenta de nuevo.');
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col flex-1 min-h-screen"
      >
        <div className="relative h-[40vh] min-h-[220px] w-full overflow-hidden bg-ink/5">
          <HypoSplashHero />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 pt-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sage mb-2 drop-shadow-sm">
              {APP_NAME}
            </p>
            <p className="font-serif italic text-xl text-ink leading-tight drop-shadow-sm">Crear cuenta</p>
          </div>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex-1 px-6 pt-4 pb-10 flex flex-col gap-3 max-w-md mx-auto w-full"
        >
          {err ? <p className="text-xs text-coral text-center">{err}</p> : null}
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Correo</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
            placeholder="tu@correo.com"
          />
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Contraseña (mín. 8)</label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
          />
          <motion.button
            type="submit"
            disabled={busy}
            whileTap={{ scale: busy ? 1 : 0.98 }}
            className="w-full rounded-2xl bg-ink py-3.5 text-sm font-semibold text-white shadow-soft hover:opacity-95 transition-opacity disabled:opacity-50 mt-2"
          >
            {busy ? 'Creando…' : 'Crear cuenta'}
          </motion.button>
          <p className="text-xs text-muted text-center pt-2">
            ¿Ya tienes cuenta?{' '}
            <Link href="/entrar" className="font-semibold text-ink underline-offset-2 hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
