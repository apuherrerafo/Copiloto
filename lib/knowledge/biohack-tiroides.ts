/**
 * Resumen curado para el system prompt (sustituir o ampliar con salida de tu revisión en Gemini).
 * Mantener acotado para no inflar tokens en cada request.
 */
export const BIOHACK_TIROIDES_SNIPPET = `
## BIOHACK Y TIROIDES (resumen para el copiloto)
- Luz matutina y ritmo sueño-vigilia apoyan regulación metabólica; evitar pantallas intensas muy tarde puede ayudar al descanso (no sustituye tratamiento tiroideo).
- Estrés crónico y mal sueño empeoran sensación de fatiga; priorizar sueño regular encaja con tu protocolo; si la fatiga es nueva o severa, derivar al médico.
- Cafeína: respeta la ventana de 60+ min tras levotiroxina; el café en ayunas antes de la pastilla no aplica — solo agua con la dosis.
- Ayuno 16:8: ya está en tu protocolo; no prolongar por encima de 17h; no combinar con cambios bruscos de suplementos (hierro/calcio) sin espaciar respecto a la pastilla.
- Frío / exposición leve: evidencia mixta en humanos; no es obligatorio; evitar si hay hipotensión, mareos o contraindicación médica.
- No sugerir cambiar dosis de levotiroxina ni suplementos con yodo sin supervisión médica.
`.trim();
