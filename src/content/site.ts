// ---------------------------------------------------------------------------
// TEXTES DU SITE
//
// Tous les textes affichés sont ici. Modifier une valeur entre guillemets
// suffit, il n'y a pas de code à toucher. Voir CONTENU.md.
//
// Attention : garder les guillemets autour du texte, et la virgule à la fin
// de chaque ligne. Pour une apostrophe, écrire ’ (ex. « d’un »)
// ou utiliser des guillemets doubles autour de la phrase.
// ---------------------------------------------------------------------------

export const identite = {
  nom: 'Emeric Ressy',
  metier: 'Motion Designer · Paris',
};

export const loader = {
  // Texte affiché pendant le chargement du site.
  texte: 'Loading visual memory',
};

export const accueil = {
  surtitre: 'Mélancolie électrique',
  // Le titre est sur deux lignes, la seconde est en italique.
  titreLigne1: 'Motion · 3D ·',
  titreLigne2: 'Direction artistique.',
};

export const navigation = [
  { label: 'Work', mode: 'hub' },
  { label: 'About', mode: 'about' },
  { label: 'Contact', mode: 'contact' },
] as const;

export const about = {
  // Bandeau d'en-tête du panneau
  lieuEtAnnee: 'Paris · 2026',
  reference: 'ST# 01',
  version: 'v.04 — rev.26',

  // Grand titre, sur trois lignes
  titreLigne1: 'Motion',
  titreLigne2: 'Designer,',
  titreLigne3: 'based in Paris.',
  sousTitre: '⎯⎯ 3D · Direction Artistique · Motion',

  // Citation mise en avant
  citation:
    'Through motion design, I explore narrative, atmosphere, and visual identity to create striking and memorable imagery.',
  citationLegende: '— Statement / EN',

  // Blocs « Approach ». Ajouter ou retirer un bloc met à jour la numérotation.
  approche: [
    {
      tag: 'Méthode',
      texte:
        'Je construis des images qui ne s’oublient pas. Chaque pièce part d’une atmosphère, d’un grain, d’une intuition narrative — la 3D n’est qu’un moyen.',
    },
    {
      tag: 'Direction',
      texte:
        'Je travaille en direction artistique sur le motion : composition, lumière, rythme, sound design. La technique sert le sentiment, jamais l’inverse.',
    },
  ],

  // Chiffres clés. « label » accepte un retour à la ligne avec \n.
  index: [
    { idx: '01', valeur: '04', label: 'Projets phares\n2024 — 2026' },
    { idx: '02', valeur: '02', label: 'Registres\nGaming · Poétique' },
    { idx: '03', valeur: '01', label: 'Studio\nParis' },
  ],
  indexPeriode: '2024 / 2026',

  clients: ['Ankama', 'Gentle Mates', 'HoYoverse'],
  clientsMention: 'Direction · Motion',

  ctaSurtitre: '/Contact',
  ctaTexte: 'Discuter d’un projet',
};

export const contact = {
  email: 'hello@emericressy.com',
  disponibilite: 'Disponible · 2026',

  // Titre sur deux lignes, la seconde est en italique.
  titreLigne1: 'Parlons d’un',
  titreLigne2: 'projet.',

  accroche:
    'Direction artistique, motion 3D, identité visuelle. Pour les briefs gaming/esport, anime, ou les pièces plus narratives — écris-moi directement.',

  formulaireIntro: 'Ou écris-moi ici',
  fuseau: 'Paris · UTC+1',

  // Réseaux sociaux. Retirer une ligne la fait disparaître du site.
  reseaux: [
    {
      label: 'Instagram',
      handle: '@fumir._o',
      href: 'https://www.instagram.com/fumir._o/?hl=fr',
    },
    { label: 'X', handle: '@fumir_o', href: 'https://x.com/fumir_o' },
    {
      label: 'LinkedIn',
      handle: 'emeric-ressy',
      href: 'https://www.linkedin.com/in/emeric-ressy-a05b0a194/',
    },
  ],
};
