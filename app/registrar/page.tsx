'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addLog, getLogsByDate, type SymptomTag } from '@/lib/store/db';
import { addAppointment } from '@/lib/store/appointments';
import { localDateISO, addDaysLocal } from '@/lib/dates';
import { LEVO_DOSE_LABEL } from '@/lib/brand';
import { playUiSound } from '@/lib/sounds';
import {
  getAbsorptionConflict,
  LEVO_ABSORPTION_MINUTES,
  type AbsorptionConflict,
} from '@/lib/protocols/absorption';

type EntryType = 'meal' | 'medication' | 'symptom' | 'note' | 'walking' | 'appointment';

const TYPES: { key: EntryType; label: string; icon: string; color: string }[] = [
  { key: 'meal',        label: 'Comida',     icon: '🍽️', color: 'bg-amber/10 border-amber/40 text-amber' },
  { key: 'medication',  label: 'Medicación', icon: '💊', color: 'bg-sage/10 border-sage/40 text-sage' },
  { key: 'walking',     label: 'Caminata',   icon: '🚶', color: 'bg-sky-100 border-sky-300 text-sky-700' },
  { key: 'symptom',     label: 'Síntoma',    icon: '⚡', color: 'bg-coral/10 border-coral/40 text-coral' },
  { key: 'appointment', label: 'Cita médica', icon: '🩺', color: 'bg-coral/10 border-coral/40 text-coral' },
  { key: 'note',        label: 'Nota',       icon: '📝', color: 'bg-gray-100 border-gray-200 text-gray-600' },
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

/** Etiqueta legible para YYYY-MM-DD en local */
function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const s = new Date(y, m - 1, d).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Marca de tiempo: hoy = ahora; otro día = mediodía local (orden estable en el día). */
function timestampForEntryDate(entryDateIso: string): number {
  if (entryDateIso === localDateISO()) return Date.now();
  const [y, m, d] = entryDateIso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0).getTime();
}

const VALID_TYPES: EntryType[] = ['meal', 'medication', 'walking', 'symptom', 'appointment', 'note'];

export default function RegistrarPage() {
  return (
    <Suspense>
      <RegistrarInner />
    </Suspense>
  );
}

function RegistrarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = ((): EntryType => {
    const t = searchParams?.get('type');
    return t && (VALID_TYPES as string[]).includes(t) ? (t as EntryType) : 'meal';
  })();
  const todayISO = localDateISO();
  const oldestISO = localDateISO(addDaysLocal(new Date(), -365));
  const farFutureISO = localDateISO(addDaysLocal(new Date(), 365));
  const [entryDate, setEntryDate] = useState(todayISO);
  const [type, setType] = useState<EntryType>(initialType);
  const [label, setLabel] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emotionBubble, setEmotionBubble] = useState<string | null>(null);
  const [selectedSymptomTags, setSelectedSymptomTags] = useState<SymptomTag[]>([]);
  const [walkDuration, setWalkDuration] = useState<number>(15);
  const [absorptionConflict, setAbsorptionConflict] = useState<AbsorptionConflict | null>(null);
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptSpecialty, setApptSpecialty] = useState('');
  const [apptTime, setApptTime] = useState('10:00');
  const [apptBring, setApptBring] = useState('');

  function toggleSymptomTag(tag: SymptomTag) {
    setSelectedSymptomTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleTypeChange(t: EntryType) {
    setType(t);
    if (t === 'walking') {
      setLabel(label || 'Caminata');
    } else if (label === 'Caminata') {
      setLabel('');
    }
    if (t === 'appointment' && entryDate < todayISO) {
      setEntryDate(todayISO);
    }
    setSelectedSymptomTags([]);
  }

  async function handleSave(skipAbsorptionCheck = false) {
    const isAppt = type === 'appointment';
    const finalLabel = isAppt
      ? apptDoctor.trim()
      : type === 'walking'
        ? (label.trim() || 'Caminata')
        : label.trim();
    if (!finalLabel) return;

    if (!isAppt && !skipAbsorptionCheck) {
      const ts = timestampForEntryDate(entryDate);
      const logs = await getLogsByDate(entryDate);
      const conflict = getAbsorptionConflict(logs, entryDate, ts, type, finalLabel);
      if (conflict) {
        setAbsorptionConflict(conflict);
        return;
      }
    }

    setSaving(true);
    try {
      if (isAppt) {
        const specialty = apptSpecialty.trim();
        const bring = apptBring.trim();
        const noteParts = [
          specialty ? `Especialidad: ${specialty}` : '',
          bring ? `Llevar: ${bring}` : '',
          notes.trim(),
        ].filter(Boolean);
        addAppointment({
          title: finalLabel,
          date: entryDate,
          time: apptTime || undefined,
          type: 'medico',
          notes: noteParts.length ? noteParts.join(' · ') : undefined,
        });
        playUiSound('success');
        setSaved(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('copiloto-refresh'));
        }
        setTimeout(() => router.push('/historial'), 800);
        return;
      }

      const emotionNote = emotionBubble
        ? `[${EMOTION_BUBBLES.find((e) => e.key === emotionBubble)?.label ?? emotionBubble}] `
        : '';
      let extra = '';
      if (skipAbsorptionCheck && absorptionConflict) {
        extra = `Nota: registro antes de ${LEVO_ABSORPTION_MINUTES} min tras levotiroxina (${absorptionConflict.levoTimeLabel}); decisión consciente del usuario.\n`;
      }
      const finalNotes = `${extra}${emotionNote}${notes.trim()}`.trim() || undefined;

      const ts = timestampForEntryDate(entryDate);

      await addLog({
        date: entryDate,
        timestamp: ts,
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
      setAbsorptionConflict(null);
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

  const canSave =
    type === 'walking'
      ? true
      : type === 'appointment'
        ? apptDoctor.trim().length > 0
        : label.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-12 pb-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-muted transition-colors hover:bg-surface/80 hover:text-ink"
            aria-label="Ir al inicio"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif italic text-3xl text-ink leading-tight">Registrar</h1>
            <p className="mt-1 text-xs text-muted capitalize">{formatLongDate(entryDate)}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-5 pb-8">
        {/* Fecha del registro */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">
            {type === 'appointment' ? '¿Qué día es la cita?' : '¿Para qué día?'}
          </label>
          <input
            type="date"
            value={entryDate}
            min={type === 'appointment' ? todayISO : oldestISO}
            max={type === 'appointment' ? farFutureISO : todayISO}
            onChange={(e) => setEntryDate(e.target.value || todayISO)}
            className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-sage"
          />
          <p className="mt-1.5 text-[11px] leading-snug text-muted">
            {type === 'appointment'
              ? 'La cita aparecerá en “Próximamente” en tu historial hasta que llegue el día.'
              : entryDate === todayISO
                ? 'Se guarda con la hora actual.'
                : 'Se guarda en ese día (mediodía local) para que aparezca bien en el historial.'}
          </p>
        </div>

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

        {/* Cita médica: quién, especialidad, hora, qué llevar */}
        {type === 'appointment' && (
          <div className="space-y-4 rounded-2xl border border-coral/20 bg-coral/5 p-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-coral">
                Quién te atiende
              </label>
              <input
                type="text"
                value={apptDoctor}
                onChange={(e) => setApptDoctor(e.target.value)}
                placeholder="Ej. Dra. Alicia Núñez"
                className="w-full rounded-xl border border-hairline bg-white/90 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-coral"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-coral">
                  Especialidad · motivo
                </label>
                <input
                  type="text"
                  value={apptSpecialty}
                  onChange={(e) => setApptSpecialty(e.target.value)}
                  placeholder="Ej. Endocrinología · control TSH"
                  className="w-full rounded-xl border border-hairline bg-white/90 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-coral"
                />
              </div>
              <div className="w-[110px]">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-coral">
                  Hora
                </label>
                <input
                  type="time"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value || '10:00')}
                  className="w-full rounded-xl border border-hairline bg-white/90 px-3 py-2.5 text-sm text-ink outline-none focus:border-coral"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-coral">
                Qué llevar (opcional)
              </label>
              <textarea
                value={apptBring}
                onChange={(e) => setApptBring(e.target.value)}
                rows={2}
                placeholder="Análisis T3, T4 libre, TPO, TSH…"
                className="w-full rounded-xl border border-hairline bg-white/90 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-coral resize-none"
              />
            </div>
          </div>
        )}

        {/* Label (hidden for walking/appointment) */}
        {type !== 'walking' && type !== 'appointment' && (
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
        {type !== 'appointment' && (
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
        )}

        {/* Mood */}
        {type !== 'appointment' && (
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
        )}

        {/* Notes */}
        {type !== 'appointment' && (
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
        )}

        {/* Save */}
        <button
          type="button"
          onClick={() => void handleSave(false)}
          disabled={!canSave || saving}
          className="w-full bg-sage text-white py-4 rounded-2xl font-semibold text-sm tracking-wide disabled:opacity-40 transition-all hover:bg-sage/90"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {absorptionConflict ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-8 pt-10 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="absorption-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-hairline bg-background px-5 py-5 shadow-lift">
            <p id="absorption-title" className="font-serif text-lg italic text-ink">
              Ventana de absorción
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Registraste levotiroxina a las {absorptionConflict.levoTimeLabel}. Para favorecer la absorción, lo habitual
              es esperar al menos <strong>{LEVO_ABSORPTION_MINUTES} min</strong> antes de comida o café (
              sólo <strong>{absorptionConflict.minutesElapsed.toFixed(0)} min</strong> han pasado; faltan ~{' '}
              {Math.ceil(absorptionConflict.minutesRemaining)} min ).
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted/90">
              HypoCopilot no cambia tu medicación: esto es un recordatorio educativo. Si tu endocrinólogo indicó otra
              pauta, prevalece eso.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setAbsorptionConflict(null)}
                className="w-full rounded-2xl bg-sage py-3 text-sm font-semibold text-white shadow-soft"
              >
                Entendido, esperaré
              </button>
              <button
                type="button"
                onClick={() => void handleSave(true)}
                disabled={saving}
                className="w-full rounded-2xl border border-hairline bg-surface py-3 text-sm font-semibold text-ink"
              >
                {saving ? 'Guardando…' : 'Guardar igual (lo tengo claro)'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
