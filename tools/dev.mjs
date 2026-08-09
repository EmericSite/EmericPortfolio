#!/usr/bin/env node
// Emericfolio — created by Tomi-Tom, 2026
// Local start-up: publishes the content, then runs the Next server and the content watcher side by side

// Content is built before the server starts, since a content error would be
// buried by Next's output. Ctrl+C kills the watcher too, or the port stays busy.
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gris, jaune } from './contenu/rapport.mjs';
import { surveillerContenu } from './contenu/surveillance.mjs';

const PUBLIER = path.join(import.meta.dirname, 'contenu.mjs');
const NEXT = fileURLToPath(import.meta.resolve('next/dist/bin/next'));

const enfants = [];
let arretEnCours = false;

function arreter(code) {
  if (arretEnCours) return;
  arretEnCours = true;
  for (const enfant of enfants) {
    if (!enfant.killed) enfant.kill('SIGTERM');
  }
  process.exit(code);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => arreter(0));
}

function lancer(args) {
  const enfant = spawn(process.execPath, args, { stdio: 'inherit' });
  enfants.push(enfant);
  enfant.on('exit', (code, signal) => arreter(signal === null && code ? code : 0));
  return enfant;
}

/** Resolves once content/ has stayed quiet long enough. */
function prochaineModification() {
  return new Promise((resoudre) => {
    const observateur = surveillerContenu(() => {
      observateur.close();
      resoudre();
    });
  });
}

while (spawnSync(process.execPath, [PUBLIER, '--depuis-dev'], { stdio: 'inherit' }).status !== 0) {
  console.log(
    `\n${jaune('Le site n’a pas démarré.')} Corrige le point ci-dessus : ` +
      `il repartira tout seul.\n${gris('(Ctrl+C pour abandonner)')}\n`,
  );
  await prochaineModification();
  console.log(gris('Modification détectée, nouvel essai…\n'));
}

lancer([PUBLIER, '--surveille', '--sans-premiere-passe']);
lancer([NEXT, 'dev']);
