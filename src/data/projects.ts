// ---------------------------------------------------------------------------
// FICHES PROJETS
//
// C'est le fichier à éditer pour ajouter un projet ou changer un texte.
// Les images et vidéos ne se déclarent PAS ici : elles sont détectées
// automatiquement dans public/projects/<id>/<categorie>/ par `npm run
// scan-media`. Voir CONTENU.md pour la marche à suivre.
// ---------------------------------------------------------------------------

import { generatedGallery } from './gallery.generated';

// Catégories de médias affichées en sections dans le panneau projet.
// L'ordre ci-dessous est l'ordre d'affichage des sections.
export const GALLERY_CATEGORIES = [
  'MOTION',
  'STILLFRAMES',
  'STORYBOARD',
  'BEHIND THE SCENE',
  'SCRAPS & RESEARCH',
] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export type GalleryItem =
  | {
      type: 'image';
      src: string;
      alt?: string;
      category?: GalleryCategory;
      width?: number;
      height?: number;
    }
  | {
      type: 'video';
      src: string;
      poster?: string;
      category?: GalleryCategory;
      width?: number;
      height?: number;
    };

export type Project = {
  id: string;
  title: string;
  shortTitle: string;
  year: string;
  tag: string;
  accent: string;
  blurb: string;
  description: string;
  role: string;
  credits: { label: string; value: string }[];
  posterUrl: string;
  vimeoId: string;
  /**
   * Ordre des sections propre à ce projet. Facultatif : sans lui, on suit
   * l'ordre global de GALLERY_CATEGORIES. Permet par exemple de faire
   * remonter le storyboard en premier sur un projet en particulier.
   */
  categories?: readonly GalleryCategory[];
  /**
   * Médias saisis à la main. Normalement inutile : la galerie vient de
   * `npm run scan-media`. Sert de porte de sortie pour un cas particulier.
   */
  gallery?: GalleryItem[];
};

/**
 * Médias d'un projet : ceux détectés par le scan, complétés par ceux
 * éventuellement saisis à la main dans la fiche.
 */
export function galleryFor(project: Project): GalleryItem[] {
  return [...(generatedGallery[project.id] ?? []), ...(project.gallery ?? [])];
}

/** Ordre des sections à afficher pour un projet donné. */
export function categoriesFor(project: Project): readonly GalleryCategory[] {
  return project.categories ?? GALLERY_CATEGORIES;
}

export const projects: Project[] = [
  {
    id: 'gentle-mates',
    title: 'Gentle Mates × Zenless Zone Zero',
    shortTitle: 'Gentle Mates × ZZZ',
    year: '2026',
    tag: 'Esport · Anime',
    accent: '#FF2D9C',
    blurb:
      'Identité motion pour le team-up Gentle Mates × HoYoverse. Énergie urbaine anime, rythme esport.',
    description:
      "Direction artistique du teaser officiel marquant le partenariat entre Gentle Mates et HoYoverse pour Zenless Zone Zero. La trame visuelle mélange l'agressivité urbaine de l'esport avec la grammaire anime du jeu — chrome, néons, montages saccadés, vitesse.",
    role: 'Direction artistique · Motion 3D',
    credits: [
      { label: 'Client', value: 'Gentle Mates × HoYoverse' },
      { label: 'Direction artistique', value: 'Emeric Ressy' },
      { label: 'Motion 3D', value: 'Emeric Ressy' },
    ],
    posterUrl: '/posters/gentle-mates.webp',
    vimeoId: '1170721004',
  },
  {
    id: 'dofus',
    title: "DOFUS — C'est ici que tout commence",
    shortTitle: 'DOFUS',
    year: '2025',
    tag: 'Animation · Ankama',
    accent: '#00F0FF',
    blurb:
      "Direction artistique sur le lancement Ankama. Univers chaleureux, narration française.",
    description:
      "Pièce de lancement pour Ankama autour de DOFUS. Le défi : raconter un univers familier à une nouvelle génération, sans trahir ses racines. Le motion s'appuie sur la palette chaude du jeu, les volumes simples et un rythme narratif qui laisse respirer.",
    role: 'Direction artistique',
    credits: [
      { label: 'Client', value: 'Ankama' },
      { label: 'Direction artistique', value: 'Emeric Ressy' },
    ],
    posterUrl: '/posters/dofus.webp',
    vimeoId: '1169640652',
  },
  {
    id: 'douce-melancolie',
    title: 'Douce Mélancolie des Choses',
    shortTitle: 'Douce Mélancolie',
    year: '2025',
    tag: 'Personnel · Poétique',
    accent: '#F4D8E2',
    blurb:
      'Pièce personnelle. Atmosphère, lenteur, brouillard. Le silence comme matière.',
    description:
      "Recherche personnelle sur la lenteur. Une pièce qui refuse l'efficacité et préfère le silence, le brouillard, le poids du temps qui passe. Texture, lumière diffuse, presque rien — et pourtant la sensation que quelque chose va arriver.",
    role: 'Direction · Motion · Édition',
    credits: [
      { label: 'Auteur', value: 'Emeric Ressy' },
      { label: 'Année', value: '2025' },
    ],
    posterUrl: '/posters/douce-melancolie.webp',
    vimeoId: '1168061777',
  },
  {
    id: 'come-torment',
    title: 'Come, Torment',
    shortTitle: 'Come, Torment',
    year: '2024',
    tag: 'Personnel · Dark',
    accent: '#FF2A2A',
    blurb:
      'Registre dark fantasy. Volumes lourds, lumière dure, tension contenue.',
    description:
      "Étude personnelle dans un registre dark fantasy. Volumes massifs, contre-jour, lumières dures. Une pièce contenue qui flirte avec l'inconfort sans jamais basculer dans le grotesque.",
    role: 'Direction · Motion · Édition',
    credits: [
      { label: 'Auteur', value: 'Emeric Ressy' },
      { label: 'Année', value: '2024' },
    ],
    posterUrl: '/posters/come-torment.webp',
    vimeoId: '932641794',
  },
];
