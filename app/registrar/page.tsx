'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  { key: 'meal',        label: 'Meal',        icon: '🍽️', color: 'bg-amber/10 border-amber/40 text-amber' },
  { key: 'medication',  label: 'Medication',  icon: '💊', color: 'bg-sage/10 border-sage/40 text-sage' },
  { key: 'walking',     label: 'Walk',        icon: '🚶', color: 'bg-sky-100 border-sky-300 text-sky-700' },
  { key: 'symptom',     label: 'Symptom',     icon: '⚡', color: 'bg-coral/10 border-coral/40 text-coral' },
  { key: 'appointment', label: 'Appointment', icon: '🩺', color: 'bg-coral/10 border-coral/40 text-coral' },
  { key: 'note',        label: 'Note',        icon: '📝', color: 'bg-gray-100 border-gray-200 text-gray-600' },
];

const MOODS: { emoji: string; label: string }[] = [
  { emoji: '😞', label: 'Awful' },
  { emoji: '😕', label: 'Bad' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😊', label: 'Great' },
];

/** Quick emotion bubbles */
const EMOTION_BUBBLES: { key: string; label: string; icon: string }[] = [
  { key: 'impulso',  label: 'Impulse',   icon: '⚡' },
  { key: 'culpa',    label: 'Guilt',     icon: '😔' },
  { key: 'cansancio',label: 'Tired',     icon: '😴' },
  { key: 'claridad', label: 'Clarity',   icon: '✨' },
  { key: 'ansiedad', label: 'Anxiety',   icon: '😰' },
  { key: 'orgullo',  label: 'Pride',     icon: '🏆' },
];

const SYMPTOM_TAGS: { key: SymptomTag; label: string }[] = [
  { key: 'fatiga',        label: 'Fatigue' },
  { key: 'frio',          label: 'Cold' },
  { key: 'niebla_mental', label: 'Brain fog' },
  { key: 'estreñimiento', label: 'Constipation' },
  { key: 'palpitaciones', label: 'Palpitations' },
  { key: 'ansiedad',      label: 'Anxiety' },
  { key: 'dolor_cabeza',  label: 'Headache' },
  { key: 'insomnio',      label: 'Insomnia' },
  { key: 'otro',          label: 'Other' },
];

const WALK_DURATIONS = [5, 10, 15, 20, 30];

/** Etiqueta legible para YYYY-MM-DD en local */
function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
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
      setLabel(label || 'Walk');
    } else if (label === 'Walk') {
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
        ? (label.trim() || 'Walk')
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
          specialty ? `Specialty: ${specialty}` : '',
          bring ? `Bring: ${bring}` : '',
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
        extra = `Note: logged within ${LEVO_ABSORPTION_MINUTES} min after levothyroxine (${absorptionConflict.levoTimeLabel}); user acknowledged.\n`;
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
      alert('Could not save on this device. Check storage space or browser permissions.');
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-sage font-semibold">Saved</p>
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
            aria-label="Back to home"
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
            <h1 className="font-serif italic text-3xl text-ink leading-tight">Log</h1>
            <p className="mt-1 text-xs text-muted">{formatLongDate(entryDate)}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-5 pb-8">
        {/* Fecha del registro */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">
            {type === 'appointment' ? 'When is the appointment?' : 'For which day?'}
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
              ? 'It will show up under “Coming up” in your history until the day arrives.'
              : entryDate === todayISO
                ? 'Saved with the current time.'
                : 'Saved at local noon so it sits cleanly on that day in your history.'}
          </p>
        </div>

        {/* Type selector */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
            Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <motion.button
                key={t.key}
                onClick={() => handleTypeChange(t.key)}
                whileTap={{ scale: 0.94 }}
                animate={type === t.key ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-center gap-2 px-3 py-3 rounded-2xl border transition-colors text-sm font-medium ${
                  type === t.key ? `${t.color} shadow-soft` : 'bg-surface border-gray-100 text-gray-400'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="truncate">{t.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Type-specific sections con animación al cambiar */}
        <AnimatePresence mode="wait">
          {type === 'walking' && (
            <motion.div
              key="walking-dur"
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
                  Duration
                </label>
                <p className="text-[11px] text-muted mb-2 leading-snug">
                  10–15 min post-lunch or 15–20 min post-dinner activate GLUT4 and reduce glucose spikes by 12–18%.
                </p>
                <div className="flex gap-2">
                  {WALK_DURATIONS.map((d) => (
                    <motion.button
                      key={d}
                      type="button"
                      onClick={() => setWalkDuration(d)}
                      whileTap={{ scale: 0.9 }}
                      className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                        walkDuration === d
                          ? 'bg-sky-100 border-sky-300 text-sky-700'
                          : 'bg-surface border-gray-100 text-gray-400'
                      }`}
                    >
                      {d} min
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {type === 'symptom' && (
            <motion.div
              key="symptom-tags"
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
                  What are you feeling? (pick several)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_TAGS.map((st, i) => (
                    <motion.button
                      key={st.key}
                      type="button"
                      onClick={() => toggleSymptomTag(st.key)}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.02 * i, duration: 0.22 }}
                      whileTap={{ scale: 0.92 }}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                        selectedSymptomTags.includes(st.key)
                          ? 'bg-coral/10 border-coral/40 text-coral'
                          : 'bg-surface border-gray-100 text-gray-400'
                      }`}
                    >
                      {st.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {type === 'appointment' && (
            <motion.div
              key="appt-fields"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 rounded-2xl border border-coral/25 bg-gradient-to-br from-coral/12 via-coral/5 to-white/60 p-4 shadow-soft"
            >
              {/* Hero animado: icono de calendario rebotando */}
              <div className="flex items-center gap-3 rounded-xl bg-white/75 px-3 py-2.5 backdrop-blur-sm">
                <motion.span
                  initial={{ rotate: -20, scale: 0.6 }}
                  animate={{ rotate: [0, -8, 8, -4, 0], scale: [0.6, 1.1, 1] }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" strokeLinejoin="round" />
                    <path d="M12 13v4M10 15h4" strokeLinecap="round" />
                  </svg>
                </motion.span>
                <div className="min-w-0 flex-1">
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-[10px] font-bold uppercase tracking-[0.16em] text-coral"
                  >
                    New medical appointment
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18, duration: 0.4 }}
                    className="mt-0.5 font-serif text-[14px] italic leading-snug text-ink"
                  >
                    Tell me who, when and what to bring.
                  </motion.p>
                </div>
              </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-coral">
                Who will you see
              </label>
              <input
                type="text"
                value={apptDoctor}
                onChange={(e) => setApptDoctor(e.target.value)}
                placeholder="e.g. Dr. Alice Smith"
                className="w-full rounded-xl border border-hairline bg-white/90 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-coral"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-coral">
                  Specialty · reason
                </label>
                <input
                  type="text"
                  value={apptSpecialty}
                  onChange={(e) => setApptSpecialty(e.target.value)}
                  placeholder="e.g. Endocrinology · TSH follow-up"
                  className="w-full rounded-xl border border-hairline bg-white/90 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-coral"
                />
              </div>
              <div className="w-[110px]">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-coral">
                  Time
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
                What to bring (optional)
              </label>
              <textarea
                value={apptBring}
                onChange={(e) => setApptBring(e.target.value)}
                rows={2}
                placeholder="Labs: T3, free T4, TPO, TSH…"
                className="w-full rounded-xl border border-hairline bg-white/90 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-coral resize-none"
              />
            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Label (hidden for walking/appointment) */}
        <AnimatePresence mode="wait">
          {type !== 'walking' && type !== 'appointment' && (
            <motion.div
              key={`label-${type}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
                {type === 'meal' ? 'What did you eat' : type === 'medication' ? 'Medication' : type === 'symptom' ? 'Brief description' : 'Note'}
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={
                  type === 'meal' ? 'e.g. Eggs with avocado' :
                  type === 'medication' ? `e.g. Levothyroxine ${LEVO_DOSE_LABEL}` :
                  type === 'symptom' ? 'e.g. Afternoon fatigue' :
                  'Write your note…'
                }
                className="w-full bg-surface border border-gray-100 rounded-2xl px-4 py-3 text-ink text-sm outline-none focus:border-sage transition-colors placeholder:text-gray-300"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emotional bubbles */}
        {type !== 'appointment' && (
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-widest font-medium block mb-2">
            Quick emotional state (optional)
          </label>
          <p className="text-[11px] text-muted mb-2 leading-snug">
            Saved in your history so tomorrow your copilot has context without you having to re-explain it.
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
            How did you feel overall? (optional)
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
            Additional notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={
              type === 'walking'
                ? 'e.g. Went out after lunch, drizzling but I made it 💪'
                : 'e.g. I felt sad because I snacked off plan…'
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
          {saving ? 'Saving…' : 'Save'}
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
              Absorption window
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              You took levothyroxine at {absorptionConflict.levoTimeLabel}. For best absorption, it’s common to wait at
              least <strong>{LEVO_ABSORPTION_MINUTES} min</strong> before food or coffee (only{' '}
              <strong>{absorptionConflict.minutesElapsed.toFixed(0)} min</strong> have passed; ~{' '}
              {Math.ceil(absorptionConflict.minutesRemaining)} min to go).
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted/90">
              HypoCopilot does not change your medication — this is an educational reminder. If your endocrinologist
              gave different guidance, follow theirs.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setAbsorptionConflict(null)}
                className="w-full rounded-2xl bg-sage py-3 text-sm font-semibold text-white shadow-soft"
              >
                Got it, I’ll wait
              </button>
              <button
                type="button"
                onClick={() => void handleSave(true)}
                disabled={saving}
                className="w-full rounded-2xl border border-hairline bg-surface py-3 text-sm font-semibold text-ink"
              >
                {saving ? 'Saving…' : 'Save anyway (I understand)'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
