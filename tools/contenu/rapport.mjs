// Emericfolio — created by Tomi-Tom, 2026
// Gathers every problem met while publishing and prints the end-of-run summary, all faults at once

const erreurs = [];
const avertissements = [];
let publicTouche = false;

export const gris = (s) => `\x1b[90m${s}\x1b[0m`;
export const rouge = (s) => `\x1b[31m${s}\x1b[0m`;
export const jaune = (s) => `\x1b[33m${s}\x1b[0m`;
export const vert = (s) => `\x1b[32m${s}\x1b[0m`;

export const ko = (n) => `${(n / 1024).toFixed(0)} Ko`;

export function erreur(fichier, ligne, message, aide) {
  // The YAML parser can report the same fault several times; keep one.
  const deja = erreurs.some(
    (e) => e.fichier === fichier && e.ligne === ligne && e.message === message,
  );
  if (!deja) erreurs.push({ fichier, ligne, message, aide });
}

export function avertir(message) {
  avertissements.push(message);
}

export const aDesErreurs = () => erreurs.length > 0;

/** Called on every write or removal under public/, so the summary cannot claim nothing moved. */
export function signalerPublicTouche() {
  publicTouche = true;
}

export function reinitialiser() {
  erreurs.length = 0;
  avertissements.length = 0;
  publicTouche = false;
}

/** Prints the problems found; returns false when there is at least one. */
export function rapporter({ repriseAuto = false } = {}) {
  for (const message of avertissements.splice(0)) {
    console.log(`\n${jaune('À noter')} ${message}`);
  }

  if (erreurs.length === 0) return true;

  console.log(`\n${rouge(`${erreurs.length} problème(s) à corriger`)}\n`);
  for (const { fichier, ligne, message, aide } of erreurs) {
    console.log(`${rouge('✗')} ${fichier}${ligne ? gris(`  ligne ${ligne}`) : ''}`);
    console.log(`  ${message}`);
    if (aide) console.log(gris(`  ${aide}`));
    console.log('');
  }
  const etat = publicTouche
    ? 'Le site n’a pas été mis à jour (des médias déjà convertis avant l’erreur sont dans public/).'
    : 'Rien n’a été publié.';
  console.log(
    gris(
      repriseAuto
        ? `${etat} Corrige les points ci-dessus, la reprise est automatique.`
        : `${etat} Corrige les points ci-dessus puis relance la commande.`,
    ),
  );
  return false;
}
