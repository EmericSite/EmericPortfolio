// Emericfolio — created by Tomi-Tom, 2026
// Watches content/ and signals once an edit has settled, shared by the publisher and by the dev command

import { watch } from 'node:fs';
import path from 'node:path';
import { CONTENU } from './chemins.mjs';
import { jaune } from './rapport.mjs';

// An editor writes a file in several bursts; wait for the dust to settle.
const ANTI_REBOND = 250;

/** Returns the watcher, so a caller that needs a single change can close it. */
export function surveillerContenu(auChangement) {
  let minuteur = null;

  const observateur = watch(CONTENU, { recursive: true }, (_evenement, fichier) => {
    if (fichier && path.basename(fichier).startsWith('.')) return;
    clearTimeout(minuteur);
    minuteur = setTimeout(auChangement, ANTI_REBOND);
  });

  observateur.on('error', (e) => {
    clearTimeout(minuteur);
    console.log(
      `\n${jaune('La surveillance de content/ s’est arrêtée.')} ${e.message}\n` +
        'Relance la commande pour la reprendre.',
    );
  });

  return observateur;
}
