import type { LogEntry } from '@/lib/store/db';

export type YesterdayRecap = {
  headline: string;
  lead: string;
  bullets: string[];
  microGoal: string;
};

const GUILT_HINTS = [
  'no debí', 'no debi', 'arrepent', 'culpa', 'equivoc', 'impuls',
  'compré', 'compre', 'no me aguant', 'me aguant', 'debí evitar',
  'debi evitar', 'triste', 'mal conmigo', '[culpa]', '[impulso]',
];

function textBlob(e: LogEntry): string {
  return `${e.label} ${e.notes ?? ''}`.toLowerCase();
}

function hasGuiltTone(entries: LogEntry[]): boolean {
  return entries.some((e) => GUILT_HINTS.some((h) => textBlob(e).includes(h)));
}

function avgMood(entries: LogEntry[]): number | null {
  const moods = entries.filter((e) => e.mood != null).map((e) => e.mood as number);
  if (!moods.length) return null;
  return moods.reduce((a, b) => a + b, 0) / moods.length;
}

function totalWalkMin(entries: LogEntry[]): number {
  return entries
    .filter((e) => e.type === 'walking')
    .reduce((sum, e) => sum + (e.durationMin ?? 10), 0);
}

function hasSymptom(entries: LogEntry[], tag: string): boolean {
  return entries
    .filter((e) => e.type === 'symptom')
    .some(
      (e) =>
        (e.symptomTags ?? []).includes(tag as never) ||
        textBlob(e).includes(tag),
    );
}

/** Resumen empático + motivacional + micro-objetivo adaptativo (sin LLM). */
export function buildYesterdayRecap(entries: LogEntry[]): YesterdayRecap | null {
  if (!entries.length) return null;

  const meals    = entries.filter((e) => e.type === 'meal');
  const meds     = entries.filter((e) => e.type === 'medication');
  const notes    = entries.filter((e) => e.type === 'note');
  const symptoms = entries.filter((e) => e.type === 'symptom');
  const walks    = entries.filter((e) => e.type === 'walking');
  const guilt    = hasGuiltTone(entries);
  const moodAvg  = avgMood(entries);
  const lowMood  = moodAvg != null && moodAvg < 2.6;
  const walkMin  = totalWalkMin(entries);
  const hadFatigue = hasSymptom(entries, 'fatiga');
  const hadFog     = hasSymptom(entries, 'niebla_mental');

  const bullets: string[] = [];

  // Comidas
  if (meals.length === 1) {
    bullets.push(
      `Registraste una comida: "${meals[0].label.slice(0, 42)}${meals[0].label.length > 42 ? '…' : ''}".`,
    );
  } else if (meals.length > 1) {
    bullets.push(`Registraste ${meals.length} comidas — eso ya es trazabilidad real.`);
  }

  // Medicación
  if (meds.length) {
    bullets.push('Registraste tu medicación: constancia en la toma marca la diferencia en T4 sérica a largo plazo.');
  }

  // Caminatas
  if (walks.length > 0) {
    if (walkMin >= 20) {
      bullets.push(
        `Caminaste ~${walkMin} min — eso activa GLUT4 muscular y reduce picos glucémicos posprandiales. Sigue así.`,
      );
    } else {
      bullets.push(`Registraste ${walks.length} caminata(s) (~${walkMin} min). Cada paso suma al control glucémico.`);
    }
  } else {
    bullets.push('Movimiento: ayer sin caminatas registradas. Hoy intenta 10 min post-almuerzo — es la de mayor impacto.');
  }

  // Síntomas
  if (symptoms.length) {
    const tags = symptoms.flatMap((e) => e.symptomTags ?? []);
    const uniqueTags = [...new Set(tags)];
    const tagStr = uniqueTags.length
      ? uniqueTags.slice(0, 3).join(', ')
      : symptoms[0].label.slice(0, 30);
    bullets.push(
      `Anotaste síntomas: ${tagStr}. Si se repiten más de 3 días seguidos, llévalo a tu próxima consulta con el registro de HypoCopilot.`,
    );
  }

  // Notas con contexto
  if (notes.length || entries.some((e) => (e.notes ?? '').length > 10)) {
    bullets.push('Dejaste contexto en notas: tu historial con notas es mucho más útil para entender tendencias.');
  }

  // Headline y lead adaptativos
  let headline = 'Ayer quedó registrado';
  let lead =
    'Cada día es una línea nueva en tu protocolo. Hoy puedes ajustar una sola cosa y ya cambia la curva metabólica.';

  if (guilt || lowMood) {
    headline = 'Ayer fue difícil — y está bien';
    lead =
      'Equivocarse no borra el protocolo. Fisiológicamente, una comida fuera de ventana no anula tu T4 ni tu adherencia general. Lo que importa: hoy pastilla a su hora, ventana 12–20, una caminata. Eso ya es ganar.';
  } else if (moodAvg != null && moodAvg >= 3.5 && walks.length > 0) {
    headline = 'Ayer fue un buen día metabólico';
    lead =
      'Estado de ánimo positivo + movimiento registrado: esa combinación apoya la conversión T4→T3 periférica y reduce el cortisol basal. Mantén ese ritmo hoy.';
  } else if (moodAvg != null && moodAvg >= 3.5) {
    headline = 'Ayer se sintió mejor de lo que crees';
    lead =
      'Tu registro refleja un ánimo más estable. Mantén el ritmo: ventana 12–20, pastilla con su espacio, y una caminata ligera post-almuerzo.';
  }

  // Micro-objetivo adaptativo (Gemini UX flow)
  let microGoal =
    'Hoy: una decisión pequeña a la vez. Si dudas, abre el chat con contexto.';

  if (hadFatigue && walks.length === 0) {
    microGoal =
      'Micro-objetivo: 5 min de estiramientos suaves post-almuerzo. La fatiga con hipotiroidismo mejora con movimiento gentil, no con reposo total.';
  } else if (hadFog) {
    microGoal =
      'Micro-objetivo: hidratación (8 vasos hoy) y 10 min de caminata post-almuerzo. La niebla mental mejora con perfusión cerebral y glucosa estable.';
  } else if (walks.length === 0 && meals.length > 0) {
    microGoal =
      'Micro-objetivo: 10 min de caminata después del almuerzo de hoy. Sin zapatillas especiales, sin planificación extra.';
  } else if (walkMin < 15 && walks.length > 0) {
    microGoal =
      'Micro-objetivo: lleva la caminata post-cena a 15 min hoy. Solo 5 minutos más que ayer.';
  } else if (guilt) {
    microGoal =
      'Micro-objetivo: una comida alineada a tu ventana hoy es suficiente para volver al ritmo. Sin compensar, sin restricción extra.';
  } else if (moodAvg != null && moodAvg >= 4) {
    microGoal =
      'Estás en buen ritmo. Hoy: mantén la toma de pastilla puntual y celebra cada hábito cumplido — el refuerzo positivo consolida el protocolo.';
  }

  if (!bullets.length) {
    bullets.push(`Registraste ${entries.length} evento(s): seguir registrando es el hábito más "pro".`);
  }

  bullets.push('Abre el chat si quieres explicación científica de algo de ayer — HypoCopilot tiene el contexto.');

  return { headline, lead, bullets: bullets.slice(0, 5), microGoal };
}
