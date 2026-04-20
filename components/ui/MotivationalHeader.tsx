'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import GeneIcon from '@/components/ui/GeneIcon';
import { getMotivationalMessage } from '@/lib/content/motivational';

function todayLabel() {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function MotivationalHeader({ name }: { name?: string }) {
  const displayName = name?.trim() || 'Julio';
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMsg(getMotivationalMessage());

    // Rota el mensaje cada 4 minutos con fade
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsg(getMotivationalMessage(new Date()));
        setVisible(true);
      }, 400);
    }, 4 * 60 * 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-6 pt-12 pb-3">
      <p className="text-xs text-muted capitalize tracking-wide">{todayLabel()}</p>
      <div className="flex items-end justify-between mt-0.5">
        <h1 className="font-serif italic text-3xl text-ink">
          {greeting()}, {displayName}
        </h1>
        <Link
          href="/copiloto"
          className="flex items-center gap-1.5 bg-sage/10 text-sage text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sage/15 transition-colors shrink-0 ml-3"
        >
          <GeneIcon className="w-4 h-4 text-sage shrink-0" />
          Hypo
        </Link>
      </div>

      {/* Mensaje motivacional rotativo */}
      <AnimatePresence mode="wait">
        {visible && msg ? (
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm text-muted mt-1.5 leading-snug"
          >
            {msg}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
