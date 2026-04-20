'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getTodayDidYouKnow,
  getTopicLabel,
  getEvidenceLabel,
} from '@/lib/content/did-you-know';
import HypoMascot from '@/components/ui/HypoMascot';

/** compact=true → chip minimalista para el hero; false → tarjeta acordeón clásica */
export default function DidYouKnowBanner({ compact = false }: { compact?: boolean }) {
  const item = useMemo(() => getTodayDidYouKnow(), []);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleLearnMore() {
    const question = `Quiero saber más sobre esto que leí hoy: "${item.fact.slice(0, 200)}…" ¿Puedes explicármelo con más detalle y conectarlo con mi protocolo de hipotiroidismo y levotiroxina?`;
    router.push(`/copiloto?q=${encodeURIComponent(question)}`);
  }

  /* ── Variante compacta para el hero ── */
  if (compact) {
    return (
      <>
        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex items-center gap-1 bg-amber/12 border border-amber/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-amber backdrop-blur-sm active:scale-95 transition-transform"
        >
          <span>💡</span>
          <span>¿Sabías que?</span>
          <span className="text-amber/60 text-[10px] max-w-[140px] truncate hidden sm:inline">
            {item.fact.slice(0, 38)}…
          </span>
          <motion.svg
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-3 h-3 shrink-0"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.button>

        {/* Bottom sheet expandido */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
                onClick={() => setOpen(false)}
              />
              <motion.div
                key="sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl px-6 pt-5 pb-10 shadow-2xl"
              >
                <div className="w-10 h-1 bg-ink/12 rounded-full mx-auto mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber mb-1">💡 ¿Sabías que?</p>
                {item.evidence && (
                  <span className="inline-block text-[10px] font-medium text-muted bg-surface border border-hairline px-2 py-0.5 rounded-full mb-3">
                    {getEvidenceLabel(item.evidence)}
                  </span>
                )}
                <p className="text-base text-ink leading-relaxed font-medium">{item.fact}</p>
                {item.hint && (
                  <p className="text-[10px] text-muted mt-3">Referencia: {item.hint}</p>
                )}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleLearnMore}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sage py-3 text-sm font-semibold text-white"
                  >
                    <HypoMascot size={20} />
                    Preguntarle a Hypo
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="px-5 rounded-2xl border border-hairline text-sm text-muted"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  /* ── Variante acordeón estándar ── */
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-6 mb-4 rounded-card border border-amber/25 bg-gradient-to-br from-amber/8 via-surface to-sage/8 shadow-soft overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="text-base shrink-0">💡</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber leading-none mb-0.5">¿Sabías que?</p>
          <p className="text-xs text-ink font-medium leading-snug line-clamp-1 truncate">
            {item.fact.slice(0, 72)}…
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold text-sage bg-sage/12 px-2 py-0.5 rounded-full">
            {getTopicLabel(item.topic)}
          </span>
          <motion.svg
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-3.5 h-3.5 text-muted shrink-0"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-amber/15">
              {item.evidence && (
                <span className="inline-block text-[10px] font-medium text-muted bg-surface/80 border border-hairline px-2 py-0.5 rounded-full mt-3 mb-2">
                  {getEvidenceLabel(item.evidence)}
                </span>
              )}
              <p className="text-sm text-ink leading-relaxed font-medium">{item.fact}</p>
              {item.hint && (
                <p className="text-[10px] text-muted mt-2">Referencia: {item.hint}</p>
              )}
              <button
                onClick={handleLearnMore}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-sage hover:text-sage/80 transition-colors group"
              >
                <span className="underline underline-offset-2 group-hover:no-underline">Preguntarle a Hypo →</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
