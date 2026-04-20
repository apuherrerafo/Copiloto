'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { APP_NAME } from '@/lib/brand';
import HypoSplashHero from '@/components/ui/HypoSplashHero';

const USERNAME_RE = /^[a-z0-9_]{1,10}$/;

function usernameHint(value: string): string | null {
  if (!value) return null;
  if (value.length > 10) return 'Máximo 10 caracteres';
  if (!/^[a-z0-9_]+$/.test(value)) return 'Solo letras minúsculas, números o _';
  return null;
}

export default function RegistroPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const userHint = usernameHint(username);
  const userOk = USERNAME_RE.test(username);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userOk) {
      setErr('El nombre de usuario no cumple los requisitos.');
      return;
    }
    setErr('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
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
        <div className="relative h-[38vh] min-h-[200px] w-full overflow-hidden bg-ink/5">
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
          className="flex-1 px-6 pt-4 pb-10 flex flex-col gap-2 max-w-md mx-auto w-full"
        >
          <AnimatePresence>
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

          {/* Username */}
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">
            Nombre de usuario <span className="text-muted/60 normal-case font-normal">(máx. 10 chars)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              maxLength={10}
              className={`w-full rounded-2xl border px-4 py-3 text-sm text-ink bg-white transition-colors ${
                username && !userOk ? 'border-coral' : username && userOk ? 'border-sage' : 'border-hairline'
              }`}
              placeholder="miusuario"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted tabular-nums">
              {username.length}/10
            </span>
          </div>
          <AnimatePresence>
            {userHint ? (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-coral -mt-1"
              >
                {userHint}
              </motion.p>
            ) : username && userOk ? (
              <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-sage -mt-1">
                Nombre de usuario disponible para validar
              </motion.p>
            ) : null}
          </AnimatePresence>

          {/* Email */}
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">Correo</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
            placeholder="tu@correo.com"
          />

          {/* Password */}
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">
            Contraseña <span className="text-muted/60 normal-case font-normal">(mín. 8)</span>
          </label>
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
            disabled={busy || !userOk}
            whileTap={{ scale: busy ? 1 : 0.98 }}
            className="w-full rounded-2xl bg-ink py-3.5 text-sm font-semibold text-white shadow-soft hover:opacity-95 transition-opacity disabled:opacity-40 mt-3"
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
