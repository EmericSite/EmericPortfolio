import { create } from 'zustand';
import { projects } from '@/data/projects';

export type HubMode = 'hub' | 'hover' | 'project' | 'about' | 'contact';

const PROJECT_FLOW: HubMode[] = ['hub', 'hover', 'project'];
const inProjectFlow = (m: HubMode) => PROJECT_FLOW.includes(m);
const TOTAL = projects.length;
const wrap = (i: number) => ((i % TOTAL) + TOTAL) % TOTAL;

type HubStore = {
  mode: HubMode;
  hoveredId: string | null;
  activeId: string | null;
  scrollIndex: number;
  /**
   * Décalage continu pendant un glissement tactile, exprimé en nombre de
   * cartes (0.5 = le doigt a parcouru une demi-carte). Permet aux cartouches
   * de suivre le doigt au lieu de sauter d'un cran au relâchement.
   */
  dragOffset: number;
  videoStarted: boolean;
  showreelOpen: boolean;
  setHovered: (id: string | null) => void;
  setActive: (id: string | null) => void;
  setMode: (mode: HubMode) => void;
  setScrollIndex: (i: number) => void;
  setDragOffset: (d: number) => void;
  /** Termine un glissement : avance de `steps` crans et remet le décalage à 0. */
  commitDrag: (steps: number) => void;
  scrollNext: () => void;
  scrollPrev: () => void;
  startVideo: () => void;
  stopVideo: () => void;
  openShowreel: () => void;
  closeShowreel: () => void;
  reset: () => void;
};

export const useHubStore = create<HubStore>((set) => ({
  mode: 'hub',
  hoveredId: null,
  activeId: null,
  scrollIndex: 0,
  dragOffset: 0,
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
      // Re-click on the already-active card = trigger video playback
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
  setMode: (mode) =>
    set(() => {
      if (mode === 'hub')
        return { mode, hoveredId: null, activeId: null, videoStarted: false };
      if (mode === 'about' || mode === 'contact')
        return { mode, hoveredId: null, activeId: null, videoStarted: false };
      return { mode };
    }),
  setScrollIndex: (i) => set({ scrollIndex: wrap(i) }),
  setDragOffset: (d) => set({ dragOffset: d }),
  commitDrag: (steps) =>
    set((s) => ({ scrollIndex: wrap(s.scrollIndex + steps), dragOffset: 0 })),
  scrollNext: () =>
    set((s) => ({ scrollIndex: wrap(s.scrollIndex + 1), dragOffset: 0 })),
  scrollPrev: () =>
    set((s) => ({ scrollIndex: wrap(s.scrollIndex - 1), dragOffset: 0 })),
  startVideo: () => set({ videoStarted: true }),
  stopVideo: () => set({ videoStarted: false }),
  openShowreel: () => set({ showreelOpen: true }),
  closeShowreel: () => set({ showreelOpen: false }),
  reset: () =>
    set({
      mode: 'hub',
      hoveredId: null,
      activeId: null,
      videoStarted: false,
      showreelOpen: false,
    }),
}));
