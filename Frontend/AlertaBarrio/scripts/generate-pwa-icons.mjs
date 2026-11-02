import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SOURCE = new URL('../public/alertabarrio-logo.svg', import.meta.url);
const OUT = new URL('../public/', import.meta.url);

const source = await readFile(SOURCE, 'utf8');
const glyph = source.match(/d="([^"]+)"/)?.[1];

if (!glyph) {
  throw new Error('No se encontro el path del logo en alertabarrio-logo.svg');
}

const buildSvg = (size, ratio) => {
  const scale = (size * ratio) / 24;
  const offset = (size - size * ratio) / 2;
  const offsetY = offset + scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#0756C9"/><g transform="translate(${offset} ${offsetY}) scale(${scale})"><path fill="#ffffff" d="${glyph}"/></g></svg>`;
};

const icons = [
  { file: 'pwa-192x192.png', size: 192, ratio: 0.72 },
  { file: 'pwa-512x512.png', size: 512, ratio: 0.72 },
  { file: 'maskable-icon-512x512.png', size: 512, ratio: 0.58 },
  { file: 'apple-touch-icon-180x180.png', size: 180, ratio: 0.7 },
  { file: 'favicon-32x32.png', size: 32, ratio: 0.78 },
];

for (const { file, size, ratio } of icons) {
  const svg = Buffer.from(buildSvg(size, ratio));
  await sharp(svg).png().toFile(fileURLToPath(new URL(file, OUT)));
  console.log(`generado ${file}`);
}
