'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addLog, type SymptomTag } from '@/lib/store/db';
import { localDateISO } from '@/lib/dates';
import { LEVO_DOSE_LABEL } from '@/lib/brand';
import { playUiSound } from '@/lib/sounds';

type EntryType = 'meal' | 'medication' | 'symptom' | 'note' | 'walking';

const TYPES: { key: EntryType; label: string; icon: string; color: string }[] = [
  { key: 'meal',       label: 'Comida',     icon: '🍽️', color: 'bg-amber/10 border-amber/40 text-amber' },
  { key: 'medication', label: 'Medicación', icon: '💊', color: 'bg-sage/10 border-sage/40 text-sage' },
  { key: 'walking',    label: 'Caminata',   icon: '🚶', color: 'bg-sky-100 border-sky-300 text-sky-700' },
  { key: 'symptom',   label: 'Síntoma',    icon: '⚡', color: 'bg-coral/10 border-coral/40 text-coral' },
  { key: 'note',      label: 'Nota',       icon: '📝', color: 'bg-gray-100 border-gray-200 text-gray-600' },
];

const MOODS: { emoji: string; label: string }[] = [
  { emoji: '😞', label: 'Muy mal' },
  { emoji: '😕', label: 'Mal' },
  { emoji: '😐', label: 'Regular' },
  { emoji: '🙂', label: 'Bien' },
  { emoji: '😊', label: 'Genial' },
];

/** Burbujas emocionales rápidas (Gemini UX flow) */
const EMOTION_BUBBLES: { key: string; label: string; icon: string }[] = [
  { key: 'impulso',  label: 'Impulso',  icon: '⚡' },
  { key: 'culpa',    label: 'Culpa',    icon: '😔' },
  { key: 'cansancio',label: 'Cansancio',icon: '😴' },
  { key: 'claridad', label: 'Claridad', icon: '✨' },
  { key: 'ansiedad', label: 'Ansiedad', icon: '😰' },
  { key: 'orgullo',  label: 'Orgullo',  icon: '🏆' },
];

const SYMPTOM_TAGS: { key: SymptomTag; label: string }[] = [
  { key: 'fatiga',        label: 'Fatiga' },
  { key: 'frio',          label: 'Frío' },
  { key: 'niebla_mental', label: 'Niebla mental' },
  { key: 'estreñimiento', label: 'Estreñimiento' },
  { key: 'palpitaciones', label: 'Palpitaciones' },
  { key: 'ansiedad',      label: 'Ansiedad' },
  { key: 'dolor_cabeza',  label: 'Dolor de cabeza' },
  { key: 'insomnio',      label: 'Insomnio' },
  { key: 'otro',          label: 'Otro' },
];

const WALK_DURATIONS = [5, 10, 15, 20, 30];

export default function RegistrarPage() {
  const router = useRouter();
  const [type, setType] = useState<EntryType>('meal');
  const [label, setLabel] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emotionBubble, setEmotionBubble] = useState<string | null>(null);
  const [selectedSymptomTags, setSelectedSymptomTags] = useState<SymptomTag[]>([]);
  const [walkDuration, setWalkDuration] = useState<number>(15);

  function toggleSymptomTag(tag: SymptomTag) {
    setSelectedSymptomTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleTypeChange(t: EntryType) {
    setType(t);
    // Pre-fill label for walking
    if (t === 'walking') {
      setLabel(label || 'Caminata');
    } else if (label === 'Caminata') {
      setLabel('');
    }
    setSelectedSymptomTags([]);
  }

  async function handleSave() {
    const finalLabel = type === 'walking' ? (label.trim() || 'Caminata') : label.trim();
    if (!finalLabel) return;
    setSaving(true);
    try {
      // Append emotion bubble to notes if selected
      const emotionNote = emotionBubble
        ? `[${EMOTION_BUBBLES.find((e) => e.key === emotionBubble)?.label ?? emotionBubble}] `
        : '';
      const finalNotes = `${emotionNote}${notes.trim()}`.trim() || undefined;

      await addLog({
        date: localDateISO(),
        timestamp: Date.now(),
        type,
        label: finalLabel,
        mood: mood !== null ? ((mood + 1) as 1 | 2 | 3 | 4 | 5) : undefined,
        notes: finalNotes,
        durationMin: type === 'walking' ? walkDuration : undefined,
        symptomTags: type === 'symptom' && selectedSymptomTags.length ? selectedSymptomTags : undefined,
      });
      playUiSound('success');
      setSaved(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('copiloto-refresh'));
      }
      setTimeout(() => router.push('/'), 800);
    } catch (e) {
      console.error(e);
      alert('No se pudo guardar en el dispositivo. Revisa espacio o permisos del navegador.');
    } finally {
      setSaving(false);
    }
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

  const canSave = type === 'walking' ? true : label.trim().length > 0;

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
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => handleTypeChange(t.key)}
                className={`flex items-center gap-2 px-3 py-3 rounded-2xl border transition-all text-sm font-medium ${
                  type === t.key ? t.color : 'bg-surface border-gray-100 text-gray-400'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Walking-specific: duration picker */}
        {type === 'walking' && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
              Duración
            </label>
            <p className="text-[11px] text-muted mb-2 leading-snug">
              10–15 min post-almuerzo o 15–20 min post-cena activan GLUT4 y reducen picos glucémicos un 12–18 %.
            </p>
            <div className="flex gap-2">
              {WALK_DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setWalkDuration(d)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                    walkDuration === d
                      ? 'bg-sky-100 border-sky-300 text-sky-700'
                      : 'bg-surface border-gray-100 text-gray-400'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Symptom tags */}
        {type === 'symptom' && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
              ¿Qué sientes? (puedes elegir varios)
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_TAGS.map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => toggleSymptomTag(st.key)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    selectedSymptomTags.includes(st.key)
                      ? 'bg-coral/10 border-coral/40 text-coral'
                      : 'bg-surface border-gray-100 text-gray-400'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Label (hidden for walking if pre-filled, still editable) */}
        {type !== 'walking' && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
              {type === 'meal' ? 'Qué comiste' : type === 'medication' ? 'Medicamento' : type === 'symptom' ? 'Descripción breve' : 'Nota'}
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={
                type === 'meal' ? 'Ej. Huevos con aguacate' :
                type === 'medication' ? `Ej. Levotiroxina ${LEVO_DOSE_LABEL}` :
                type === 'symptom' ? 'Ej. Fatiga por la tarde' :
                'Escribe tu nota...'
              }
              className="w-full bg-surface border border-gray-100 rounded-2xl px-4 py-3 text-ink text-sm outline-none focus:border-sage transition-colors placeholder:text-gray-300"
            />
          </div>
        )}

        {/* Emotional bubbles */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
            Estado emocional rápido (opcional)
          </label>
          <p className="text-[11px] text-muted mb-2 leading-snug">
            Se guarda en el historial para que mañana tu copiloto entienda el contexto sin que lo expliques de nuevo.
          </p>
          <div className="flex flex-wrap gap-2">
            {EMOTION_BUBBLES.map((eb) => (
              <button
                key={eb.key}
                type="button"
                onClick={() => setEmotionBubble(emotionBubble === eb.key ? null : eb.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  emotionBubble === eb.key
                    ? 'bg-sage/10 border-sage/40 text-sage scale-105'
                    : 'bg-surface border-gray-100 text-gray-400'
                }`}
              >
                <span>{eb.icon}</span> {eb.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
            ¿Cómo te sentiste en general? (opcional)
          </label>
          <div className="flex gap-2">
            {MOODS.map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMood(mood === i ? null : i)}
                title={m.label}
                className={`flex-1 py-3 rounded-2xl text-xl transition-all border ${
                  mood === i
                    ? 'bg-sage/10 border-sage/40 scale-110'
                    : 'bg-surface border-gray-100'
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
            Notas adicionales (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={
              type === 'walking'
                ? 'Ej. Salí después del almuerzo, llovizna pero lo hice 💪'
                : 'Ej. Me sentí triste porque compré fuera de plan…'
            }
            className="w-full bg-surface border border-gray-100 rounded-2xl px-4 py-3 text-ink text-sm outline-none focus:border-sage transition-colors placeholder:text-gray-300 resize-none"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="w-full bg-sage text-white py-4 rounded-2xl font-semibold text-sm tracking-wide disabled:opacity-40 transition-all hover:bg-sage/90"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
