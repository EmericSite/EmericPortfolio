#!/usr/bin/env node
// Emericfolio — created by Tomi-Tom, 2026
// Builds the glyph worn by the site and the thumbnail shown when a link is shared, from Emeric's raw logos

import sharp from 'sharp';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const RACINE = path.resolve(import.meta.dirname, '..');
const ROOT = path.join(RACINE, 'ASSETS_EMERIC', '00_LOGO');
const OUT = path.join(RACINE, 'public');

const fmtSize = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;

const jobs = [
  {
    // Already cut out on transparent in the assets Emeric provided.
    src: path.join(ROOT, 'Logo_White.png'),
    out: path.join(OUT, 'logo-mark.png'),
    size: 640,
    note: 'glyphe détouré',
  },
  {
    src: path.join(ROOT, 'LOGO_DEF_NET.png'),
    out: path.join(OUT, 'logo.png'),
    size: 512,
    note: 'vignette sociale',
  },
];

let produits = 0;

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
  try {
    await pipeline.png({ compressionLevel: 9, palette: false }).toFile(job.out);
  } catch (e) {
    console.error(`✗ ${path.basename(job.src)} n’a pas pu être lu : ${e.message}`);
    process.exit(1);
  }
  produits += 1;
  const name = path.basename(job.out);
  console.log(
    `${name.padEnd(20)} ${String(job.size).padStart(4)}px  ${fmtSize(
      statSync(job.out).size,
    ).padStart(6)}  ${job.note}`,
  );
}

// ASSETS_EMERIC/ is not versioned: without it the run looked successful while
// producing nothing at all.
if (produits === 0) {
  console.error(
    `\n✗ Aucun logo produit : le dossier ${path.relative(RACINE, ROOT)} n’est pas versionné.\n` +
      '  Dépose-y Logo_White.png et LOGO_DEF_NET.png, puis relance la commande.',
  );
  process.exit(1);
}
