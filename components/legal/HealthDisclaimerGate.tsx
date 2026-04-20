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
          Antes de continuar
        </p>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
          <p>
            <strong className="text-ink">HypoCopilot no sustituye el criterio de tu médico o endocrinólogo.</strong> Es una
            herramienta de educación y organización: no diagnostica ni modifica dosis de medicación.
          </p>
          <p>
            <strong className="text-ink">HypoAI</strong> es inteligencia artificial y puede cometer errores. No tomes
            decisiones clínicas urgentes solo por lo que diga el chat. Ante síntomas graves (p. ej. dolor torácico,
            confusión súbita), acude a urgencias.
          </p>
          <p>
            Los datos sensibles de salud merecen cuidado: si activas sincronización en la nube, revisa la privacidad del
            servicio. Puedes usar la app principalmente en tu dispositivo (PWA).
          </p>
        </div>
        <button
          type="button"
          onClick={accept}
          className="mt-5 w-full rounded-2xl bg-sage py-3.5 text-sm font-semibold text-white shadow-soft"
        >
          Entiendo y continuar
        </button>
        <p className="mt-3 text-center text-[11px] text-muted">
          Más adelante podrás leer la política de privacidad completa en la app.
        </p>
      </div>
    </div>
  );
}
