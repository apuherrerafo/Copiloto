/** Recoge todas las claves copiloto_checked_* para subirlas a la nube. */
export function collectProtocolChecksForSync(): Record<string, Record<string, boolean>> {
  if (typeof window === 'undefined') return {};
  const out: Record<string, Record<string, boolean>> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith('copiloto_checked_')) continue;
    const date = k.replace('copiloto_checked_', '');
    try {
      const raw = localStorage.getItem(k);
      if (raw) out[date] = JSON.parse(raw) as Record<string, boolean>;
    } catch {
      /* ignore */
    }
  }
  return out;
}
