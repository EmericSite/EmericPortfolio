// Emericfolio — created by Tomi-Tom, 2026
// Single source of truth for what the home page shows: screen, focused project, carousel position

import { create } from 'zustand';
import { projects } from '@/data/projects';

export type HubMode = 'hub' | 'hover' | 'project' | 'about' | 'contact';

const PROJECT_FLOW: HubMode[] = ['hub', 'hover', 'project'];
const inProjectFlow = (m: HubMode) => PROJECT_FLOW.includes(m);
const wrap = (i: number, total: number) => ((i % total) + total) % total;

type HubStore = {
  mode: HubMode;
  hoveredId: string | null;
  activeId: string | null;
  scrollIndex: number;
  /**
   * Live drag distance in cards (0.5 = half a card travelled), so the cards
   * follow the finger instead of jumping one step on release.
   */
  dragOffset: number;
  /**
   * Carousel card count, set by the scene since it alone knows the layout:
   * one per project in orbit, plus the showreel card in stack layout.
   */
  cardCount: number;
  videoStarted: boolean;
  showreelOpen: boolean;
  setHovered: (id: string | null) => void;
  setActive: (id: string | null) => void;
  setMode: (mode: HubMode) => void;
  setCardCount: (n: number) => void;
  setDragOffset: (d: number) => void;
  /** Ends a drag: moves by `steps` and resets the offset. */
  commitDrag: (steps: number) => void;
  scrollNext: () => void;
  scrollPrev: () => void;
  startVideo: () => void;
  stopVideo: () => void;
  openShowreel: () => void;
  closeShowreel: () => void;
};

export const useHubStore = create<HubStore>((set, get) => ({
  mode: 'hub',
  hoveredId: null,
  activeId: null,
  scrollIndex: 0,
  dragOffset: 0,
  cardCount: projects.length,
  videoStarted: false,
  showreelOpen: false,
  setHovered: (id) =>
    set((s) => {
      if (!inProjectFlow(s.mode)) return {};
      if (s.activeId) return { hoveredId: id };
      if (id !== null) {
        const idx = projects.findIndex((p) => p.id === id);
        return {
          hoveredId: id,
          mode: 'hover',
          scrollIndex: idx >= 0 ? idx : s.scrollIndex,
        };
      }
      return { hoveredId: null, mode: 'hub' };
    }),
  setActive: (id) =>
    set((s) => {
      if (!inProjectFlow(s.mode)) return {};
      // Clicking the already-active card starts the video.
      if (id !== null && id === s.activeId) {
        return { videoStarted: true };
      }
      const idx =
        id !== null ? projects.findIndex((p) => p.id === id) : s.scrollIndex;
      return {
        activeId: id,
        hoveredId: null,
        videoStarted: false,
        mode: id ? 'project' : 'hub',
        scrollIndex: idx >= 0 ? idx : s.scrollIndex,
      };
    }),
  // Only 'hover' and 'project' carry a selection: any other mode drops it.
  setMode: (mode) =>
    set(() =>
      mode === 'hover' || mode === 'project'
        ? { mode }
        : { mode, hoveredId: null, activeId: null, videoStarted: false },
    ),
  // Re-wrap the index, otherwise going from stack to orbit leaves the carousel
  // pointing at a showreel card that no longer exists.
  setCardCount: (n) =>
    set((s) => ({
      cardCount: n,
      scrollIndex: wrap(s.scrollIndex, n),
      dragOffset: 0,
    })),
  // Clamped to one card so a long gesture never throws the stack across
  // several steps at once.
  setDragOffset: (d) => set({ dragOffset: Math.max(-1, Math.min(1, d)) }),
  commitDrag: (steps) =>
    set((s) => ({
      scrollIndex: wrap(s.scrollIndex + steps, s.cardCount),
      dragOffset: 0,
    })),
  scrollNext: () => get().commitDrag(1),
  scrollPrev: () => get().commitDrag(-1),
  startVideo: () => set({ videoStarted: true }),
  stopVideo: () => set({ videoStarted: false }),
  openShowreel: () => set({ showreelOpen: true }),
  closeShowreel: () => set({ showreelOpen: false }),
}));
