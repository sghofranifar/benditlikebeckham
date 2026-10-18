import type { GameSpec } from '../types';

export type GameProps<K extends GameSpec['kind']> = {
  spec: Extract<GameSpec, { kind: K }>;
  onFinish: (stars: number) => void;
  accent: string;
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const starsFromScore = (correct: number, total: number) => {
  const r = correct / total;
  return r >= 0.95 ? 3 : r >= 0.75 ? 2 : r >= 0.6 ? 1 : 0;
};
