// Emericfolio — created by Tomi-Tom, 2026
// Reads every YAML sheet and reports, file and line in hand, what a non-developer must fix

import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { PROJETS, SITE_YML, relatif } from './chemins.mjs';
import { aDesErreurs, erreur } from './rapport.mjs';
import { ouvrirYaml, typographier } from './yaml.mjs';
import { sectionsDuProjet, slugFichier } from './medias.mjs';

const MODES_NAV = ['hub', 'about', 'contact'];

// Every field the components read, block by block (`null` = the block is a lone
// text), so a field dropped from site.yml is reported with its line, not by tsc.
const CHAMPS_SITE = {
  identite: ['nom', 'metier'],
  loader: ['texte'],
  accueil: ['surtitre', 'titreLigne1', 'titreLigne2'],
  showreel: ['vimeoId', 'titre', 'titreCourt', 'annee', 'accent'],
  marquee: null,
  about: [
    'lieuEtAnnee', 'reference', 'version',
    'titreLigne1', 'titreLigne2', 'titreLigne3', 'sousTitre',
    'citation', 'citationLegende',
    'indexPeriode', 'clientsMention',
    'ctaSurtitre', 'ctaTexte',
    'etiquetteSection', 'etiquetteOnglet',
    'titreApproche', 'uniteApproche', 'titreIndex', 'titreClients',
    'mentionSelection', 'titreCta',
  ],
  contact: [
    'email', 'disponibilite', 'titreLigne1', 'titreLigne2', 'accroche',
    'formulaireIntro', 'fuseau', 'etiquetteSection', 'etiquetteEmail',
    'signature', 'signatureAuteur', 'signatureLien',
  ],
  formulaire: [
    'nom', 'email', 'message', 'envoyer', 'envoiEnCours',
    'erreurEnvoi', 'erreurConnexion',
    'erreurRequete', 'erreurChampsManquants', 'erreurEmailInvalide',
    'erreurMessageLong', 'erreurTropDeMessages', 'erreurIndisponible',
    'labelNom', 'labelEmail', 'labelMessage', 'confirmation', 'champPiege',
  ],
  partage: ['url', 'titre', 'description', 'metier', 'ville', 'compteX', 'vignetteMention'],
  interface: [
    'allerAuContenu', 'logoChargement', 'galerie', 'projets', 'listeProjets',
    'ouvrirProjet', 'finAbout', 'fermer', 'agrandirMedia', 'apercuMedia',
    'fermerApercu', 'mediaPrecedent', 'mediaSuivant', 'fermerLecture',
    'lirePrefixe', 'lireProjet', 'lectureEnCours', 'activerSon', 'couperSon', 'lectureImpossible',
    'ouvrirSurVimeo', 'retour', 'role', 'description', 'credits',
    'natureProjet', 'projetPersonnel', 'projetClient',
    'entrerQuandMeme', 'lire', 'modeAllege', 'prefixeNumero',
    'sonActif', 'sonCoupe', 'separateurAbout',
  ],
  erreur: ['surtitre', 'titre', 'texte', 'bouton', 'reference', 'criseSurtitre', 'criseTitre'],
};

// The lists the site walks through; `null` when the entries are plain texts.
const LISTES_SITE = {
  navigation: ['label', 'mode'],
  'about.approche': ['tag', 'texte'],
  'about.index': ['idx', 'valeur', 'label'],
  'about.clients': null,
  'contact.reseaux': ['label', 'handle', 'href'],
  'partage.motsCles': null,
};

// Extra help on the fields whose purpose is not obvious from their name.
const AIDES_SITE = {
  marquee: 'le texte répété en fond d’écran.',
  interface: 'il contient les libellés lus par les lecteurs d’écran.',
  'showreel.vimeoId': 'le numéro à la fin de l’adresse Vimeo du showreel.',
  'partage.url': 'l’adresse publique du site.',
  'partage.titre': 'le titre affiché dans l’onglet du navigateur.',
};

// Shared by site.yml and by every projet.yml, which declare the same two fields.
// A project is either a personal piece or commissioned work.
const KINDS = ['personal', 'client'];

const FORMAT_VIMEO = {
  motif: /^\d+$/,
  message: (v) => `« ${v} » n’est pas un numéro Vimeo`,
  aide: 'il ne doit contenir que des chiffres, pas l’adresse complète.',
};

// The example colour differs between the two files, hence the parameter.
const formatAccent = (exemple) => ({
  motif: /^#[0-9a-fA-F]{6}$/,
  message: (v) => `« ${v} » n’est pas une couleur valide`,
  aide: `il faut un dièse suivi de six caractères, entre guillemets : accent: "${exemple}".`,
});

function verifierFormat(fiche, chemin, valeur, format) {
  if (!valeur || format.motif.test(valeur)) return;
  erreur(fiche.fichier, fiche.ligne(...chemin), format.message(valeur), format.aide);
}

// Fields whose shape matters, beyond simply being filled in.
const FORMATS_SITE = {
  'showreel.vimeoId': FORMAT_VIMEO,
  'showreel.accent': formatAccent('#F4D8E2'),
  'partage.url': {
    motif: /^https?:\/\/[^/]+$/,
    message: (v) => `« ${v} » n’est pas une adresse de site valide`,
    aide: 'attendu : https://mondomaine.com, sans barre oblique à la fin.',
  },
};

function texteRequis(fiche, chemin, aide) {
  const valeur = chemin.reduce((o, k) => o?.[k], fiche.valeurs);
  const nom = chemin.join(' > ');
  if (valeur === undefined || valeur === null || String(valeur).trim() === '') {
    const ligne =
      fiche.ligne(...chemin) ??
      (chemin.length > 1 ? fiche.ligne(...chemin.slice(0, -1)) : null);
    erreur(fiche.fichier, ligne, `le champ « ${nom} » manque`, aide);
    return '';
  }
  return String(valeur).trim();
}

export function lireSite() {
  const fiche = ouvrirYaml(SITE_YML);
  if (!fiche) return null;
  const v = fiche.valeurs;
  const lus = {};
  const blocsManquants = new Set();

  for (const [nomBloc, champs] of Object.entries(CHAMPS_SITE)) {
    if (champs === null) {
      lus[nomBloc] = texteRequis(fiche, [nomBloc], AIDES_SITE[nomBloc]);
      continue;
    }
    if (v[nomBloc] === undefined || v[nomBloc] === null) {
      erreur(
        fiche.fichier,
        fiche.ligne(nomBloc),
        `le bloc « ${nomBloc} » manque`,
        AIDES_SITE[nomBloc],
      );
      blocsManquants.add(nomBloc);
      continue;
    }
    for (const champ of champs) {
      const chemin = `${nomBloc}.${champ}`;
      lus[chemin] = texteRequis(fiche, [nomBloc, champ], AIDES_SITE[chemin]);
    }
  }

  for (const [chemin, format] of Object.entries(FORMATS_SITE)) {
    verifierFormat(fiche, chemin.split('.'), lus[chemin], format);
  }

  for (const [chemin, champs] of Object.entries(LISTES_SITE)) {
    const cles = chemin.split('.');
    // The missing block was reported once already; no need to list its contents.
    if (blocsManquants.has(cles[0])) continue;
    const liste = cles.reduce((o, k) => o?.[k], v);
    if (!Array.isArray(liste) || liste.length === 0) {
      erreur(
        fiche.fichier,
        fiche.ligne(...cles) ?? fiche.ligne(cles[0]),
        `la liste « ${chemin.replace(/\./g, ' > ')} » est vide`,
        'le site en affiche chaque entrée : il en faut au moins une.',
      );
      continue;
    }
    liste.forEach((_, i) => {
      if (champs === null) texteRequis(fiche, [...cles, i]);
      else for (const champ of champs) texteRequis(fiche, [...cles, i, champ]);
    });
  }

  for (const [i, item] of (v.navigation ?? []).entries()) {
    if (!MODES_NAV.includes(item?.mode)) {
      erreur(
        fiche.fichier,
        fiche.ligne('navigation', i),
        `« mode: ${item?.mode ?? '(vide)'} » n’existe pas`,
        `les seules valeurs possibles sont : ${MODES_NAV.join(', ')}.`,
      );
    }
  }

  for (const [i, reseau] of (v.contact?.reseaux ?? []).entries()) {
    if (!/^https?:\/\//.test(reseau?.href ?? '')) {
      erreur(
        fiche.fichier,
        fiche.ligne('contact', 'reseaux', i),
        `le lien de « ${reseau?.label ?? 'ce réseau'} » ne commence pas par https://`,
      );
    }
  }

  const site = typographier(v, null);

  // The site expects strings here, but YAML reads these as numbers.
  if (site.showreel) {
    site.showreel.vimeoId = String(site.showreel.vimeoId ?? '');
    site.showreel.annee = String(site.showreel.annee ?? '');
  }
  return site;
}

/** The folder name carries the order (prefix) and the id (rest). */
function lireNomDossier(nom) {
  const m = nom.match(/^(\d+)[_-](.+)$/);
  if (!m) return null;
  return { rang: Number(m[1]), id: m[2] };
}

function lireProjet(dossier) {
  const nom = path.basename(dossier);
  const decoupe = lireNomDossier(nom);

  if (!decoupe) {
    erreur(
      relatif(dossier),
      null,
      `le nom du dossier « ${nom} » ne commence pas par un numéro`,
      'renomme-le sous la forme 05_mon-projet : le numéro fixe la position sur le site.',
    );
    return null;
  }
  if (!/^[a-z0-9-]+$/.test(decoupe.id)) {
    erreur(
      relatif(dossier),
      null,
      `« ${decoupe.id} » ne peut contenir que des lettres minuscules, des chiffres et des tirets`,
      `pas d’espace, pas d’accent, pas de majuscule : ce nom sert d’adresse. ` +
        `Renomme le dossier en « ${decoupe.rang.toString().padStart(2, '0')}_${slugFichier(decoupe.id)} ».`,
    );
    return null;
  }

  const fiche = ouvrirYaml(path.join(dossier, 'projet.yml'));
  if (!fiche) return null;
  const v = fiche.valeurs;

  const projet = {
    id: decoupe.id,
    rang: decoupe.rang,
    dossier,
    title: texteRequis(fiche, ['title'], 'c’est le titre complet affiché sur la fiche du projet.'),
    shortTitle: texteRequis(fiche, ['shortTitle'], 'c’est le titre court affiché sur la carte 3D.'),
    year: texteRequis(fiche, ['year']),
    tag: texteRequis(fiche, ['tag'], 'deux ou trois mots, par exemple « Esport · Anime ».'),
    accent: texteRequis(fiche, ['accent'], 'une couleur au format #RRGGBB, par exemple #FF2D9C.'),
    blurb: texteRequis(fiche, ['blurb'], 'une phrase de résumé, affichée sous le titre.'),
    description: texteRequis(fiche, ['description'], 'le texte long qui décrit le projet.'),
    role: texteRequis(fiche, ['role']),
    kind: texteRequis(
      fiche,
      ['kind'],
      'personal pour une pièce personnelle, client pour une commande.',
    ),
    vimeoId: texteRequis(
      fiche,
      ['vimeoId'],
      'le numéro à la fin de l’adresse Vimeo, par exemple 1169640652 pour vimeo.com/1169640652.',
    ),
    posterUrl: `/posters/${decoupe.id}.webp`,
    credits: [],
    categories: undefined,
  };

  verifierFormat(fiche, ['accent'], projet.accent, formatAccent('#FF2D9C'));
  if (projet.kind && !KINDS.includes(projet.kind)) {
    erreur(
      fiche.fichier,
      fiche.ligne('kind'),
      `« ${projet.kind} » n’est pas une nature de projet connue`,
      `les seules valeurs possibles sont : ${KINDS.join(', ')}.`,
    );
  }
  verifierFormat(fiche, ['vimeoId'], projet.vimeoId, FORMAT_VIMEO);

  if (v.credits !== undefined) {
    if (typeof v.credits !== 'object' || Array.isArray(v.credits)) {
      erreur(
        fiche.fichier,
        fiche.ligne('credits'),
        'les « credits » doivent être une liste de « Rôle: Nom »',
      );
    } else {
      projet.credits = Object.entries(v.credits).map(([label, value]) => ({
        label,
        value: String(value),
      }));
    }
  }

  // Sections are the folders of the project, ordered by their numbers. A
  // `categories` line in the sheet overrides that order, and drops what it omits.
  projet.sections = sectionsDuProjet(dossier);
  projet.categories = projet.sections.map((s) => s.libelle);

  if (v.categories !== undefined) {
    const liste = Array.isArray(v.categories) ? v.categories : [v.categories];
    const resolues = [];
    for (const brute of liste) {
      const cle = String(brute).trim().toLowerCase();
      const section = projet.sections.find(
        (s) => s.dossier === cle || s.nom.toLowerCase() === cle || s.libelle.toLowerCase() === cle,
      );
      if (!section) {
        erreur(
          fiche.fichier,
          fiche.ligne('categories'),
          `« ${brute} » n’est pas une section de ce projet`,
          projet.sections.length > 0
            ? `ses sections sont : ${projet.sections.map((s) => s.dossier).join(', ')}.`
            : 'ce projet n’a aucun dossier de section : retire cette ligne, ou dépose les médias.',
        );
      } else if (resolues.includes(section.libelle)) {
        erreur(
          fiche.fichier,
          fiche.ligne('categories'),
          `« ${brute} » est cité deux fois`,
          'une section ne peut apparaître qu’une fois dans la liste.',
        );
      } else {
        resolues.push(section.libelle);
      }
    }
    if (resolues.length > 0) projet.categories = resolues;
  }

  return typographier(projet, null);
}

export function lireProjets() {
  if (!existsSync(PROJETS)) {
    erreur(relatif(PROJETS), null, 'le dossier des projets est introuvable');
    return [];
  }

  const dossiers = readdirSync(PROJETS)
    .filter((d) => !d.startsWith('.'))
    .filter((d) => statSync(path.join(PROJETS, d)).isDirectory())
    .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));

  const projets = [];
  const vus = new Map();

  for (const d of dossiers) {
    const projet = lireProjet(path.join(PROJETS, d));
    if (!projet) continue;
    if (vus.has(projet.id)) {
      erreur(
        relatif(path.join(PROJETS, d)),
        null,
        `ce dossier a le même nom que « ${vus.get(projet.id)} », après le numéro`,
        `renomme-le en gardant son numéro mais en changeant la suite, par exemple ` +
          `« ${d.slice(0, d.indexOf('_') + 1)}mon-nouveau-projet ». C’est cette partie ` +
          `qui sert d’adresse au projet, elle doit être unique.`,
      );
      continue;
    }
    vus.set(projet.id, d);
    projets.push(projet);
  }

  // Only when nothing else went wrong: the cause is already on screen otherwise.
  if (projets.length === 0 && !aDesErreurs()) {
    erreur(relatif(PROJETS), null, 'aucun projet trouvé');
  }
  return projets;
}
