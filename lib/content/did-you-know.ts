import { APP_NAME } from '@/lib/brand';

export type DidYouKnowTopic = 'tiroides' | 'biohack' | 'sedentarismo' | 'ayuno' | 'farmaco' | 'microbiota';

export type EvidenceLevel = 'meta-análisis' | 'ensayo clínico' | 'consenso expertos' | 'fisiopatología';

export type DidYouKnowItem = {
  fact: string;
  topic: DidYouKnowTopic;
  hint?: string;
  evidence?: EvidenceLevel;
};

/**
 * 20 micro-lecciones curadas (fuente: output Deep Research Gemini + revisión biopsicosocial).
 * Incluyen referencia temática y nivel de evidencia.
 * DISCLAIMER: son educativas; no reemplazan valoración endocrinológica.
 */
export const DID_YOU_KNOW: DidYouKnowItem[] = [
  {
    topic: 'farmaco',
    fact: 'El selenio es cofactor esencial de las enzimas deiodinasas que transforman la T4 (inactiva) en T3 (la hormona que tus células usan para producir energía). Fuentes alimentarias: nueces de Brasil, atún, sardinas.',
    hint: 'Conversión T4→T3 · Deiodinasas tipo 1 y 2',
    evidence: 'fisiopatología',
  },
  {
    topic: 'tiroides',
    fact: 'Muchas personas con hipotiroidismo tienen niveles bajos de magnesio. Este mineral es clave para relajar los músculos y mejorar el sueño profundo, que a su vez apoya el eje tiroideo.',
    hint: 'Magnesio y sueño · PMID revisiones de micronutrientes',
    evidence: 'consenso expertos',
  },
  {
    topic: 'sedentarismo',
    fact: 'Caminar después de comer activa los transportadores GLUT4 en los músculos de forma independiente a la insulina, reduciendo el pico glucémico en un 12–18 % incluso con metabolismo lento.',
    hint: 'GLUT4 independiente de insulina · ensayo posprandial',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'farmaco',
    fact: 'La biotina (vitamina B7) puede interferir con los ensayos de TSH dando resultados falsamente bajos. Se recomienda suspenderla 48–72 h antes de una analítica para no confundir al médico.',
    hint: 'Biotina + ensayos TSH · AACE 2019',
    evidence: 'consenso expertos',
  },
  {
    topic: 'tiroides',
    fact: 'El zinc es necesario tanto para sintetizar hormona tiroidea como para que los receptores dentro de las células puedan "leer" la señal de la T3. Su deficiencia puede imitar síntomas de hipotiroidismo.',
    hint: 'Zinc y receptores de hormona tiroidea',
    evidence: 'fisiopatología',
  },
  {
    topic: 'tiroides',
    fact: 'Tus niveles de TSH no son constantes durante el día: alcanzan el pico máximo en la madrugada y el mínimo por la tarde. Por eso los análisis se hacen siempre a primera hora del día en ayunas.',
    hint: 'Ritmo circadiano de TSH · ensayos hormonales',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'tiroides',
    fact: 'Si tienes TSH normal pero sigues con fatiga intensa, pide a tu médico que revise la ferritina. El hierro es indispensable para la síntesis de hormonas tiroideas dentro de la glándula.',
    hint: 'Hierro y tiropoxidasa · ferritina sérica',
    evidence: 'consenso expertos',
  },
  {
    topic: 'microbiota',
    fact: 'Cerca del 20 % de la conversión de T4 a T3 ocurre en el intestino gracias a la microbiota saludable. El ayuno y la dieta variada en fibra apoyan esa diversidad microbiana.',
    hint: 'Conversión intestinal T4→T3 · microbioma',
    evidence: 'fisiopatología',
  },
  {
    topic: 'tiroides',
    fact: 'El hipotiroidismo ralentiza el metabolismo basal, lo que puede hacer que sientas más frío que los demás, sobre todo en manos y pies. Es una señal del cuerpo, no un defecto tuyo.',
    hint: 'Termorregulación e hipotiroidismo',
    evidence: 'fisiopatología',
  },
  {
    topic: 'sedentarismo',
    fact: 'Pasar más de 6 horas sentado reduce la sensibilidad de los tejidos a la hormona tiroidea de forma independiente a la dosis que tomes. Un microdescanso de movimiento cada hora suma.',
    hint: 'Sedentarismo y resistencia hormonal tiroidea',
    evidence: 'consenso expertos',
  },
  {
    topic: 'farmaco',
    fact: 'No necesitas evitar la fibra, pero sí consumirla de forma constante. Cambios bruscos en la ingesta de fibra pueden alterar la cantidad de levotiroxina que absorbes en las siguientes horas.',
    hint: 'Fibra y absorción de levotiroxina · consistencia dietética',
    evidence: 'consenso expertos',
  },
  {
    topic: 'biohack',
    fact: 'El estrés crónico eleva el cortisol, que desvía la conversión hormonal hacia la T3 reversa (rT3): una forma metabólicamente inactiva que "bloquea" los receptores de T3 activa.',
    hint: 'Cortisol → rT3 · deiodinasa tipo 3',
    evidence: 'fisiopatología',
  },
  {
    topic: 'tiroides',
    fact: 'Niveles bajos de Vitamina D son comunes en tiroiditis de Hashimoto y se asocian con anticuerpos anti-TPO más elevados. Exponerte al sol 10–15 min en la mañana tiene cero costo.',
    hint: 'Vitamina D y autoinmunidad tiroidea · PMID reviews',
    evidence: 'meta-análisis',
  },
  {
    topic: 'farmaco',
    fact: 'La soja puede inhibir la peroxidasa tiroidea, pero su efecto principal es interferir con la absorción intestinal de la medicación si se consume muy cerca de la toma de levotiroxina.',
    hint: 'Soja e isoflavonas · absorción T4',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'farmaco',
    fact: 'Tomar la pastilla con un vaso lleno de agua (200 ml) ayuda a que la tableta llegue rápidamente al estómago y se disuelva de manera uniforme, maximizando la superficie de absorción.',
    hint: 'Disolución oral de levotiroxina · ATA guidelines',
    evidence: 'consenso expertos',
  },
  {
    topic: 'farmaco',
    fact: 'La bacteria H. pylori puede reducir la acidez gástrica, lo que dificulta la disolución de la tableta de levotiroxina y puede obligar a aumentar la dosis para obtener el mismo efecto sérico.',
    hint: 'H. pylori y malabsorción de T4 · gastritis atrófica',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'ayuno',
    fact: 'Durante el ayuno, el café solo o té sin azúcar no elevan insulina de forma significativa, pero añadirles leche o azúcar puede frenar los beneficios de la autofagia que empieza a las ~14–16 h.',
    hint: 'Autofagia y ayuno intermitente · Ohsumi Nobel 2016',
    evidence: 'fisiopatología',
  },
  {
    topic: 'tiroides',
    fact: 'El alcohol tiene efecto tóxico directo sobre las células tiroideas (tirocitos) y puede reducir el volumen glandular activo a largo plazo, sumando una carga al hipotiroidismo ya presente.',
    hint: 'Alcohol y función tiroidea',
    evidence: 'consenso expertos',
  },
  {
    topic: 'farmaco',
    fact: 'Si vives en una zona con "agua dura" (mucho calcio), tomarla con la pastilla de forma inconsistente puede afectar levemente la absorción. Agua filtrada o mineral baja en calcio es la opción más estable.',
    hint: 'Agua dura y calcio · absorción de T4',
    evidence: 'fisiopatología',
  },
  {
    topic: 'farmaco',
    fact: 'Diferentes marcas de levotiroxina pueden tener excipientes distintos que afectan la velocidad de absorción. Cambiar de marca sin ajuste de TSH posterior puede crear variaciones inesperadas.',
    hint: 'Bioequivalencia entre marcas de levotiroxina · ATA 2014',
    evidence: 'consenso expertos',
  },
];

const TOPIC_LABEL: Record<DidYouKnowTopic, string> = {
  tiroides: 'Tiroides',
  biohack: 'Biohack',
  sedentarismo: 'Movimiento',
  ayuno: 'Ayuno',
  farmaco: 'Farmacología',
  microbiota: 'Microbiota',
};

const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  'meta-análisis': '🔬 Meta-análisis',
  'ensayo clínico': '🧪 Ensayo clínico',
  'consenso expertos': '📋 Consenso expertos',
  fisiopatología: '🔭 Fisiopatología',
};

export function getTopicLabel(t: DidYouKnowTopic): string {
  return TOPIC_LABEL[t] ?? t;
}

export function getEvidenceLabel(e?: EvidenceLevel): string {
  return e ? EVIDENCE_LABEL[e] ?? e : '';
}

/** Índice estable por día local (rota el contenido cada día). */
export function pickDidYouKnowIndex(): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return dayOfYear % DID_YOU_KNOW.length;
}

export function getTodayDidYouKnow(): DidYouKnowItem {
  return DID_YOU_KNOW[pickDidYouKnowIndex()]!;
}

export function didYouKnowFooter(): string {
  return `${APP_NAME} — divulgación educativa; no reemplaza tu endocrinólogo ni cambia tu dosis.`;
}
