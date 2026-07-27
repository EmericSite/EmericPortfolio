#!/usr/bin/env node
// Génère les deux déclinaisons du logo utilisées par le site :
//
//   public/logo-mark.png  glyphe seul, détouré sur transparent. Utilisé par
//                         la navbar, le loader et le fallback, tous sur fond
//                         sombre : plus de carré rose derrière le logo.
//   public/logo.png       vignette sociale (OG, favicon, JSON-LD), doit
//                         rester un PNG opaque.
//
// Usage : node tools/build-logos.mjs
import sharp from 'sharp';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('./ASSETS_EMERIC/00_LOGO');
const OUT = path.resolve('./public');

const fmtSize = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;

const jobs = [
  {
    // Déjà détouré sur transparent dans les assets fournis par Emeric.
    src: path.join(ROOT, 'Logo_White.png'),
    out: path.join(OUT, 'logo-mark.png'),
    size: 640,
    format: 'png',
    note: 'glyphe détouré',
  },
  {
    src: path.join(ROOT, 'LOGO_DEF_NET.png'),
    out: path.join(OUT, 'logo.png'),
    size: 512,
    format: 'png',
    note: 'vignette sociale',
  },
];

for (const job of jobs) {
  if (!existsSync(job.src)) {
    console.log(`[skip] ${path.basename(job.src)} introuvable`);
    continue;
  }
  const pipeline = sharp(job.src).resize({
    width: job.size,
    height: job.size,
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  await (job.format === 'webp'
    ? pipeline.webp({ quality: 88 })
    : pipeline.png({ compressionLevel: 9, palette: false })
  ).toFile(job.out);
  const name = path.basename(job.out);
  console.log(
    `${name.padEnd(20)} ${String(job.size).padStart(4)}px  ${fmtSize(
      statSync(job.out).size,
    ).padStart(6)}  ${job.note}`,
  );
}
