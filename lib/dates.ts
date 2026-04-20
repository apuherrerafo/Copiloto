/**
 * Fecha calendario YYYY-MM-DD en la zona horaria local del dispositivo.
 * No usar toISOString().slice(0, 10) para “hoy”: es UTC y desfasa un día al anochecer.
 */
export function localDateISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysLocal(base: Date, deltaDays: number): Date {
  const n = new Date(base.getTime());
  n.setDate(n.getDate() + deltaDays);
  return n;
}

/** Fecha de ayer (calendario local), YYYY-MM-DD */
export function yesterdayISO(now = new Date()): string {
  return localDateISO(addDaysLocal(now, -1));
}
