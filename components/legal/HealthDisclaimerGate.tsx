'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'hypo_health_disclaimer_v1';

/**
 * Una sola vez tras actualizar: aceptación de avisos legales / educativos (no sustituto médico, IA).
 */
export default function HealthDisclaimerGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/50 px-3 pb-6 pt-12 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-hairline bg-background px-5 py-5 shadow-lift">
        <p id="disclaimer-title" className="font-serif text-xl italic text-ink">
          Before you continue
        </p>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
          <p>
            <strong className="text-ink">HypoCopilot does not replace your doctor’s or endocrinologist’s judgment.</strong> It
            is an education and organization tool: it does not diagnose or adjust medication doses.
          </p>
          <p>
            <strong className="text-ink">HypoAI</strong> is artificial intelligence and can make mistakes. Don’t make
            urgent clinical decisions based only on what the chat says. For severe symptoms (e.g. chest pain, sudden
            confusion), go to the emergency room.
          </p>
          <p>
            Sensitive health data deserves care: if you enable cloud sync, review the service’s privacy terms. You can
            primarily use the app on your device (PWA).
          </p>
        </div>
        <button
          type="button"
          onClick={accept}
          className="mt-5 w-full rounded-2xl bg-sage py-3.5 text-sm font-semibold text-white shadow-soft"
        >
          I understand — continue
        </button>
        <p className="mt-3 text-center text-[11px] text-muted">
          You’ll be able to read the full privacy policy in the app later.
        </p>
      </div>
    </div>
  );
}
