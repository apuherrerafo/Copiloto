'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { addLog, getLogsByDate, type ProCheckInValue } from '@/lib/store/db';
import { localDateISO } from '@/lib/dates';
import { playUiSound } from '@/lib/sounds';

const energyLabels = ['Muy baja', 'Baja', 'Regular', 'Buena', 'Muy buena'] as const;
const fogLabels = ['Mucha niebla', 'Niebla', 'Regular', 'Claro', 'Muy claro'];

function parseCheckIn(entry: {
  type: string;
  value?: string | number | ProCheckInValue;
}): ProCheckInValue | null {
  if (entry.type !== 'checkin' || !entry.value || typeof entry.value !== 'object') return null;
  const v = entry.value as ProCheckInValue;
  if (typeof v.proEnergy !== 'number' || typeof v.proBrainFog !== 'number') return null;
  return v;
}

export default function DailyCheckin() {
  const today = localDateISO();
  const [existing, setExisting] = useState<ProCheckInValue | null>(null);
  const [energy, setEnergy] = useState<number>(3);
  const [brainFog, setBrainFog] = useState<number>(3);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    const logs = await getLogsByDate(today);
    const checkins = logs.filter((l) => l.type === 'checkin');
    const latest = checkins.sort((a, b) => b.timestamp - a.timestamp)[0];
    const parsed = latest ? parseCheckIn(latest) : null;
    if (parsed) {
      setExisting(parsed);
      setEnergy(parsed.proEnergy);
      setBrainFog(parsed.proBrainFog);
      setDone(true);
    }
  }, [today]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const bump = () => void load();
    window.addEventListener('copiloto-refresh', bump);
    return () => window.removeEventListener('copiloto-refresh', bump);
  }, [load]);

  async function save() {
    if (existing) return;
    setSaving(true);
    try {
      const val: ProCheckInValue = {
        proEnergy: energy,
        proBrainFog: brainFog,
      };
      await addLog({
        date: today,
        timestamp: Date.now(),
        type: 'checkin',
        label: 'Check-in diario (fatiga + niebla)',
        value: val,
      });
      playUiSound('success');
      setExisting(val);
      setDone(true);
      window.dispatchEvent(new Event('copiloto-refresh'));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-5 mb-4 rounded-3xl border border-white/80 bg-white/70 px-4 py-4 shadow-soft backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sage">Cómo te sientes hoy</p>
          <p className="mt-0.5 text-xs text-muted">Escala 1–5 · datos tuyos para ver tendencias</p>
        </div>
        {done ? (
          <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-[10px] font-semibold text-sage">Guardado</span>
        ) : null}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-ink">
            <span>Energía / fatiga</span>
            <span className="text-muted">{energyLabels[energy - 1]}</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={energy}
            disabled={!!existing}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-sage disabled:opacity-60"
          />
        </div>
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-ink">
            <span>Niebla mental</span>
            <span className="text-muted">{fogLabels[brainFog - 1]}</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={brainFog}
            disabled={!!existing}
            onChange={(e) => setBrainFog(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-sage disabled:opacity-60"
          />
        </div>
      </div>

      {!existing ? (
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="mt-4 w-full rounded-2xl bg-ink py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar check-in de hoy'}
        </button>
      ) : (
        <p className="mt-3 text-center text-xs text-muted">
          Energía {existing.proEnergy}/5 · Claridad {existing.proBrainFog}/5
        </p>
      )}
    </motion.div>
  );
}
