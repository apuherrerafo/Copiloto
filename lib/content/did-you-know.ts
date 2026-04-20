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
 * 20 micro-lecciones curadas — tono accesible, estilo "¿Sabías que?" + biohacking práctico.
 * Inspirado en el enfoque de Ray Ramis (Hackea Tu Salud): hábitos pequeños, sin jerga,
 * ligados al hipotiroidismo con levotiroxina.
 * DISCLAIMER: educativas; no reemplazan valoración endocrinológica.
 */
export const DID_YOU_KNOW: DidYouKnowItem[] = [
  {
    topic: 'farmaco',
    fact: '¿Sabías que hay un mineral que tu cuerpo necesita para "convertir" la pastilla de tiroides en energía real? Se llama selenio y lo encuentras en 2–3 nueces de Brasil al día. Más no es mejor — el exceso también es tóxico.',
    hint: 'Selenio y conversión T4→T3 · Deiodinasas',
    evidence: 'fisiopatología',
  },
  {
    topic: 'tiroides',
    fact: '¿Sabías que muchas personas con hipotiroidismo duermen mal porque les falta magnesio? Este mineral relaja los músculos, baja el cortisol nocturno y mejora el sueño profundo. Fuentes: espinacas, semillas de calabaza, chocolate 85 %.',
    hint: 'Magnesio, sueño y eje tiroideo',
    evidence: 'consenso expertos',
  },
  {
    topic: 'sedentarismo',
    fact: '¿Sabías que caminar 10 minutos después de comer hace que tus músculos absorban el azúcar casi sin necesitar insulina? Con hipotiroidismo el metabolismo ya va más lento — esta caminata es el truco de biohacking más barato que existe.',
    hint: 'Movimiento posprandial y glucosa · Ray Ramis estilo',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'farmaco',
    fact: '¿Sabías que si tomas biotina (vitamina B7 o de pelo y uñas) y luego te sacas sangre, el resultado de TSH puede salir falso? Para una analítica fiable, deja de tomarla 2–3 días antes.',
    hint: 'Biotina e interferencia en ensayos de TSH · AACE 2019',
    evidence: 'consenso expertos',
  },
  {
    topic: 'tiroides',
    fact: '¿Sabías que el zinc no solo ayuda a producir hormona tiroidea sino que también le enseña a tus células a "escuchar" esa hormona? Sin zinc suficiente, aunque tengas la TSH normal, el cuerpo no responde bien. Fuentes: carnes rojas, semillas de calabaza, mariscos.',
    hint: 'Zinc y receptores de hormona tiroidea',
    evidence: 'fisiopatología',
  },
  {
    topic: 'tiroides',
    fact: '¿Sabías que tu hormona TSH no es igual por la mañana que por la tarde? Sube de madrugada y baja a media tarde. Por eso el análisis de sangre siempre hay que hacerlo en ayunas y a primera hora — así el número es real.',
    hint: 'Ritmo circadiano de TSH',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'tiroides',
    fact: '¿Sabías que puedes tener la TSH "normal" y seguir cansado porque te falta hierro? El hierro es el combustible que necesita tu glándula tiroides para fabricar hormona. Pídele a tu médico que revise también la ferritina (no solo el hierro sérico).',
    hint: 'Ferritina y síntesis de hormonas tiroideas',
    evidence: 'consenso expertos',
  },
  {
    topic: 'microbiota',
    fact: '¿Sabías que parte de la hormona tiroidea activa se produce en tu intestino, no en la glándula? Las bacterias buenas de tu microbiota ayudan en esa conversión. Por eso el ayuno intermitente bien hecho y la fibra vegetal son aliados del hipotiroidismo.',
    hint: 'Microbiota y conversión intestinal T4→T3',
    evidence: 'fisiopatología',
  },
  {
    topic: 'tiroides',
    fact: '¿Sabías que el hipotiroidismo puede hacer que sientas más frío que todos los demás, sobre todo en manos y pies? No es que seas raro — tu metabolismo basal va más lento de lo normal. Es una señal del cuerpo, no un defecto.',
    hint: 'Termorregulación e hipotiroidismo',
    evidence: 'fisiopatología',
  },
  {
    topic: 'sedentarismo',
    fact: '¿Sabías que pasar sentado más de 6 horas seguidas reduce la capacidad de tu cuerpo para usar la hormona tiroidea, aunque tomes la dosis correcta? Un pequeño descanso activo cada hora ya marca diferencia — incluso pararte 2 minutos suma.',
    hint: 'Sedentarismo y resistencia hormonal tiroidea',
    evidence: 'consenso expertos',
  },
  {
    topic: 'farmaco',
    fact: '¿Sabías que los cambios bruscos de fibra en tu dieta pueden cambiar cuánta pastilla absorbes? No hay que eliminar la fibra — solo ser consistente: si un día comes mucha ensalada y otro casi nada, tu cuerpo absorbe cantidades distintas de levotiroxina.',
    hint: 'Fibra y absorción de levotiroxina',
    evidence: 'consenso expertos',
  },
  {
    topic: 'biohack',
    fact: '¿Sabías que el estrés crónico puede "bloquear" los efectos de tu pastilla de tiroides? Cuando el cortisol está alto, el cuerpo convierte la hormona activa en una versión inútil. Ray Ramis lo llama "la trampa del estrés hormonal": gestionar el estrés es parte del tratamiento.',
    hint: 'Cortisol → T3 reversa (rT3) · deiodinasa tipo 3',
    evidence: 'fisiopatología',
  },
  {
    topic: 'tiroides',
    fact: '¿Sabías que tener la vitamina D baja es muy común en hipotiroidismo autoinmune? Y lo solucionas gratis: 10–15 minutos de sol en brazos y cara entre las 10 y las 14 h. Ray Ramis dice que esos 10 minutos valen más que muchos suplementos caros.',
    hint: 'Vitamina D y autoinmunidad tiroidea',
    evidence: 'meta-análisis',
  },
  {
    topic: 'farmaco',
    fact: '¿Sabías que la soja (leche de soja, tofu, edamame) puede reducir la cantidad de pastilla que absorbes si la comes muy cerca de la toma? No hay que dejarla para siempre — solo esperar al menos 3 horas después de tomar la levotiroxina.',
    hint: 'Soja e isoflavonas · absorción T4',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'farmaco',
    fact: '¿Sabías que la forma de tomar la pastilla importa tanto como la hora? Un vaso grande de agua (200 ml) ayuda a que se disuelva bien y llegue rápido al intestino. Un sorbo pequeño puede dejarla pegada y absorber menos. Detalle mínimo, efecto máximo.',
    hint: 'Disolución oral de levotiroxina · ATA guidelines',
    evidence: 'consenso expertos',
  },
  {
    topic: 'farmaco',
    fact: '¿Sabías que la bacteria H. pylori (que causa gastritis) puede hacer que necesites mayor dosis de levotiroxina? Reduce el ácido del estómago y la pastilla no se disuelve bien. Si llevas meses con dosis alta sin mejorar, vale la pena descartarlo con tu médico.',
    hint: 'H. pylori y malabsorción de T4',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'ayuno',
    fact: '¿Sabías que el café solo (sin leche ni azúcar) no rompe tu ayuno metabólico? Pero si le añades leche, azúcar o crema, activa insulina y frena los beneficios del ayuno que empiezan después de las 14–16 h de no comer. Black coffee = ayuno intacto.',
    hint: 'Autofagia y ayuno intermitente',
    evidence: 'fisiopatología',
  },
  {
    topic: 'tiroides',
    fact: '¿Sabías que el alcohol daña directamente las células de tu glándula tiroides? A largo plazo puede reducir la cantidad de tejido tiroideo activo, lo que significa que necesitas más pastilla para lograr el mismo efecto. No hay una dosis "segura" documentada para el hipotiroidismo.',
    hint: 'Alcohol y función tiroidea',
    evidence: 'consenso expertos',
  },
  {
    topic: 'farmaco',
    fact: '¿Sabías que si vives en una ciudad con "agua dura" (agua del grifo con mucho calcio) y tomas la pastilla con esa agua de forma irregular, puede afectar cuánto absorbes? Tomar siempre con agua filtrada o mineral baja en calcio es la opción más estable.',
    hint: 'Agua dura, calcio y absorción de T4',
    evidence: 'fisiopatología',
  },
  {
    topic: 'farmaco',
    fact: '¿Sabías que cambiar de marca de levotiroxina puede hacer que te sientas diferente aunque sea "la misma dosis"? Cada marca tiene rellenos distintos que afectan la velocidad de absorción. Si cambias de marca, pide un control de TSH al mes — no esperes la revisión anual.',
    hint: 'Bioequivalencia entre marcas de levotiroxina · ATA 2014',
    evidence: 'consenso expertos',
  },
  /* ──── BIOHACK + LONGEVIDAD ──── */
  {
    topic: 'biohack',
    fact: '¿Sabías que el frío activa la grasa parda — el tejido que literalmente quema calorías para producir calor? Una ducha fría de 30–90 segundos al final de tu baño puede activarla. En hipotiroidismo, donde el metabolismo ya va lento, esta es una de las herramientas más directas.',
    hint: 'Termogénesis de grasa parda · Ray Ramis – Biohacking aplicado',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'biohack',
    fact: '¿Sabías que la luz solar en los ojos (sin gafas, sin cristal) en los primeros 30 minutos después de despertar es el reset circadiano más potente que existe? Regula el cortisol matutino, mejora el sueño nocturno y estabiliza el eje tiroideo. Gratis, 5–10 minutos al día.',
    hint: 'Exposición lumínica y ritmo circadiano · Huberman Lab / Ray Ramis',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'biohack',
    fact: '¿Sabías que el ayuno de 16h activa un proceso llamado autofagia? Tu cuerpo "limpia" células dañadas y mitocondrias defectuosas. En hipotiroidismo, tener mitocondrias más eficientes se traduce directamente en más energía — sin cambiar la dosis.',
    hint: 'Autofagia e hipotiroidismo · Nobel Yoshinori Ohsumi 2016',
    evidence: 'fisiopatología',
  },
  {
    topic: 'biohack',
    fact: '¿Sabías que respirar por la boca durante el sueño (en lugar de la nariz) reduce el oxígeno en sangre y empeora la recuperación nocturna? En hipotiroidismo, donde el sueño ya tiende a ser menos reparador, tapar la boca con tape especializado durante la noche mejora el sueño profundo.',
    hint: 'Respiración nasal y calidad de sueño · Breath, James Nestor',
    evidence: 'consenso expertos',
  },
  {
    topic: 'biohack',
    fact: '¿Sabías que la creatina no es solo para deportistas? Suplementar con 3–5 g/día mejora la energía celular (ATP), la función cognitiva y reduce la fatiga crónica — síntoma muy común en hipotiroidismo. Es uno de los suplementos con más respaldo científico y más económicos.',
    hint: 'Creatina y función mitocondrial · meta-análisis ISSN 2023',
    evidence: 'meta-análisis',
  },
  {
    topic: 'biohack',
    fact: '¿Sabías que el 80 % de las personas con hipotiroidismo tiene el intestino permeable ("leaky gut")? Las uniones del intestino se abren y permiten que fragmentos de proteínas lleguen al torrente sanguíneo, activando respuestas autoinmunes. Colágeno, zinc y L-glutamina ayudan a repararlas.',
    hint: 'Intestino permeable y autoinmunidad tiroidea · Ray Ramis',
    evidence: 'fisiopatología',
  },
  {
    topic: 'biohack',
    fact: '¿Sabías que el ejercicio de fuerza (pesas, bandas) aumenta la sensibilidad celular a la hormona tiroidea? Tus músculos se vuelven mejores "receptores" de T3. 2–3 sesiones de fuerza por semana pueden hacer que te sientas mejor incluso sin cambiar la dosis de levotiroxina.',
    hint: 'Fuerza muscular y receptores T3 · Ray Ramis – Hackea Tu Salud',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'biohack',
    fact: '¿Sabías que el estrés oxidativo es mayor en hipotiroidismo y que los antioxidantes de los vegetales de colores lo combaten directamente? Rojo (tomate, pimiento), naranja (zanahoria, mango), verde (brócoli, espinaca): cada color es un grupo de antioxidantes distinto. El objetivo: 5 colores al día.',
    hint: 'Estrés oxidativo e hipotiroidismo · Ray Ramis – biohack nutricional',
    evidence: 'consenso expertos',
  },
  {
    topic: 'biohack',
    fact: '¿Sabías que dormir menos de 7h durante 3 noches seguidas reduce la T3 activa casi como si bajaras la dosis de levotiroxina? El sueño es cuando tu hígado convierte T4 en T3 con más eficiencia. No hay pastilla ni suplemento que compense un sueño consistente.',
    hint: 'Sueño y conversión T4→T3 hepática · Ray Ramis',
    evidence: 'ensayo clínico',
  },
  {
    topic: 'tiroides',
    fact: '¿Sabías que la TSH es un promedio de semanas, no de horas? Si un día te sacas sangre estresado, después de viajar o sin haber dormido, la TSH puede salir alterada sin que tu tiroides haya cambiado. Sácatela siempre en condiciones similares: mismo horario, descansado, en ayunas.',
    hint: 'Variabilidad de TSH y condiciones del análisis · endocrinología clínica',
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
