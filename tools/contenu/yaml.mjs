// Emericfolio — created by Tomi-Tom, 2026
// Opens a YAML sheet, keeps track of where each field sits, and polishes the punctuation of its texts

import { LineCounter, parseDocument } from 'yaml';
import { existsSync, readFileSync } from 'node:fs';
import { relatif } from './chemins.mjs';
import { erreur } from './rapport.mjs';

// Technical fields: leave their text alone, no typography pass.
const CHAMPS_TECHNIQUES = new Set([
  'href', 'email', 'mode', 'accent', 'vimeoId', 'id', 'dossier', 'posterUrl', 'src',
]);

// Invisible characters an editor or a copy-paste can leave in front of line 1.
// They break the parsing of the whole file while showing nothing on screen.
const PARASITES = new Map([
  ['\uFEFF', 'une marque d’ordre des octets (BOM)'],
  ['\u00A0', 'une espace insécable'],
  ['\u200B', 'une espace de largeur nulle'],
  ['\u200E', 'une marque de sens de lecture'],
  ['\u200F', 'une marque de sens de lecture'],
]);

const CONTROLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

/** Names the stray byte before the first line, which no parser message mentions. */
function parasiteEnTete(texte) {
  const premier = texte[0];
  if (premier === undefined) return null;
  if (PARASITES.has(premier)) return PARASITES.get(premier);
  if (CONTROLE.test(premier)) return 'un caractère de contrôle';
  return null;
}

/** Opens a YAML file and exposes its values plus the line of any field, so errors can point at it. */
export function ouvrirYaml(fichier) {
  const nom = relatif(fichier);
  if (!existsSync(fichier)) {
    erreur(nom, null, 'fichier introuvable');
    return null;
  }

  const texte = readFileSync(fichier, 'utf8');

  const parasite = parasiteEnTete(texte);
  if (parasite) {
    erreur(
      nom,
      1,
      `le fichier commence par ${parasite}, invisible dans l’éditeur`,
      'place le curseur tout au début de la première ligne et appuie une fois sur Retour arrière, ' +
        'puis enregistre le fichier en UTF-8 sans BOM.',
    );
    return null;
  }

  const compteur = new LineCounter();
  const doc = parseDocument(texte, { lineCounter: compteur });

  // One fault desynchronises the parser for everything after it, so only the
  // first error is real: reporting them all buries it under its own echoes.
  if (doc.errors.length > 0) {
    const [premiere] = doc.errors;
    erreur(
      nom,
      premiere.linePos?.[0]?.line ?? null,
      'le fichier est mal formé et n’a pas pu être lu',
      'vérifie l’alignement des lignes : tout ce qui est à l’intérieur d’un bloc doit être décalé du même nombre d’espaces.',
    );
    return null;
  }

  const valeurs = doc.toJS() ?? {};
  return {
    fichier: nom,
    valeurs,
    ligne(...chemin) {
      const noeud = chemin.length > 0 ? doc.getIn(chemin, true) : doc.contents;
      return noeud?.range ? compteur.linePos(noeud.range[0]).line : null;
    },
  };
}

/** Trims strings (a `>` block adds a trailing space) and turns straight quotes into curly ones. */
export function typographier(valeur, cle) {
  if (typeof valeur === 'string') {
    const propre = valeur.trim();
    return CHAMPS_TECHNIQUES.has(cle) ? propre : propre.replace(/'/g, '’');
  }
  if (Array.isArray(valeur)) return valeur.map((v) => typographier(v, cle));
  if (valeur && typeof valeur === 'object') {
    return Object.fromEntries(
      Object.entries(valeur).map(([k, v]) => [k, typographier(v, k)]),
    );
  }
  return valeur;
}
