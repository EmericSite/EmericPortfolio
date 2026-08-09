// Emericfolio — created by Tomi-Tom, 2026
// Sole list of the files and folders the content script reads and writes, so no module guesses them

import path from 'node:path';

// Deduced from this file, not from the current directory: the script writes into
// public/ and src/, and must target the repository it belongs to.
export const RACINE = path.resolve(import.meta.dirname, '..', '..');

export const CONTENU = path.join(RACINE, 'content');
export const PROJETS = path.join(CONTENU, 'projets');
export const SITE_YML = path.join(CONTENU, 'site.yml');

export const PUBLIC_PROJECTS = path.join(RACINE, 'public', 'projects');
export const PUBLIC_POSTERS = path.join(RACINE, 'public', 'posters');

export const SORTIE_SITE = path.join(RACINE, 'src', 'content', 'site.generated.ts');
export const SORTIE_PROJETS = path.join(RACINE, 'src', 'data', 'projects.generated.ts');
export const SORTIE_GALERIE = path.join(RACINE, 'src', 'data', 'gallery.generated.ts');
export const SORTIE_GALERIE_JSON = path.join(RACINE, 'src', 'data', 'gallery.generated.json');
export const SORTIE_CATEGORIES = path.join(RACINE, 'src', 'data', 'categories.generated.ts');

export const CACHE = path.join(RACINE, 'node_modules', '.cache', 'contenu.json');

/** Path as shown to the reader: relative to the repository root. */
export const relatif = (fichier) => path.relative(RACINE, fichier);
