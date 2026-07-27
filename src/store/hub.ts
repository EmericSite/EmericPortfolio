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
   * Décalage continu pendant un glissement tactile, exprimé en nombre de
   * cartes (0.5 = le doigt a parcouru une demi-carte). Permet aux cartouches
   * de suivre le doigt au lieu de sauter d'un cran au relâchement.
   */
  dragOffset: number;
  /**
   * Nombre de cartes du carrousel. Vaut le nombre de projets en orbite, un de
   * plus en pile où s'ajoute la carte du showreel. Déclaré par la scène, qui
   * seule connaît la disposition courante.
   */
  cardCount: number;
  videoStarted: boolean;
  showreelOpen: boolean;
  setHovered: (id: string | null) => void;
  setActive: (id: string | null) => void;
  setMode: (mode: HubMode) => void;
  setScrollIndex: (i: number) => void;
  setCardCount: (n: number) => void;
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
  setScrollIndex: (i) => set((s) => ({ scrollIndex: wrap(i, s.cardCount) })),
  // Le nombre de cartes change avec la disposition : on ramène l'index dans
  // les bornes, sinon passer de la pile à l'orbite laisserait le carrousel
  // pointé sur une carte showreel qui n'existe plus.
  setCardCount: (n) =>
    set((s) => ({
      cardCount: n,
      scrollIndex: wrap(s.scrollIndex, n),
      dragOffset: 0,
    })),
  // Borné à une carte : un geste très long ne doit pas expédier la pile à
  // l'autre bout, on n'avance jamais que d'un cran à la fois.
  setDragOffset: (d) => set({ dragOffset: Math.max(-1, Math.min(1, d)) }),
  commitDrag: (steps) =>
    set((s) => ({
      scrollIndex: wrap(s.scrollIndex + steps, s.cardCount),
      dragOffset: 0,
    })),
  scrollNext: () =>
    set((s) => ({
      scrollIndex: wrap(s.scrollIndex + 1, s.cardCount),
      dragOffset: 0,
    })),
  scrollPrev: () =>
    set((s) => ({
      scrollIndex: wrap(s.scrollIndex - 1, s.cardCount),
      dragOffset: 0,
    })),
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
