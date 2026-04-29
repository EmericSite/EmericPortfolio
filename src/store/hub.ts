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
  setHovered: (id: string | null) => void;
  setActive: (id: string | null) => void;
  setMode: (mode: HubMode) => void;
  setScrollIndex: (i: number) => void;
  scrollNext: () => void;
  scrollPrev: () => void;
  reset: () => void;
};

export const useHubStore = create<HubStore>((set) => ({
  mode: 'hub',
  hoveredId: null,
  activeId: null,
  scrollIndex: 0,
  setHovered: (id) =>
    set((s) => {
      if (!inProjectFlow(s.mode)) return {};
      if (s.activeId) return { hoveredId: id };
      if (id !== null) {
        // Sync scrollIndex so the focused project sticks after pointer-out
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
      // Toggle off when re-clicking the active card
      if (id !== null && id === s.activeId) {
        return { activeId: null, hoveredId: null, mode: 'hub' };
      }
      const idx =
        id !== null ? projects.findIndex((p) => p.id === id) : s.scrollIndex;
      return {
        activeId: id,
        hoveredId: null,
        mode: id ? 'project' : 'hub',
        scrollIndex: idx >= 0 ? idx : s.scrollIndex,
      };
    }),
  setMode: (mode) =>
    set(() => {
      if (mode === 'hub') return { mode, hoveredId: null, activeId: null };
      if (mode === 'about' || mode === 'contact')
        return { mode, hoveredId: null, activeId: null };
      return { mode };
    }),
  setScrollIndex: (i) => set({ scrollIndex: wrap(i) }),
  scrollNext: () => set((s) => ({ scrollIndex: wrap(s.scrollIndex + 1) })),
  scrollPrev: () => set((s) => ({ scrollIndex: wrap(s.scrollIndex - 1) })),
  reset: () => set({ mode: 'hub', hoveredId: null, activeId: null }),
}));
