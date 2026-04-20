'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { APP_NAME } from '@/lib/brand';
import HypoSplashHero from '@/components/ui/HypoSplashHero';

const USERNAME_RE = /^[a-z0-9_]{1,10}$/;

const MEDICATIONS = [
  { value: 'levotiroxina', label: 'Levotiroxina' },
  { value: 'eutirox', label: 'Eutirox' },
  { value: 'otra', label: 'Otra marca' },
  { value: 'ninguna', label: 'Ninguna / No sé' },
] as const;

type MedValue = (typeof MEDICATIONS)[number]['value'];

function usernameHint(value: string): string | null {
  if (!value) return null;
  if (value.length > 10) return 'Máximo 10 caracteres';
  if (!/^[a-z0-9_]+$/.test(value)) return 'Solo letras minúsculas, números o _';
  return null;
}

export default function RegistroPage() {
  // Cuenta
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Perfil
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [medication, setMedication] = useState<MedValue>('levotiroxina');
  const [mcg, setMcg] = useState('');
  // Estado UI
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const userHint = usernameHint(username);
  const userOk = USERNAME_RE.test(username);
  const needsMcg = medication !== 'ninguna';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userOk) { setErr('El nombre de usuario no cumple los requisitos.'); return; }
    if (needsMcg && (!mcg || isNaN(Number(mcg)) || Number(mcg) <= 0)) {
      setErr('Indica los mcg de tu medicamento.'); return;
    }
    setErr('');
    setBusy(true);

    const profile = {
      age: age ? Number(age) : null,
      weight: weight ? Number(weight) : null,
      medication: medication === 'ninguna' ? null : medication,
      medicationMcg: needsMcg && mcg ? Number(mcg) : null,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, profile }),
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
        <div className="relative h-[30vh] min-h-[160px] w-full overflow-hidden bg-ink/5">
          <HypoSplashHero />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 pt-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sage mb-1 drop-shadow-sm">{APP_NAME}</p>
            <p className="font-serif italic text-xl text-ink leading-tight drop-shadow-sm">Crear cuenta</p>
          </div>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex-1 px-6 pt-4 pb-12 flex flex-col gap-2 max-w-md mx-auto w-full"
        >
          <AnimatePresence>
            {err ? (
              <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-xs text-coral text-center py-1">
                {err}
              </motion.p>
            ) : null}
          </AnimatePresence>

          {/* ─── Sección cuenta ─── */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mt-1">Tu cuenta</p>

          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Nombre de usuario <span className="normal-case font-normal">(máx. 10 chars)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              maxLength={10}
              placeholder="miusuario"
              className={`w-full rounded-2xl border px-4 py-3 text-sm text-ink bg-white transition-colors ${
                username && !userOk ? 'border-coral' : username && userOk ? 'border-sage' : 'border-hairline'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted tabular-nums">
              {username.length}/10
            </span>
          </div>
          <AnimatePresence>
            {userHint ? (
              <motion.p key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-coral -mt-1">{userHint}</motion.p>
            ) : username && userOk ? (
              <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-sage -mt-1">Se validará al crear la cuenta</motion.p>
            ) : null}
          </AnimatePresence>

          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">Correo</label>
          <input
            type="email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            placeholder="tu@correo.com"
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
          />

          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">
            Contraseña <span className="normal-case font-normal">(mín. 8)</span>
          </label>
          <input
            type="password" autoComplete="new-password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
          />

          {/* ─── Sección perfil ─── */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mt-3">Tu perfil de salud</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Edad</label>
              <input
                type="number" inputMode="numeric" min={10} max={120}
                value={age} onChange={(e) => setAge(e.target.value)}
                placeholder="años"
                className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Peso (kg)</label>
              <input
                type="number" inputMode="decimal" min={20} max={300} step={0.1}
                value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
              />
            </div>
          </div>

          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">¿Tomas medicamento tiroideo?</label>
          <div className="grid grid-cols-2 gap-2">
            {MEDICATIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMedication(m.value)}
                className={`rounded-2xl border py-3 text-sm font-medium transition-colors ${
                  medication === m.value
                    ? 'border-sage bg-sage/10 text-sage'
                    : 'border-hairline bg-white text-muted hover:border-sage/50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {needsMcg ? (
              <motion.div key="mcg" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mt-1 mb-1">
                  Dosis en mcg (microgramos)
                </label>
                <input
                  type="number" inputMode="numeric" min={12.5} max={500} step={12.5}
                  value={mcg} onChange={(e) => setMcg(e.target.value)}
                  required={needsMcg}
                  placeholder="Ej. 100"
                  className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
                />
                <p className="text-[10px] text-muted mt-1">Dosis habitual en tu receta (ej. 50, 75, 100, 125, 150…)</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={busy || !userOk}
            whileTap={{ scale: busy ? 1 : 0.98 }}
            className="w-full rounded-2xl bg-ink py-3.5 text-sm font-semibold text-white shadow-soft hover:opacity-95 transition-opacity disabled:opacity-40 mt-4"
          >
            {busy ? 'Creando…' : 'Crear cuenta'}
          </motion.button>

          <p className="text-xs text-muted text-center pt-2">
            ¿Ya tienes cuenta?{' '}
            <Link href="/entrar" className="font-semibold text-ink underline-offset-2 hover:underline">Entrar</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
