'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addLog } from '@/lib/store/db';

type EntryType = 'meal' | 'medication' | 'symptom' | 'note';

const TYPES: { key: EntryType; label: string; icon: string; color: string }[] = [
  { key: 'meal',       label: 'Comida',     icon: '🍽️', color: 'bg-amber/10 border-amber/40 text-amber' },
  { key: 'medication', label: 'Medicación', icon: '💊', color: 'bg-sage/10 border-sage/40 text-sage' },
  { key: 'symptom',   label: 'Síntoma',    icon: '⚡', color: 'bg-coral/10 border-coral/40 text-coral' },
  { key: 'note',      label: 'Nota',       icon: '📝', color: 'bg-gray-100 border-gray-200 text-gray-600' },
];

const MOODS = ['😞', '😕', '😐', '🙂', '😊'] as const;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RegistrarPage() {
  const router = useRouter();
  const [type, setType] = useState<EntryType>('meal');
  const [label, setLabel] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!label.trim()) return;
    setSaving(true);
    await addLog({
      date: todayISO(),
      timestamp: Date.now(),
      type,
      label: label.trim(),
      mood: mood !== null ? ((mood + 1) as 1 | 2 | 3 | 4 | 5) : undefined,
      notes: notes.trim() || undefined,
    });
    setSaved(true);
    setSaving(false);
    setTimeout(() => router.push('/'), 800);
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-sage font-semibold">Registrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-12 pb-4">
        <h1 className="font-serif italic text-3xl text-ink">Registrar</h1>
      </div>

      <div className="px-6 space-y-5 pb-8">
        {/* Type selector */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`flex items-center gap-2 px-3 py-3 rounded-2xl border transition-all text-sm font-medium ${
                  type === t.key ? t.color : 'bg-surface border-gray-100 text-gray-400'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
            {type === 'meal' ? 'Qué comiste' : type === 'medication' ? 'Medicamento' : type === 'symptom' ? 'Síntoma' : 'Nota'}
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={
              type === 'meal' ? 'Ej. Huevos con aguacate' :
              type === 'medication' ? 'Ej. Levotiroxina 75mcg' :
              type === 'symptom' ? 'Ej. Dolor de cabeza leve' :
              'Escribe tu nota...'
            }
            className="w-full bg-surface border border-gray-100 rounded-2xl px-4 py-3 text-ink text-sm outline-none focus:border-sage transition-colors placeholder:text-gray-300"
          />
        </div>

        {/* Mood — only for meals */}
        {type === 'meal' && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
              Cómo te sentiste
            </label>
            <div className="flex gap-2">
              {MOODS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setMood(mood === i ? null : i)}
                  className={`flex-1 py-3 rounded-2xl text-xl transition-all border ${
                    mood === i
                      ? 'bg-sage/10 border-sage/40 scale-110'
                      : 'bg-surface border-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Detalles adicionales..."
            className="w-full bg-surface border border-gray-100 rounded-2xl px-4 py-3 text-ink text-sm outline-none focus:border-sage transition-colors placeholder:text-gray-300 resize-none"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!label.trim() || saving}
          className="w-full bg-sage text-white py-4 rounded-2xl font-semibold text-sm tracking-wide disabled:opacity-40 transition-all hover:bg-sage/90"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
