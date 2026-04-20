/** Sonido UI muy corto (Web Audio). Puede fallar silenciosamente si el navegador bloquea audio. */
export function playUiSound(kind: 'success' | 'tap' | 'celebrate' = 'tap'): void {
  if (typeof window === 'undefined') return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const f =
      kind === 'celebrate' ? 659.25 : kind === 'success' ? 523.25 : 392;
    const now = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.22);
    setTimeout(() => ctx.close().catch(() => {}), 400);
  } catch {
    /* sin audio */
  }
}
