'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  getTodayDidYouKnow,
  didYouKnowFooter,
  getTopicLabel,
  getEvidenceLabel,
} from '@/lib/content/did-you-know';
import { APP_NAME } from '@/lib/brand';

export default function DidYouKnowBanner() {
  const item = useMemo(() => getTodayDidYouKnow(), []);
  const router = useRouter();

  function handleLearnMore() {
    const question = `Quiero saber más sobre esto que leí hoy: "${item.fact.slice(0, 200)}…" ¿Puedes explicármelo con más detalle y conectarlo con mi protocolo de hipotiroidismo y levotiroxina?`;
    router.push(`/copiloto?q=${encodeURIComponent(question)}`);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-6 mb-5 rounded-card border border-amber/25 bg-gradient-to-br from-amber/10 via-surface to-sage/10 px-4 py-4 shadow-soft overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-sage/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber mb-1 relative">¿Sabías que?</p>
      <div className="flex flex-wrap gap-1.5 mb-2 relative">
        <span className="inline-block text-[10px] font-semibold text-sage bg-sage/15 px-2 py-0.5 rounded-full">
          {getTopicLabel(item.topic)}
        </span>
        {item.evidence && (
          <span className="inline-block text-[10px] font-medium text-muted bg-surface/80 border border-hairline px-2 py-0.5 rounded-full">
            {getEvidenceLabel(item.evidence)}
          </span>
        )}
      </div>
      <p className="text-sm text-ink leading-relaxed relative font-medium">{item.fact}</p>
      {item.hint && (
        <p className="text-[10px] text-muted mt-2 relative">Referencia: {item.hint}</p>
      )}

      {/* CTA: llevar al copiloto con la pregunta pre-cargada */}
      <button
        onClick={handleLearnMore}
        className="mt-3 relative flex items-center gap-1.5 text-xs font-semibold text-sage hover:text-sage/80 transition-colors group"
      >
        <span className="underline underline-offset-2 group-hover:no-underline">Quiero saber más</span>
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" stroke="currentColor" strokeWidth="2">
          <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <p className="text-[10px] text-muted/80 mt-3 leading-snug relative border-t border-hairline pt-2">
        {didYouKnowFooter()}
      </p>
      <p className="text-[9px] text-muted/60 mt-1 relative">{APP_NAME} · rotación diaria — 20 micro-lecciones curadas</p>
    </motion.section>
  );
}
