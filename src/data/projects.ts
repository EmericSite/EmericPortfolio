export type GalleryItem =
  | { type: 'image'; src: string; alt?: string }
  | { type: 'video'; src: string; poster?: string };

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
      { type: 'video', src: '/projects/gentle-mates/g01.mp4' },
      { type: 'image', src: '/projects/gentle-mates/s01.webp' },
      { type: 'image', src: '/projects/gentle-mates/s03.webp' },
      { type: 'video', src: '/projects/gentle-mates/g02.mp4' },
      { type: 'image', src: '/projects/gentle-mates/s05.webp' },
      { type: 'image', src: '/projects/gentle-mates/s06.webp' },
      { type: 'video', src: '/projects/gentle-mates/g03.mp4' },
      { type: 'image', src: '/projects/gentle-mates/s04.webp' },
      { type: 'video', src: '/projects/gentle-mates/g04.mp4' },
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
      { type: 'image', src: '/projects/dofus/s01.webp' },
      { type: 'image', src: '/projects/dofus/s02.webp' },
      { type: 'image', src: '/projects/dofus/s03.webp' },
      { type: 'image', src: '/projects/dofus/s04.webp' },
      { type: 'image', src: '/projects/dofus/s05.webp' },
      { type: 'image', src: '/projects/dofus/s06.webp' },
      { type: 'image', src: '/projects/dofus/s07.webp' },
      { type: 'image', src: '/projects/dofus/s08.webp' },
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
      { type: 'image', src: '/projects/douce-melancolie/s01.webp' },
      { type: 'image', src: '/projects/douce-melancolie/s02.webp' },
      { type: 'image', src: '/projects/douce-melancolie/s03.webp' },
      { type: 'image', src: '/projects/douce-melancolie/s04.webp' },
      { type: 'image', src: '/projects/douce-melancolie/s05.webp' },
      { type: 'image', src: '/projects/douce-melancolie/s06.webp' },
      { type: 'image', src: '/projects/douce-melancolie/s07.webp' },
      { type: 'image', src: '/projects/douce-melancolie/s08.webp' },
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
      { type: 'image', src: '/projects/come-torment/s01.webp' },
      { type: 'image', src: '/projects/come-torment/s02.webp' },
      { type: 'image', src: '/projects/come-torment/s03.webp' },
      { type: 'image', src: '/projects/come-torment/s04.webp' },
      { type: 'image', src: '/projects/come-torment/s05.webp' },
      { type: 'image', src: '/projects/come-torment/s06.webp' },
      { type: 'image', src: '/projects/come-torment/s07.webp' },
      { type: 'image', src: '/projects/come-torment/s08.webp' },
    ],
  },
];
