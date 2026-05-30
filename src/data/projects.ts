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
  gallery?: GalleryItem[];
};

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
    gallery: [
      { type: 'image', src: '/projects/gentle-mates/still01.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still02.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still03.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still04.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still05.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still06.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still07.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still08.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still09.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still10.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still11.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still12.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still13.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still14.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still15.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still16.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/gentle-mates/still17.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'video', src: '/projects/gentle-mates/scrap01.mp4', category: 'SCRAPS & RESEARCH', width: 400, height: 224 },
      { type: 'video', src: '/projects/gentle-mates/scrap02.mp4', category: 'SCRAPS & RESEARCH', width: 400, height: 224 },
      { type: 'video', src: '/projects/gentle-mates/scrap03.mp4', category: 'SCRAPS & RESEARCH', width: 400, height: 224 },
      { type: 'video', src: '/projects/gentle-mates/scrap04.mp4', category: 'SCRAPS & RESEARCH', width: 400, height: 224 },
      { type: 'video', src: '/projects/gentle-mates/scrap05.mp4', category: 'SCRAPS & RESEARCH', width: 400, height: 224 },
    ],
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
    gallery: [
      { type: 'image', src: '/projects/dofus/still01.webp', category: 'STILLFRAMES', width: 802, height: 803 },
      { type: 'image', src: '/projects/dofus/still02.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still03.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still04.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still05.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still06.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still07.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still08.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still09.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still10.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still11.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still12.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still13.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still14.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still15.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still16.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still17.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still18.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'image', src: '/projects/dofus/still19.webp', category: 'STILLFRAMES', width: 1080, height: 1080 },
      { type: 'video', src: '/projects/dofus/bts01.mp4', category: 'BEHIND THE SCENE', width: 1080, height: 608 },
      { type: 'video', src: '/projects/dofus/bts02.mp4', category: 'BEHIND THE SCENE', width: 1080, height: 608 },
      { type: 'video', src: '/projects/dofus/bts03.mp4', category: 'BEHIND THE SCENE', width: 1080, height: 608 },
      { type: 'video', src: '/projects/dofus/bts04.mp4', category: 'BEHIND THE SCENE', width: 1080, height: 608 },
      { type: 'video', src: '/projects/dofus/bts05.mp4', category: 'BEHIND THE SCENE', width: 1080, height: 608 },
      { type: 'video', src: '/projects/dofus/bts06.mp4', category: 'BEHIND THE SCENE', width: 1080, height: 608 },
      { type: 'video', src: '/projects/dofus/bts07.mp4', category: 'BEHIND THE SCENE', width: 1080, height: 608 },
      { type: 'video', src: '/projects/dofus/bts08.mp4', category: 'BEHIND THE SCENE', width: 1080, height: 608 },
    ],
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
    gallery: [
      { type: 'image', src: '/projects/douce-melancolie/board01.webp', category: 'STORYBOARD', width: 974, height: 1600 },
      { type: 'image', src: '/projects/douce-melancolie/still01.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still02.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still03.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still04.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still05.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still06.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still07.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still08.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still09.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still10.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still11.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still12.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still13.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still14.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still15.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still16.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still17.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/douce-melancolie/still18.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
    ],
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
    gallery: [
      { type: 'image', src: '/projects/come-torment/board01.webp', category: 'STORYBOARD', width: 1074, height: 960 },
      { type: 'image', src: '/projects/come-torment/still01.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still02.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still03.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still04.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still05.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still06.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still07.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still08.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still09.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still10.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still11.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still12.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still13.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
      { type: 'image', src: '/projects/come-torment/still14.webp', category: 'STILLFRAMES', width: 1600, height: 900 },
    ],
  },
];
