/**
 * Foto de perfil subida en el dispositivo: sobrevive a `clearSession()` / logout
 * (claveada por email para no mezclar cuentas en el mismo navegador).
 */
const PREFIX = 'hypocopilot_avatar_v1:';

export function normalizeEmailForAvatarKey(email: string): string {
  return email.trim().toLowerCase();
}

export function readPersistedAvatarDataUrl(email: string | undefined | null): string | undefined {
  if (!email || typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(PREFIX + normalizeEmailForAvatarKey(email));
    return raw && raw.startsWith('data:') ? raw : undefined;
  } catch {
    return undefined;
  }
}

export function writePersistedAvatarDataUrl(email: string, dataUrl: string): void {
  if (typeof window === 'undefined' || !email.trim() || !dataUrl.startsWith('data:')) return;
  try {
    localStorage.setItem(PREFIX + normalizeEmailForAvatarKey(email), dataUrl);
  } catch {
    /* quota full — la sesión en curso sigue teniendo la foto en memoria */
  }
}

export function clearPersistedAvatarDataUrl(email: string): void {
  if (typeof window === 'undefined' || !email.trim()) return;
  try {
    localStorage.removeItem(PREFIX + normalizeEmailForAvatarKey(email));
  } catch {
    /* ignore */
  }
}
