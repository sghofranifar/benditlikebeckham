import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────
// One global store = the whole "save game".
// It is saved in the browser (localStorage) on this device only.
// ─────────────────────────────────────────────────────────────

export type Screen =
  | { name: 'start' }
  | { name: 'hub' }
  | { name: 'level'; id: number }
  | { name: 'game'; id: number }
  | { name: 'squad' }
  | { name: 'archive' }
  | { name: 'summary' };

export const XP = { task: 10, vocab: 20, sprinter: 30, gameStar: 25, source: 5 } as const;

interface GameState {
  playerName: string;
  screen: Screen;
  unlocked: number[];
  doneTasks: Record<string, true>;
  gameStars: Record<number, number>; // level id → best stars (1-3)
  seenSources: Record<string, true>;
  seenSigns: Record<number, true>; // dramatic level-sign intro already shown
  sound: boolean;
  teacherMode: boolean;

  setName: (n: string) => void;
  go: (s: Screen) => void;
  toggleTask: (id: string) => void;
  winGame: (levelId: number, stars: number) => void;
  unlock: (levelId: number) => void;
  seeSource: (id: string) => void;
  seeSign: (levelId: number) => void;
  toggleSound: () => void;
  setTeacherMode: (on: boolean) => void;
  reset: () => void;
}

const fresh = {
  playerName: '',
  screen: { name: 'start' } as Screen,
  unlocked: [1],
  doneTasks: {},
  gameStars: {},
  seenSources: {},
  seenSigns: {},
  sound: true,
  teacherMode: false,
};

export const useGame = create<GameState>()(
  persist(
    (set) => ({
      ...fresh,
      setName: (playerName) => set({ playerName }),
      go: (screen) => {
        set({ screen });
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      },
      toggleTask: (id) =>
        set((s) => {
          const doneTasks = { ...s.doneTasks };
          if (doneTasks[id]) delete doneTasks[id];
          else doneTasks[id] = true;
          return { doneTasks };
        }),
      winGame: (levelId, stars) =>
        set((s) => ({ gameStars: { ...s.gameStars, [levelId]: Math.max(stars, s.gameStars[levelId] ?? 0) } })),
      unlock: (levelId) => set((s) => (s.unlocked.includes(levelId) ? s : { unlocked: [...s.unlocked, levelId] })),
      seeSource: (id) => set((s) => ({ seenSources: { ...s.seenSources, [id]: true } })),
      seeSign: (levelId) => set((s) => ({ seenSigns: { ...s.seenSigns, [levelId]: true } })),
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      setTeacherMode: (teacherMode) => set({ teacherMode }),
      reset: () => set({ ...fresh }),
    }),
    {
      name: 'bend-it-quest-v1',
      storage: createJSONStorage(() => {
        try {
          const k = '__t';
          localStorage.setItem(k, k);
          localStorage.removeItem(k);
          return localStorage;
        } catch {
          // Private mode / blocked storage: keep progress in memory for this visit.
          const mem = new Map<string, string>();
          return {
            getItem: (k: string) => mem.get(k) ?? null,
            setItem: (k: string, v: string) => void mem.set(k, v),
            removeItem: (k: string) => void mem.delete(k),
          };
        }
      }),
      partialize: (s) => ({
        playerName: s.playerName,
        unlocked: s.unlocked,
        doneTasks: s.doneTasks,
        gameStars: s.gameStars,
        seenSources: s.seenSources,
        seenSigns: s.seenSigns,
        sound: s.sound,
      }),
    },
  ),
);
