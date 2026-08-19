// Emericfolio — created by Tomi-Tom, 2026
// Turns the heavy images and videos of content/ into the light copies public/ serves, and drops the ones removed

import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {
  CACHE,
  PUBLIC_POSTERS,
  PUBLIC_PROJECTS,
  SORTIE_GALERIE_JSON,
  relatif,
} from './chemins.mjs';
import { aDesErreurs, avertir, erreur, ko, signalerPublicTouche } from './rapport.mjs';

// Sections are not a fixed list: every folder dropped in a project becomes one.
// `03_behind-the-scene` publishes to behind-the-scene/ and is titled BEHIND THE
// SCENE, third. The number orders, the rest names, exactly like a project folder.
const PREFIXE_SECTION = /^(\d+)[_-](.+)$/;
// Sections without a number come last, in alphabetical order.
const SANS_NUMERO = Number.MAX_SAFE_INTEGER;
// Written out as an ampersand, the way a title reads: SCRAPS & RESEARCH.
const LIAISONS = new Set(['and', 'et', '&']);

const EXT_IMAGE = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.tif', '.tiff']);
const EXT_ANIMEE = new Set(['.gif']);
const EXT_VIDEO = new Set(['.mp4', '.webm', '.mov']);

// Built from the sets above so the warning can never list a stale format.
const lister = (extensions) => [...extensions].map((ext) => ext.slice(1)).join(', ');
const FORMATS_GERES = `images : ${lister(EXT_IMAGE)} — animations : ${lister(
  EXT_ANIMEE,
)} — vidéos : ${lister(EXT_VIDEO)}`;

// A published media is always at /projects/<id>/<section>/<file>.
const cheminMedia = (id, dossier, nom) => `/projects/${id}/${dossier}/${nom}`;

const LARGEUR_MAX = 1400;
const QUALITE = 82;
const CACHE_VERSION = 2;
// Above this, warn about a heavy file published in a versioned folder.
const POIDS_ALERTE = 1_500_000;

let cache = {};
try {
  cache = JSON.parse(readFileSync(CACHE, 'utf8'));
} catch {
  cache = {};
}

export function enregistrerCache() {
  mkdirSync(path.dirname(CACHE), { recursive: true });
  writeFileSync(CACHE, JSON.stringify(cache));
}

export const ffmpegDispo = (() => {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

const h264Encoder = (() => {
  if (!ffmpegDispo) return null;
  try {
    const encodeurs = execFileSync('ffmpeg', ['-hide_banner', '-encoders'], {
      encoding: 'utf8',
    });
    if (encodeurs.includes('libx264')) return 'libx264';
    if (encodeurs.includes('libopenh264')) return 'libopenh264';
  } catch {
    // Animated WebP remains the browser-compatible fallback.
  }
  return null;
})();

/** Name usable in a URL: no accent, space or uppercase. */
function slugSegment(nom, defaut) {
  return nom
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || defaut;
}

/** Filename usable in a URL: no accent, space or uppercase. */
export function slugFichier(nom) {
  return slugSegment(path.basename(nom, path.extname(nom)), 'media');
}

/** Section title as the site shows it: `behind-the-scene` -> `BEHIND THE SCENE`. */
function libelleSection(nom) {
  return nom
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((mot) => (LIAISONS.has(mot.toLowerCase()) ? '&' : mot.toUpperCase()))
    .join(' ');
}

/**
 * Reads a section folder name: the leading number orders it, the rest gives both
 * the folder published under public/ and the title shown on the site. The number
 * stays out of the published path, so renumbering never moves a single file.
 */
export function lireNomSection(nom) {
  const m = nom.match(PREFIXE_SECTION);
  const reste = m ? m[2] : nom;
  return {
    nom,
    rang: m ? Number(m[1]) : SANS_NUMERO,
    dossier: slugSegment(reste, 'section'),
    libelle: libelleSection(reste) || slugSegment(reste, 'section').toUpperCase(),
  };
}

/**
 * The sections of a project, in display order. Two folders that publish to the
 * same place are refused: one would silently overwrite the other.
 */
export function sectionsDuProjet(dossierProjet) {
  const sections = readdirSync(dossierProjet)
    .filter((d) => !d.startsWith('.'))
    .filter((d) => statSync(path.join(dossierProjet, d)).isDirectory())
    .map(lireNomSection)
    .sort(
      (a, b) =>
        a.rang - b.rang || a.dossier.localeCompare(b.dossier, 'fr', { numeric: true }),
    );

  const vus = new Map();
  const gardees = [];
  for (const section of sections) {
    const jumelle = vus.get(section.dossier);
    if (jumelle) {
      erreur(
        relatif(path.join(dossierProjet, section.nom)),
        null,
        `\u00ab ${jumelle} \u00bb et \u00ab ${section.nom} \u00bb d\u00e9signent la m\u00eame section`,
        'le num\u00e9ro mis \u00e0 part, deux dossiers de sections ne peuvent pas porter le ' +
          'm\u00eame nom : renomme l\u2019un des deux, ou fusionne-les.',
      );
      continue;
    }
    vus.set(section.dossier, section.nom);
    gardees.push(section);
  }
  return gardees;
}

function dimensionsVideo(fichier) {
  try {
    const sortie = execFileSync(
      'ffprobe',
      ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', fichier],
      { encoding: 'utf8' },
    ).trim();
    const [w, h] = sortie.split(',').map(Number);
    if (w && h) return { width: w, height: h };
  } catch {
    // No ffprobe: the site falls back to a default ratio.
  }
  return {};
}

/** public/ is versioned, so every published file is weighed, videos included. */
function verifierPoids(source, sortie) {
  const taille = statSync(sortie).size;
  if (taille <= POIDS_ALERTE) return;

  if (path.extname(source).toLowerCase() === '.webp') {
    avertir(
      `${path.basename(source)} pèse ${ko(taille)}. Les WebP qui tiennent déjà sous ` +
        `${LARGEUR_MAX} px sont publiés tels quels : pour qu’il soit allégé ` +
        'automatiquement, dépose-le en PNG ou en JPG.',
    );
    return;
  }
  avertir(
    `${path.basename(sortie)} pèse ${ko(taille)} une fois publié. Les fichiers de ` +
      'public/ partent sur le dépôt : allège la source si c’est possible.',
  );
}

/** Converts a source file into public/, skipped when it has not changed since last run. */
async function traiterMedia(source, sortie, srcWeb) {
  const stat = statSync(source);
  const cle = relatif(source);
  const memo = cache[cle];

  if (
    memo &&
    memo.version === CACHE_VERSION &&
    memo.mtimeMs === stat.mtimeMs &&
    memo.taille === stat.size &&
    memo.item?.src === srcWeb &&
    existsSync(sortie)
  ) {
    verifierPoids(source, sortie);
    return { ...memo.item };
  }

  mkdirSync(path.dirname(sortie), { recursive: true });
  const ext = path.extname(source).toLowerCase();
  let item;

  const metaWebp = ext === '.webp' ? await sharp(source).metadata() : null;

  if (metaWebp && (metaWebp.width ?? Infinity) <= LARGEUR_MAX) {
    // WebP is already a delivery format; recompressing would only degrade it.
    copyFileSync(source, sortie);
    item = { type: 'image', src: srcWeb, width: metaWebp.width, height: metaWebp.height };
  } else if (EXT_IMAGE.has(ext)) {
    // A WebP wider than the cap lands here too: passing it straight through was
    // letting posters ship at full width, and a poster is a 3D texture before
    // it is an image. hohlstrasse.webp weighed 816 Ko against 111 for dofus.
    const meta = await sharp(source).metadata();
    const largeur = Math.min(meta.width ?? LARGEUR_MAX, LARGEUR_MAX);
    const info = await sharp(source)
      .resize({ width: largeur, withoutEnlargement: true })
      .webp({ quality: QUALITE })
      .toFile(sortie);
    item = { type: 'image', src: srcWeb, width: info.width, height: info.height };
  } else if (EXT_ANIMEE.has(ext)) {
    if (sortie.endsWith('.mp4')) {
      execFileSync('ffmpeg', [
        '-y', '-loglevel', 'error', '-i', source,
        '-c:v', h264Encoder,
        '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-an', sortie,
      ]);
      item = { type: 'video', src: srcWeb, ...dimensionsVideo(sortie) };
    } else {
      const info = await sharp(source, { animated: true })
        .webp({ quality: QUALITE })
        .toFile(sortie);
      item = { type: 'image', src: srcWeb, width: info.width, height: info.pageHeight ?? info.height };
    }
  } else if (EXT_VIDEO.has(ext)) {
    if (ext === '.mov' && ffmpegDispo) {
      execFileSync('ffmpeg', [
        '-y', '-loglevel', 'error', '-i', source,
        '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-an', sortie,
      ]);
    } else {
      copyFileSync(source, sortie);
    }
    item = { type: 'video', src: srcWeb, ...dimensionsVideo(sortie) };
  } else {
    return null;
  }

  signalerPublicTouche();
  verifierPoids(source, sortie);
  cache[cle] = { version: CACHE_VERSION, mtimeMs: stat.mtimeMs, taille: stat.size, item };
  return item;
}

function extensionSortie(ext) {
  if (EXT_IMAGE.has(ext)) return '.webp';
  if (EXT_ANIMEE.has(ext)) return h264Encoder ? '.mp4' : '.webp';
  if (ext === '.mov') return ffmpegDispo ? '.mp4' : '.mov';
  return ext;
}

/**
 * The site data is rewritten in every mode, `posterUrl` included, but the media
 * pass only runs outside --textes. A project added and pushed without that pass
 * therefore ships a card pointing at a poster that public/ does not hold, and
 * useTexture throws on the 404: the entire hub goes down, not just one card.
 * Checked here so the build fails loudly instead of the site failing silently.
 */
export function verifierPostersPublies(projets) {
  for (const projet of projets) {
    if (existsSync(path.join(PUBLIC_POSTERS, `${projet.id}.webp`))) continue;
    erreur(
      relatif(projet.dossier),
      null,
      `l’image de couverture n’est pas publiée (public/posters/${projet.id}.webp est absent)`,
      'lance `npm run contenu` puis versionne le dossier public/ : sans ce fichier, le site ne s’affiche plus du tout.',
    );
  }
}

export async function traiterPoster(projet) {
  const candidats = readdirSync(projet.dossier).filter(
    (f) => slugFichier(f) === 'poster' && EXT_IMAGE.has(path.extname(f).toLowerCase()),
  );

  const dejaPublie = path.join(PUBLIC_POSTERS, `${projet.id}.webp`);

  if (candidats.length === 0) {
    // No source but a poster already online: keep it, this machine may lack the originals.
    if (existsSync(dejaPublie)) {
      avertir(
        `${projet.id} : pas d’image de couverture dans le dossier, celle déjà en ligne est conservée.`,
      );
      return;
    }
    erreur(
      relatif(projet.dossier),
      null,
      'il manque l’image de couverture',
      'dépose une image nommée poster.png (ou .jpg, .webp) à la racine du dossier du projet.',
    );
    return;
  }
  if (candidats.length > 1) {
    erreur(
      relatif(projet.dossier),
      null,
      `il y a ${candidats.length} images de couverture : ${candidats.join(', ')}`,
      'garde-en une seule à la racine du dossier, sinon il est impossible de savoir laquelle publier.',
    );
    return;
  }

  const source = path.join(projet.dossier, candidats[0]);
  try {
    await traiterMedia(source, dejaPublie, projet.posterUrl);
  } catch (e) {
    erreur(
      relatif(projet.dossier),
      null,
      'l’image de couverture n’a pas pu être traitée',
      e.message,
    );
  }
}

export async function traiterMedias(projet) {
  const items = [];
  const produits = new Set();
  let sourcesTrouvees = 0;

  for (const section of projet.sections) {
    const repertoire = path.join(projet.dossier, section.nom);
    if (!existsSync(repertoire)) continue;

    const fichiers = readdirSync(repertoire)
      .filter((f) => !f.startsWith('.'))
      .filter((f) => statSync(path.join(repertoire, f)).isFile())
      .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));

    // Two sources can slug down to the same published name, which would make one
    // overwrite the other without a word.
    const nomsPris = new Map();

    for (const fichier of fichiers) {
      const ext = path.extname(fichier).toLowerCase();
      if (!EXT_IMAGE.has(ext) && !EXT_ANIMEE.has(ext) && !EXT_VIDEO.has(ext)) {
        avertir(
          `${projet.id} : « ${fichier} » a été laissé de côté, son format n’est pas géré (${FORMATS_GERES}).`,
        );
        continue;
      }

      const nomSortie = slugFichier(fichier) + extensionSortie(ext);
      const jumeau = nomsPris.get(nomSortie);
      if (jumeau) {
        erreur(
          relatif(path.join(repertoire, fichier)),
          null,
          `« ${jumeau} » et « ${fichier} » donneraient le même fichier publié « ${nomSortie} »`,
          'renomme l’un des deux : les accents, les espaces, les majuscules et ' +
            'l’extension disparaissent du nom publié, ce qui rend ces deux-là identiques.',
        );
        continue;
      }
      nomsPris.set(nomSortie, fichier);

      sourcesTrouvees += 1;

      const sortie = path.join(PUBLIC_PROJECTS, projet.id, section.dossier, nomSortie);
      const srcWeb = cheminMedia(projet.id, section.dossier, nomSortie);

      try {
        const item = await traiterMedia(path.join(repertoire, fichier), sortie, srcWeb);
        if (!item) continue;
        produits.add(path.relative(PUBLIC_PROJECTS, sortie));
        items.push({ ...item, category: section.libelle });
      } catch (e) {
        erreur(
          relatif(path.join(repertoire, fichier)),
          null,
          'le fichier n’a pas pu être traité',
          e.message,
        );
      }
    }
  }

  if (sourcesTrouvees === 0) {
    avertir(
      `${projet.id} : aucun média dans le dossier du projet. Ce qui est déjà en ligne a été laissé tel quel.`,
    );
    return null;
  }

  // What content/ no longer holds leaves public/, renamed section folders
  // included. Only when every conversion went through: a file that failed is
  // absent from `produits` while its published version is the only copy left,
  // so pruning would destroy it.
  const publie = path.join(PUBLIC_PROJECTS, projet.id);
  if (!aDesErreurs()) {
    for (const ancien of listerFichiers(publie)) {
      if (produits.has(path.relative(PUBLIC_PROJECTS, ancien))) continue;
      rmSync(ancien);
      signalerPublicTouche();
    }
    if (existsSync(publie)) supprimerDossiersVides(publie);
  }

  return items;
}

export function listerFichiers(racine) {
  const sortie = [];
  const parcourir = (d) => {
    for (const entree of readdirSync(d)) {
      if (entree.startsWith('.')) continue;
      const complet = path.join(d, entree);
      if (statSync(complet).isDirectory()) parcourir(complet);
      else sortie.push(complet);
    }
  };
  if (existsSync(racine)) parcourir(racine);
  return sortie;
}

function supprimerDossiersVides(racine) {
  for (const entree of readdirSync(racine)) {
    const complet = path.join(racine, entree);
    if (!statSync(complet).isDirectory()) continue;
    supprimerDossiersVides(complet);
    if (readdirSync(complet).length === 0) rmSync(complet, { recursive: true });
  }
}

/**
 * Drops from public/ the projects that no longer exist in content/. Only called
 * once the run has rebuilt at least one media, since a clone without the source
 * files cannot tell a renamed project from a machine that simply lacks them.
 */
export function retirerProjetsSupprimes(projets) {
  const vivants = new Set(projets.map((p) => p.id));

  if (existsSync(PUBLIC_PROJECTS)) {
    for (const entree of readdirSync(PUBLIC_PROJECTS)) {
      if (entree.startsWith('.') || vivants.has(entree)) continue;
      rmSync(path.join(PUBLIC_PROJECTS, entree), { recursive: true, force: true });
      signalerPublicTouche();
      avertir(
        `« ${entree} » n’est plus dans content/projets : ses médias ont été retirés de public/.`,
      );
    }
  }
  if (existsSync(PUBLIC_POSTERS)) {
    for (const entree of readdirSync(PUBLIC_POSTERS)) {
      if (entree.startsWith('.')) continue;
      if (!vivants.has(path.basename(entree, path.extname(entree)))) {
        rmSync(path.join(PUBLIC_POSTERS, entree), { force: true });
        signalerPublicTouche();
      }
    }
  }
}

/** Media already published, kept when their source files are missing. */
export function galerieExistante() {
  if (!existsSync(SORTIE_GALERIE_JSON)) return {};
  try {
    return JSON.parse(readFileSync(SORTIE_GALERIE_JSON, 'utf8'));
  } catch (e) {
    // Silently returning {} here would wipe every media from the site.
    erreur(
      relatif(SORTIE_GALERIE_JSON),
      null,
      'le fichier des médias déjà publiés est illisible',
      `${e.message}. Relance « npm run contenu » avec les médias sources en place pour le reconstruire.`,
    );
    return null;
  }
}

export function preparerDossiersPublics() {
  mkdirSync(PUBLIC_POSTERS, { recursive: true });
  mkdirSync(PUBLIC_PROJECTS, { recursive: true });
}

/** Weight of everything published under public/projects/. */
export function poidsPublie() {
  return listerFichiers(PUBLIC_PROJECTS).reduce((n, f) => n + statSync(f).size, 0);
}
