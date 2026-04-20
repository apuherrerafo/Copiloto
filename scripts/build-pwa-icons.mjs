/**
 * Genera icon-192.png e icon-512.png desde public/icons/icon.svg (para PWA / notificaciones).
 * Ejecutar tras cambiar el SVG: npm run icons:build
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'icons', 'icon.svg');
const input = readFileSync(svgPath);

for (const size of [192, 512]) {
  const out = join(root, 'public', 'icons', `icon-${size}.png`);
  await sharp(input).resize(size, size).png().toFile(out);
  console.log('Wrote', out);
}
