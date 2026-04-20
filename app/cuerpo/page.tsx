'use client';

import { useEffect, useState } from 'react';
import { addBodyEntry, getAllBodyEntries, type BodyEntry } from '@/lib/store/db';
import { localDateISO } from '@/lib/dates';

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
}

export default function CuerpoPage() {
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<BodyEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAllBodyEntries().then((all) =>
      setEntries([...all].sort((a, b) => b.date.localeCompare(a.date)))
    );
  }, []);

  async function handleSave() {
    if (!weight && !waist) return;
    setSaving(true);
    await addBodyEntry({
      date: localDateISO(),
      weight: weight ? parseFloat(weight) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      notes: notes.trim() || undefined,
    });
    const all = await getAllBodyEntries();
    setEntries([...all].sort((a, b) => b.date.localeCompare(a.date)));
    setWeight('');
    setWaist('');
    setNotes('');
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  const latest = entries[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-12 pb-4">
        <h1 className="font-serif italic text-3xl text-ink">Cuerpo</h1>
      </div>

      <div className="px-6 space-y-5 pb-8">
        {/* Latest snapshot */}
        {latest && (
          <div className="bg-surface border border-gray-100 rounded-2xl px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-3">Última medición</p>
            <div className="flex gap-6">
              {latest.weight && (
                <div>
                  <p className="font-serif italic text-3xl text-ink">{latest.weight}</p>
                  <p className="text-xs text-gray-400 mt-0.5">kg</p>
                </div>
              )}
              {latest.waist && (
                <div>
                  <p className="font-serif italic text-3xl text-ink">{latest.waist}</p>
                  <p className="text-xs text-gray-400 mt-0.5">cm cintura</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-2">{formatDate(latest.date)}</p>
          </div>
        )}

        {/* Input form */}
        <div className="bg-surface border border-gray-100 rounded-2xl px-5 py-4 space-y-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Nueva medición</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Peso (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Cintura (cm)</label>
              <input
                type="number"
                inputMode="decimal"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="0.0"
                className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
              />
            </div>
          </div>

          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas (opcional)"
            className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
          />

          <button
            onClick={handleSave}
            disabled={(!weight && !waist) || saving}
            className={`w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all ${
              saved
                ? 'bg-sage/20 text-sage'
                : 'bg-sage text-white hover:bg-sage/90 disabled:opacity-40'
            }`}
          >
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar medición'}
          </button>
        </div>

        {/* History */}
        {entries.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-2">Historial</p>
            <div className="space-y-2">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="bg-surface border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between"
                >
                  <p className="text-xs text-gray-400">{formatDate(e.date)}</p>
                  <div className="flex gap-4 text-sm text-ink font-medium">
                    {e.weight && <span>{e.weight} kg</span>}
                    {e.waist && <span>{e.waist} cm</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
