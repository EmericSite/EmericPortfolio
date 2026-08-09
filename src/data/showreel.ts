// Emericfolio — created by Tomi-Tom, 2026
// Dresses the showreel video as a project card so the home carousel can show it

// The showreel is not a project, yet the hub renders it with the project
// components. Everything it needs is derived here from content/site.yml.

import { showreel } from '@/content/site';
import { rgba } from '@/lib/palette';
import { projects, type Project } from './projects';

/** Card artwork of the showreel: it lives in public/, not in content/. */
export const showreelPosterUrl = '/showreel-poster.webp';

/** Accent of the showreel card and button only, never a brand color. */
export const showreelAccent = showreel.accent;

/** Same accent as an rgba() string, for the tints derived from it. */
export function showreelAccentRgba(alpha: number): string {
  return rgba(showreelAccent, alpha);
}

/** Fake project: it opens no panel and only carries the poster and the title. */
export const showreelCard: Project = {
  id: '__showreel__',
  title: showreel.titre,
  shortTitle: showreel.titre,
  year: showreel.annee,
  tag: '',
  accent: showreelAccent,
  blurb: '',
  description: '',
  role: '',
  kind: 'personal',
  credits: [],
  posterUrl: showreelPosterUrl,
  vimeoId: showreel.vimeoId,
};

/** In stack layout the showreel card is appended after the projects. */
export const showreelIndex = projects.length;
