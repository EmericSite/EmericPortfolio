// Emericfolio — created by Tomi-Tom, 2026
// The list of projects the whole site reads, with the shape of a project and its gallery

// Projects live in content/projets/<number>_<name>/, which `npm run contenu`
// compiles into the .generated files. Only types and display rules stay here.

import { GALLERY_CATEGORIES } from './categories.generated';
import { generatedGallery } from './gallery.generated';
import { generatedProjects } from './projects.generated';

// Sections and their order come from tools/contenu/medias.mjs, which names the
// folders content/ is filled with.
export { GALLERY_CATEGORIES };
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
  /** 'personal' for a self-driven piece, 'client' for commissioned work. */
  kind: 'personal' | 'client';
  credits: { label: string; value: string }[];
  posterUrl: string;
  vimeoId: string;
  /** Per-project section order from its `categories` field; defaults to GALLERY_CATEGORIES. */
  categories?: readonly GalleryCategory[];
};

/** Ordered by the folder numbers in content/projets/. */
export const projects: Project[] = generatedProjects;

/** Media picked up from the project folder by `npm run contenu`. */
export function galleryFor(project: Project): GalleryItem[] {
  return generatedGallery[project.id] ?? [];
}

export function categoriesFor(project: Project): readonly GalleryCategory[] {
  return project.categories ?? GALLERY_CATEGORIES;
}
