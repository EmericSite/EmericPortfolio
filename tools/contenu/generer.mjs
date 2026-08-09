// Emericfolio — created by Tomi-Tom, 2026
// Writes the site data files that src/ imports, rebuilt from content/ at every publish

import { writeFileSync } from 'node:fs';
import {
  SORTIE_CATEGORIES,
  SORTIE_GALERIE,
  SORTIE_GALERIE_JSON,
  SORTIE_PROJETS,
  SORTIE_SITE,
} from './chemins.mjs';
import { CATEGORIES } from './medias.mjs';

// Head of every generated file: the same two-line header as the hand-written code,
// then the warning addressed to whoever opens it. Written here because a header
// typed into a generated file would be wiped by the next `npm run contenu`.
const ENTETE = (role, source) => `// Emericfolio — created by Tomi-Tom, 2026
// ${role}

// GÉNÉRÉ AUTOMATIQUEMENT — NE PAS ÉDITER À LA MAIN.
// Source : ${source}
// Régénérer avec : npm run contenu
`;

function bloc(nom, valeur, suffixe = '') {
  return `export const ${nom} = ${JSON.stringify(valeur, null, 2)}${suffixe};\n`;
}

// `interface` is a reserved word in TS, hence the `libelles` export.
const RENOMMAGES = { interface: 'libelles' };
// `mode` is read as a union type, which needs the literal values.
const SUFFIXES = { navigation: ' as const' };

/** One export per block of site.yml, so adding a block there is enough. */
export function ecrireSite(site) {
  const corps = Object.entries(site)
    .map(([cle, valeur]) => bloc(RENOMMAGES[cle] ?? cle, valeur, SUFFIXES[cle] ?? ''))
    .join('\n');
  writeFileSync(
    SORTIE_SITE,
    `${ENTETE(
      'Every wording the site displays: titles, labels, navigation and form messages',
      'content/site.yml',
    )}\n${corps}`,
  );
}

// Script-only fields, kept out of the generated site data.
const CHAMPS_INTERNES = ['rang', 'dossier'];

export function ecrireProjets(projets) {
  const liste = projets.map((projet) =>
    Object.fromEntries(
      Object.entries(projet).filter(
        ([cle, valeur]) => !CHAMPS_INTERNES.includes(cle) && valeur !== undefined,
      ),
    ),
  );
  const corps = `import type { Project } from './projects';

export const generatedProjects: Project[] = ${JSON.stringify(liste, null, 2)};
`;
  writeFileSync(
    SORTIE_PROJETS,
    `${ENTETE(
      'The card of each project: title, client, year and the text shown when it is opened',
      'content/projets/*/projet.yml',
    )}\n${corps}`,
  );
}

// The data goes to a .json the module imports, so re-reading it is a plain
// JSON.parse rather than slicing source code.
export function ecrireGalerie(galerie) {
  // JSON has no comment syntax, so this one file carries no header. What it holds:
  // for each project, the list of its published media with their section and size.
  // The module just below is its labelled front door.
  writeFileSync(SORTIE_GALERIE_JSON, `${JSON.stringify(galerie, null, 2)}\n`);
  const corps = `import type { GalleryItem } from './projects';
import donnees from './gallery.generated.json';

export const generatedGallery = donnees as Record<string, GalleryItem[]>;
`;
  writeFileSync(
    SORTIE_GALERIE,
    `${ENTETE(
      'The images and videos of every project, sorted by section, as the gallery shows them',
      'les médias rangés dans content/projets/',
    )}\n${corps}`,
  );
}

/** Section names and order, so src/ never redeclares them. */
export function ecrireCategories() {
  const corps = bloc('GALLERY_CATEGORIES', Object.values(CATEGORIES), ' as const');
  writeFileSync(
    SORTIE_CATEGORIES,
    `${ENTETE(
      'The names of the gallery sections, in the order a project panel lays them out',
      'tools/contenu/medias.mjs',
    )}\n${corps}`,
  );
}
