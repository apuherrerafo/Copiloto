/**
 * Resumen curado para el system prompt (sustituir o ampliar con salida de tu revisión en Gemini).
 * Mantener acotado para no inflar tokens en cada request.
 */
export const BIOHACK_TIROIDES_SNIPPET = `
## BIOHACK AND THYROID (summary for the copilot)
- Morning light and sleep–wake rhythm support metabolic regulation; avoiding harsh screens very late may help rest (not a substitute for thyroid treatment).
- Chronic stress and poor sleep worsen perceived fatigue; steady sleep fits the protocol; if fatigue is new or severe, send them to a clinician.
- Caffeine: respect the 60+ min window after levothyroxine; coffee while fasting before the pill does not count — water only with the dose.
- 16:8 fasting: already in the protocol; do not stretch past ~17h; avoid stacking abrupt supplement shifts (iron/calcium) without spacing around the pill.
- Cold / mild exposure: mixed evidence in humans; not mandatory; skip if hypotension, dizziness, or medical contraindication.
- Do not suggest changing levothyroxine dose or iodine-heavy supplements without medical supervision.
`.trim();
