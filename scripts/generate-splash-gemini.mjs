/**
 * Genera public/splash-hero.png con Gemini (modelo nativo de imagen, p. ej. 3.1).
 *
 * Requisitos:
 *   - Clave en https://aistudio.google.com/apikey
 *   - En la raíz del proyecto: GEMINI_API_KEY en .env.local (o export en shell)
 *
 * Uso:
 *   node scripts/generate-splash-gemini.mjs
 *
 * Opcional:
 *   GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outPath = resolve(root, 'public', 'splash-hero.png');

function loadDotEnvLocal() {
  const p = resolve(root, '.env.local');
  if (!existsSync(p)) return;
  const raw = readFileSync(p, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadDotEnvLocal();

const apiKey = process.env.GEMINI_API_KEY;
const model =
  process.env.GEMINI_IMAGE_MODEL?.trim() || 'gemini-3.1-flash-image-preview';

/** Concepto hipotiroidismo: lentitud metabólica, equilibrio térmico, ritmo circadiano — sin anatomía. */
const PROMPT = `Create a single vertical mobile splash illustration (9:16) for an app called HypoCopilot about living well with hypothyroidism.

CONCEPT (abstract, poetic, NOT literal):
- The feeling of a body that used to run "cold and slow" finding a steady, warmer rhythm.
- Dawn light: cool blue-gray mist at the bottom lifting into soft amber and warm cream at the top — like metabolism gently waking up.
- One very subtle motif: a slow sine wave or soft pulse line crossing the canvas once, suggesting hormone rhythm and patience (not a heartbeat monitor, not an ECG grid).
- Tiny soft particles like dust in morning light — calm, hopeful, not clinical.

STYLE:
- Premium editorial / contemporary wellness art direction.
- Soft sage green (#5a7d6a), warm sand, muted slate, touches of pale gold. Plenty of breathing room (negative space).
- Painterly or soft gradient digital art — NOT photorealistic, NOT 3D render, NOT stock photo.

STRICTLY FORBIDDEN:
- No thyroid gland shape, no butterfly organ silhouette, no neck, no pills, no syringes, no hospital crosses, no stethoscopes, no DNA double helix, no molecular diagrams, no lab glassware, no charts, no text, no logos, no faces, no hands.`;

async function main() {
  if (!apiKey) {
    console.error(
      'Falta GEMINI_API_KEY. Añádela en .env.local (Google AI Studio) y vuelve a ejecutar:\n' +
        '  node scripts/generate-splash-gemini.mjs',
    );
    process.exit(1);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: PROMPT }],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: '9:16',
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error('Error API Gemini:', res.status, JSON.stringify(json, null, 2));
    process.exit(1);
  }

  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    console.error('Respuesta inesperada (sin parts):', JSON.stringify(json, null, 2));
    process.exit(1);
  }

  let b64 = null;
  let mime = 'image/png';
  for (const part of parts) {
    const id = part.inlineData || part.inline_data;
    if (id?.data) {
      b64 = id.data;
      mime = id.mimeType || id.mime_type || mime;
      break;
    }
  }

  if (!b64) {
    console.error(
      'No se recibió imagen en la respuesta. ¿El modelo soporta IMAGE?\n' +
        'Prueba GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview en Google AI Studio.\n',
      JSON.stringify(json, null, 2).slice(0, 2000),
    );
    process.exit(1);
  }

  const buf = Buffer.from(b64, 'base64');
  writeFileSync(outPath, buf);
  console.log('OK →', outPath, `(${mime}, ${buf.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
