#!/usr/bin/env node
// Emericfolio — created by Tomi-Tom, 2026
// Publishes content/: checks the YAML, optimizes the media into public/, rewrites the site data

import {
  ecrireCategories,
  ecrireGalerie,
  ecrireProjets,
  ecrireSite,
} from './contenu/generer.mjs';
import {
  enregistrerCache,
  ffmpegDispo,
  galerieExistante,
  poidsPublie,
  preparerDossiersPublics,
  retirerProjetsSupprimes,
  traiterMedias,
  traiterPoster,
  verifierPostersPublies,
} from './contenu/medias.mjs';
import { aDesErreurs, gris, ko, rapporter, reinitialiser, rouge, vert } from './contenu/rapport.mjs';
import { surveillerContenu } from './contenu/surveillance.mjs';
import { lireProjets, lireSite } from './contenu/valider.mjs';

// Unknown flags are refused: `--texte` would otherwise run a full media pass,
// deletions in public/ included, without a word.
const OPTIONS = {
  '--textes': 'met à jour les seuls textes, sans toucher aux médias',
  '--surveille': 'republie à chaque modification de content/',
  '--depuis-dev': 'signale dans les messages que la reprise est automatique',
  '--sans-premiere-passe': 'démarre la surveillance sans publier tout de suite',
  '--help': 'affiche cette aide',
};

function afficherAide() {
  console.log('\nUsage : npm run contenu [-- option…]\n');
  for (const [option, texte] of Object.entries(OPTIONS)) {
    console.log(`  ${option.padEnd(24)}${gris(texte)}`);
  }
  console.log('');
}

const inconnues = process.argv.slice(2).filter((a) => !(a in OPTIONS));
if (inconnues.length > 0) {
  console.log(`\n${rouge('✗')} option inconnue : ${inconnues.join(', ')}`);
  afficherAide();
  process.exit(1);
}
if (process.argv.includes('--help')) {
  afficherAide();
  process.exit(0);
}

const MODE_TEXTES = process.argv.includes('--textes');
// Used by `npm run dev` so edits in content/ show up right away.
const MODE_SURVEILLE = process.argv.includes('--surveille');
// The watcher retries on its own, so error output must not ask for a rerun.
const REPRISE_AUTO = MODE_SURVEILLE || process.argv.includes('--depuis-dev');

const verifier = () => rapporter({ repriseAuto: REPRISE_AUTO });

async function publier({ silencieux = false } = {}) {
  reinitialiser();

  const site = lireSite();
  const projets = lireProjets();
  if (!verifier()) return false;

  const galerie = {};

  if (!MODE_TEXTES) {
    preparerDossiersPublics();
    let mediasReconstruits = false;

    for (const projet of projets) {
      if (!silencieux) console.log(`\n${vert('●')} ${projet.id}  ${gris(projet.title)}`);
      await traiterPoster(projet);

      const items = await traiterMedias(projet);
      if (items === null) {
        galerie[projet.id] = (galerieExistante() ?? {})[projet.id] ?? [];
        continue;
      }
      mediasReconstruits = true;
      galerie[projet.id] = items;

      if (silencieux) continue;
      const parSection = items.reduce((acc, it) => {
        acc[it.category] = (acc[it.category] ?? 0) + 1;
        return acc;
      }, {});
      for (const [section, n] of Object.entries(parSection)) {
        console.log(`  ${section.padEnd(20)} ${String(n).padStart(3)}`);
      }
      if (items.length === 0) console.log(gris('  (aucun média)'));
    }

    // Erasing a project comes last, and only once this run has proved it can
    // rebuild media: on a clone without the sources, nothing must be deleted.
    if (mediasReconstruits && !aDesErreurs()) retirerProjetsSupprimes(projets);

    enregistrerCache();
  }

  // Runs in every mode, --textes included: that is precisely the mode the
  // Vercel build uses, and the one that can publish a card without its poster.
  verifierPostersPublies(projets);
  if (!verifier()) return false;

  ecrireSite(site);
  ecrireProjets(projets);
  ecrireCategories(projets);
  // --textes never sees the source media, so it must leave the gallery alone.
  if (!MODE_TEXTES) ecrireGalerie(galerie);

  const totalMedias = Object.values(galerie).reduce((n, l) => n + l.length, 0);

  if (silencieux) {
    console.log(`${vert('✓')} contenu rechargé ${gris(`— ${projets.length} projet(s), ${totalMedias} média(s)`)}`);
  } else {
    console.log(
      MODE_TEXTES
        ? `\n${vert('✓')} textes à jour — ${projets.length} projet(s)`
        : `\n${vert('✓')} site à jour — ${projets.length} projet(s), ${totalMedias} média(s), ${ko(poidsPublie())}`,
    );
    if (!MODE_TEXTES && !ffmpegDispo) {
      console.log(gris('  (ffmpeg absent : les GIF sont publiés en WebP animé plutôt qu’en vidéo)'));
    }
  }
  return true;
}

function surveiller() {
  console.log(gris(`\n👀 Le dossier content/ est surveillé. Toute modification est reprise aussitôt.\n`));

  let enCours = false;
  let redemander = false;

  const relancer = async () => {
    if (enCours) {
      redemander = true;
      return;
    }
    enCours = true;
    try {
      await publier({ silencieux: true });
    } catch (e) {
      console.log(`${rouge('✗')} ${e.message}`);
    }
    enCours = false;
    if (redemander) {
      redemander = false;
      await relancer();
    }
  };

  surveillerContenu(relancer);
}

// process.exit() would skip the finally, so the code is only used afterwards.
let codeSortie = 0;
try {
  if (MODE_SURVEILLE) {
    // `npm run dev` already ran one pass; redoing it would reprint the summary.
    if (!process.argv.includes('--sans-premiere-passe')) await publier();
    surveiller();
  } else if (!(await publier())) {
    codeSortie = 1;
  }
} catch (e) {
  console.log(`\n${rouge('✗')} ${e.message}`);
  codeSortie = 1;
} finally {
  // Keeps whatever this run already encoded, so a crash costs no second pass.
  if (!MODE_TEXTES) enregistrerCache();
}
if (codeSortie !== 0) process.exit(codeSortie);
