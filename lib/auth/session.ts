export type HypoSession = {
  name: string;
  email?: string;
  /** Foto subida en el dispositivo (data URL) */
  avatarDataUrl?: string;
  /** Foto de perfil de Google (URL https) */
  avatarUrl?: string;
  createdAt: number;
};

const KEY = 'hypocopilot_session_v1';

export function readSession(): HypoSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== 'object' || typeof (p as HypoSession).name !== 'string') return null;
    return p as HypoSession;
  } catch {
    return null;
  }
}

export function saveSession(s: HypoSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
