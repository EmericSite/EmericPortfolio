#!/usr/bin/env node
// Range les médias des projets et régénère la galerie du site.
//
// Usage : npm run scan-media
//
// Organisation attendue dans public/projects/ :
//
//   public/projects/<projet>/<categorie>/mon-fichier.webp
//
// où <categorie> est l'un des dossiers listés dans CATEGORY_FOLDERS
// ci-dessous. Déposer un fichier dans le bon dossier suffit : le script lit
// ses dimensions réelles et réécrit src/data/gallery.generated.ts.
//
// Les fichiers laissés à la racine d'un dossier projet sont rangés
// automatiquement d'après leur préfixe (still, board, bts, scrap, motion).
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const PROJECTS_DIR = path.resolve('./public/projects');
const OUTPUT = path.resolve('./src/data/gallery.generated.ts');

// Dossier sur le disque -> libellé affiché sur le site.
// L'ordre des sections à l'écran est piloté par GALLERY_CATEGORIES
// dans src/data/projects.ts.
const CATEGORY_FOLDERS = {
  motion: 'MOTION',
  stillframes: 'STILLFRAMES',
  storyboard: 'STORYBOARD',
  'behind-the-scene': 'BEHIND THE SCENE',
  'scraps-and-research': 'SCRAPS & RESEARCH',
};

// Préfixe de nom de fichier -> dossier, pour ranger l'existant.
const PREFIX_TO_FOLDER = {
  still: 'stillframes',
  board: 'storyboard',
  bts: 'behind-the-scene',
  scrap: 'scraps-and-research',
  motion: 'motion',
};

const IMAGE_EXT = new Set(['.webp', '.png', '.jpg', '.jpeg', '.avif']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov']);

function videoSize(file) {
  try {
    const out = execFileSync(
      'ffprobe',
      [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height',
        '-of', 'csv=p=0',
        file,
      ],
      { encoding: 'utf8' },
    ).trim();
    const [w, h] = out.split(',').map(Number);
    if (w && h) return { width: w, height: h };
  } catch {
    // ffprobe absent ou illisible : on laissera le ratio par défaut.
  }
  return null;
}

async function imageSize(file) {
  try {
    const meta = await sharp(file).metadata();
    if (meta.width && meta.height) {
      return { width: meta.width, height: meta.height };
    }
  } catch {
    // fichier illisible
  }
  return null;
}

// --- 1. Ranger les fichiers laissés à la racine d'un dossier projet ---
function tidyLooseFiles(projectDir) {
  let moved = 0;
  for (const entry of readdirSync(projectDir)) {
    const full = path.join(projectDir, entry);
    if (statSync(full).isDirectory()) continue;
    if (entry.startsWith('.')) continue;

    const prefix = entry.match(/^([a-z]+)/i)?.[1]?.toLowerCase();
    const folder = prefix ? PREFIX_TO_FOLDER[prefix] : undefined;
    if (!folder) {
      console.log(
        `  [ignoré] ${entry} — préfixe inconnu, range-le dans un des dossiers : ${Object.keys(CATEGORY_FOLDERS).join(', ')}`,
      );
      continue;
    }
    const target = path.join(projectDir, folder);
    mkdirSync(target, { recursive: true });
    renameSync(full, path.join(target, entry));
    moved += 1;
  }
  return moved;
}

// --- 2. Scanner les dossiers de catégorie ---
async function scanProject(slug) {
  const projectDir = path.join(PROJECTS_DIR, slug);
  const items = [];

  for (const [folder, label] of Object.entries(CATEGORY_FOLDERS)) {
    const dir = path.join(projectDir, folder);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir)
      .filter((f) => !f.startsWith('.'))
      .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const src = `/projects/${slug}/${folder}/${file}`;
      const full = path.join(dir, file);

      if (IMAGE_EXT.has(ext)) {
        const size = await imageSize(full);
        items.push({ type: 'image', src, category: label, ...size });
      } else if (VIDEO_EXT.has(ext)) {
        const size = videoSize(full);
        items.push({ type: 'video', src, category: label, ...size });
      } else {
        console.log(`  [ignoré] ${file} — extension non gérée`);
      }
    }
  }

  return items;
}

// --- 3. Écrire le fichier généré ---
function serialize(gallery) {
  const entries = Object.entries(gallery)
    .map(([slug, items]) => {
      const lines = items
        .map((it) => {
          const parts = [
            `type: '${it.type}'`,
            `src: '${it.src}'`,
            `category: '${it.category.replace(/'/g, "\\'")}'`,
          ];
          if (it.width && it.height) {
            parts.push(`width: ${it.width}`, `height: ${it.height}`);
          }
          return `    { ${parts.join(', ')} },`;
        })
        .join('\n');
      return `  '${slug}': [\n${lines}\n  ],`;
    })
    .join('\n');

  return `// GÉNÉRÉ AUTOMATIQUEMENT — NE PAS ÉDITER À LA MAIN.
// Régénérer avec : npm run scan-media
// Source : les fichiers rangés dans public/projects/<projet>/<categorie>/
import type { GalleryItem } from './projects';

export const generatedGallery: Record<string, GalleryItem[]> = {
${entries}
};
`;
}

// --- Exécution ---
if (!existsSync(PROJECTS_DIR)) {
  console.error(`Dossier introuvable : ${PROJECTS_DIR}`);
  process.exit(1);
}

const slugs = readdirSync(PROJECTS_DIR)
  .filter((d) => statSync(path.join(PROJECTS_DIR, d)).isDirectory())
  .sort();

const gallery = {};
let total = 0;

for (const slug of slugs) {
  console.log(`\n=== ${slug} ===`);
  const moved = tidyLooseFiles(path.join(PROJECTS_DIR, slug));
  if (moved > 0) console.log(`  ${moved} fichier(s) rangé(s) par préfixe`);

  const items = await scanProject(slug);
  gallery[slug] = items;
  total += items.length;

  const perCategory = items.reduce((acc, it) => {
    acc[it.category] = (acc[it.category] ?? 0) + 1;
    return acc;
  }, {});
  for (const [cat, n] of Object.entries(perCategory)) {
    console.log(`  ${cat.padEnd(20)} ${String(n).padStart(3)}`);
  }
  if (items.length === 0) console.log('  (aucun média)');
}

writeFileSync(OUTPUT, serialize(gallery));
console.log(
  `\n${total} média(s) dans ${slugs.length} projet(s) -> ${path.relative(process.cwd(), OUTPUT)}`,
);
