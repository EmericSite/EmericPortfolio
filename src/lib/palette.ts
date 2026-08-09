// Emericfolio — created by Tomi-Tom, 2026
// Brand colours for JS, plus the helper that tints them

// CSS cannot import TypeScript, so these mirror the Tailwind variables of
// src/app/globals.css: change both together.

export const palette = {
  ink: '#08070C',
  fog: '#2A2730',
  mist: '#B8B0BE',
  chrome: '#E8E6EC',
  pearl: '#F4D8E2',
  cyan: '#00F0FF',
  magenta: '#FF2D9C',
} as const;

/** Any hex color as an rgba() string, for the tints derived from it. */
export function rgba(hex: string, alpha: number): string {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
}
