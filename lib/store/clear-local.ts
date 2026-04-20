import { getDB } from '@/lib/store/db';

/** Borra logs, medidas corporales y preferencias locales (al cambiar de cuenta). No borra `hypocopilot_avatar_v1:*` (foto por email; se reusa al volver a entrar). */
export async function clearAllLocalUserData(): Promise<void> {
  const db = await getDB();
  await db.clear('logs');
  await db.clear('body');

  if (typeof window === 'undefined') return;
  const keys = Object.keys(localStorage);
  for (const k of keys) {
    if (k.startsWith('copiloto_checked_') || k === 'copiloto_profile') {
      localStorage.removeItem(k);
    }
  }
}
