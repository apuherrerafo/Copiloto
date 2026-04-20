'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { addLog, getLogsByDate, type EveningPROMValue } from '@/lib/store/db';
import { localDateISO } from '@/lib/dates';
import { playUiSound } from '@/lib/sounds';

const PM_LABEL = 'Evening check-in (PROM)';

const digestiveLabels = ['Rough', 'Uneasy', 'Okay', 'Comfortable', 'Great'] as const;
const energyLabels = ['Drained', 'Low', 'Steady', 'Good', 'Wired'] as const;
const clarityLabels = ['Foggy', 'Dull', 'Okay', 'Clear', 'Sharp'] as const;

function parseEvening(entry: { type: string; label: string; value?: unknown }): EveningPROMValue | null {
  if (entry.type !== 'checkin' || entry.label !== PM_LABEL) return null;
  const v = entry.value;
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const a = o.pmDigestive;
  const b = o.pmEnergy;
  const c = o.pmClarity;
  if (typeof a !== 'number' || typeof b !== 'number' || typeof c !== 'number') return null;
  if (a < 1 || a > 5 || b < 1 || b > 5 || c < 1 || c > 5) return null;
  return { pmDigestive: a, pmEnergy: b, pmClarity: c };
}

export default function EveningPROM() {
  const today = localDateISO();
  const [now, setNow] = useState(() => new Date());
  const [existing, setExisting] = useState<EveningPROMValue | null>(null);
  const [digestive, setDigestive] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [clarity, setClarity] = useState(3);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const logs = await getLogsByDate(today);
    const evening = logs
      .filter((l) => l.type === 'checkin' && l.label === PM_LABEL)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    const parsed = evening ? parseEvening(evening) : null;
    if (parsed) {
      setExisting(parsed);
      setDigestive(parsed.pmDigestive);
      setEnergy(parsed.pmEnergy);
      setClarity(parsed.pmClarity);
    }
  }, [today]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    const bump = () => void load();
    window.addEventListener('copiloto-refresh', bump);
    return () => {
      clearInterval(id);
      window.removeEventListener('copiloto-refresh', bump);
    };
  }, [load]);

  const hour = now.getHours();
  if (hour < 16 || hour > 23) return null;

  async function save() {
    if (existing) return;
    setSaving(true);
    try {
      const val: EveningPROMValue = {
        pmDigestive: digestive,
        pmEnergy: energy,
        pmClarity: clarity,
      };
      await addLog({
        date: today,
        timestamp: Date.now(),
        type: 'checkin',
        label: PM_LABEL,
        value: val,
      });
      playUiSound('success');
      setExisting(val);
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
      className="mb-4 w-full rounded-3xl border border-amber/20 bg-gradient-to-br from-amber/[0.06] to-white/70 px-4 py-4 shadow-soft backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">Evening check-in</p>
          <p className="mt-0.5 text-xs text-muted">Digestion · energy · clarity (1–5) · PROM-style snapshot</p>
        </div>
        {existing ? (
          <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-[10px] font-semibold text-sage">Saved</span>
        ) : null}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-ink">
            <span>Digestive comfort</span>
            <span className="text-muted">{digestiveLabels[digestive - 1]}</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={digestive}
            disabled={!!existing}
            onChange={(e) => setDigestive(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-amber disabled:opacity-60"
          />
        </div>
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-ink">
            <span>Energy (now)</span>
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
            className="h-2 w-full cursor-pointer accent-amber disabled:opacity-60"
          />
        </div>
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-ink">
            <span>Mental clarity</span>
            <span className="text-muted">{clarityLabels[clarity - 1]}</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={clarity}
            disabled={!!existing}
            onChange={(e) => setClarity(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-amber disabled:opacity-60"
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
          {saving ? 'Saving…' : 'Save evening check-in'}
        </button>
      ) : (
        <p className="mt-3 text-center text-xs text-muted">
          Digestion {existing.pmDigestive}/5 · Energy {existing.pmEnergy}/5 · Clarity {existing.pmClarity}/5
        </p>
      )}
    </motion.div>
  );
}
