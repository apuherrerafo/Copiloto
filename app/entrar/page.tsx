'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { saveSession } from '@/lib/auth/session';
import { useHypoSession } from '@/components/layout/AppShell';
import { APP_NAME, APP_TAGLINE } from '@/lib/brand';
import { playUiSound } from '@/lib/sounds';

const MAX_AVATAR_BYTES = 380_000;

export default function EntrarPage() {
  const router = useRouter();
  const { refresh } = useHypoSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>();
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | null) {
    setErr('');
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setErr('Usa una imagen (JPG o PNG).');
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      const data = String(r.result ?? '');
      if (data.length > MAX_AVATAR_BYTES) {
        setErr('La imagen es muy pesada; prueba otra más pequeña.');
        return;
      }
      setAvatar(data);
    };
    r.readAsDataURL(f);
  }

  function submit() {
    const n = name.trim();
    if (n.length < 2) {
      setErr('Escribe al menos tu nombre o apodo.');
      return;
    }
    playUiSound('success');
    saveSession({
      name: n,
      email: email.trim() || undefined,
      avatarDataUrl: avatar,
      createdAt: Date.now(),
    });
    refresh();
    router.replace('/');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-card border border-hairline bg-surface shadow-soft p-6"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage mb-1">{APP_NAME}</p>
        <h1 className="font-serif italic text-2xl text-ink leading-tight">Inicia sesión</h1>
        <p className="text-xs text-muted mt-2 leading-relaxed">{APP_TAGLINE}</p>
        <p className="text-[10px] text-muted/70 mt-2">
          Los datos viven en este dispositivo (IndexedDB). Próximo paso profesional: cuenta en la nube.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full border-2 border-dashed border-sage/40 overflow-hidden bg-background flex items-center justify-center text-xs text-muted hover:border-sage/70 transition-colors"
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <>Foto</>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </div>

        <label className="block mt-5 text-[10px] uppercase tracking-widest text-muted font-medium">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Julio"
          className="mt-1 w-full rounded-xl border border-hairline bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-sage focus:ring-2 focus:ring-sage/15"
        />

        <label className="block mt-3 text-[10px] uppercase tracking-widest text-muted font-medium">Correo (opcional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="para futuras cuentas"
          className="mt-1 w-full rounded-xl border border-hairline bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-sage focus:ring-2 focus:ring-sage/15"
        />

        {err && <p className="text-xs text-coral mt-3">{err}</p>}

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={submit}
          className="mt-6 w-full rounded-xl bg-sage py-3.5 text-sm font-semibold text-white shadow-soft hover:bg-sage/90 transition-colors"
        >
          Entrar
        </motion.button>
      </motion.div>
    </div>
  );
}
