'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { APP_NAME } from '@/lib/brand';
import HypoSplashHero from '@/components/ui/HypoSplashHero';

const USERNAME_RE = /^[a-z0-9_]{1,10}$/;

const MEDICATIONS = [
  { value: 'levotiroxina', label: 'Levothyroxine' },
  { value: 'eutirox', label: 'Synthroid' },
  { value: 'otra', label: 'Other brand' },
  { value: 'ninguna', label: 'None / I don’t know' },
] as const;

type MedValue = (typeof MEDICATIONS)[number]['value'];

function usernameHint(value: string): string | null {
  if (!value) return null;
  if (value.length > 10) return 'Max. 10 characters';
  if (!/^[a-z0-9_]+$/.test(value)) return 'Lowercase letters, numbers or _ only';
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
    if (!userOk) { setErr('Username doesn’t meet the requirements.'); return; }
    if (needsMcg && (!mcg || isNaN(Number(mcg)) || Number(mcg) <= 0)) {
      setErr('Please enter your medication dose in mcg.'); return;
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
        setErr(data.error ?? 'Couldn’t create the account');
        setBusy(false);
        return;
      }
      window.location.href = '/entrar?creado=1';
    } catch {
      setErr('Network error. Please try again.');
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
            <p className="font-serif italic text-xl text-ink leading-tight drop-shadow-sm">Create account</p>
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mt-1">Your account</p>

          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Username <span className="normal-case font-normal">(max. 10 chars)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              maxLength={10}
              placeholder="myusername"
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
              <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-sage -mt-1">We’ll validate it when you create the account</motion.p>
            ) : null}
          </AnimatePresence>

          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">Email</label>
          <input
            type="email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            placeholder="you@email.com"
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
          />

          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">
            Password <span className="normal-case font-normal">(min. 8)</span>
          </label>
          <input
            type="password" autoComplete="new-password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
          />

          {/* ─── Sección perfil ─── */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mt-3">Your health profile</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Age</label>
              <input
                type="number" inputMode="numeric" min={10} max={120}
                value={age} onChange={(e) => setAge(e.target.value)}
                placeholder="years"
                className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Weight (kg)</label>
              <input
                type="number" inputMode="decimal" min={20} max={300} step={0.1}
                value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
              />
            </div>
          </div>

          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">Are you on thyroid medication?</label>
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
                  Dose in mcg (micrograms)
                </label>
                <input
                  type="number" inputMode="numeric" min={12.5} max={500} step={12.5}
                  value={mcg} onChange={(e) => setMcg(e.target.value)}
                  required={needsMcg}
                  placeholder="e.g. 100"
                  className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
                />
                <p className="text-[10px] text-muted mt-1">Usual dose on your prescription (e.g. 50, 75, 100, 125, 150…)</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={busy || !userOk}
            whileTap={{ scale: busy ? 1 : 0.98 }}
            className="w-full rounded-2xl bg-ink py-3.5 text-sm font-semibold text-white shadow-soft hover:opacity-95 transition-opacity disabled:opacity-40 mt-4"
          >
            {busy ? 'Creating…' : 'Create account'}
          </motion.button>

          <p className="text-xs text-muted text-center pt-2">
            Already have an account?{' '}
            <Link href="/entrar" className="font-semibold text-ink underline-offset-2 hover:underline">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
