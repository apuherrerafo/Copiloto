'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { addLog, getLogsByDate, type LogEntry, type ProCheckInValue } from '@/lib/store/db';
import { localDateISO } from '@/lib/dates';
import { playUiSound } from '@/lib/sounds';

const energyLabels = ['Very low', 'Low', 'Okay', 'Good', 'Great'] as const;
const fogLabels = ['Heavy fog', 'Foggy', 'So-so', 'Clear', 'Razor-sharp'];

function parseCheckIn(entry: LogEntry): ProCheckInValue | null {
  if (entry.type !== 'checkin' || !entry.value || typeof entry.value !== 'object') return null;
  const v = entry.value as Record<string, unknown>;
  if (typeof v.proEnergy !== 'number' || typeof v.proBrainFog !== 'number') return null;
  return { proEnergy: v.proEnergy, proBrainFog: v.proBrainFog };
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
    const checkins = logs.filter(
      (l) => l.type === 'checkin' && l.label === 'Daily check-in (energy + brain fog)',
    );
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
        label: 'Daily check-in (energy + brain fog)',
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
      className="mb-4 w-full rounded-3xl border border-white/80 bg-white/70 px-4 py-4 shadow-soft backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sage">How do you feel today</p>
          <p className="mt-0.5 text-xs text-muted">Scale 1–5 · your data to spot trends</p>
        </div>
        {done ? (
          <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-[10px] font-semibold text-sage">Saved</span>
        ) : null}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-ink">
            <span>Energy / fatigue</span>
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
            <span>Brain fog</span>
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
          {saving ? 'Saving…' : 'Save today’s check-in'}
        </button>
      ) : (
        <p className="mt-3 text-center text-xs text-muted">
          Energy {existing.proEnergy}/5 · Clarity {existing.proBrainFog}/5
        </p>
      )}
    </motion.div>
  );
}
