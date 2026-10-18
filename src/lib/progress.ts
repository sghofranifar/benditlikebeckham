import { LEVELS } from '../data/levels';
import { CHARACTERS } from '../data/characters';
import { SOURCES } from '../data/sources';
import { XP } from '../store';
import type { Level } from '../types';

type Save = {
  doneTasks: Record<string, true>;
  gameStars: Record<number, number>;
  seenSources: Record<string, true>;
  unlocked: number[];
};

// Every check-box task in a level, in display order.
export const levelTaskIds = (l: Level) => [
  ...l.pre.map((t) => t.id),
  `l${l.id}-vocab`,
  ...l.whilst.map((t) => t.id),
  ...l.post.map((t) => t.id),
  l.sprinter.id,
];

export function levelProgress(l: Level, s: Save) {
  const ids = levelTaskIds(l);
  const done = ids.filter((id) => s.doneTasks[id]).length;
  const won = (s.gameStars[l.id] ?? 0) > 0;
  const total = ids.length + 1; // +1 for the game
  return { done: done + (won ? 1 : 0), total, pct: (done + (won ? 1 : 0)) / total, won, complete: won && done >= ids.length - 1 };
}

export function totalXP(s: Save) {
  let xp = 0;
  for (const id of Object.keys(s.doneTasks)) {
    if (id.endsWith('-vocab')) xp += XP.vocab;
    else if (id.endsWith('-sprint')) xp += XP.sprinter;
    else xp += XP.task;
  }
  for (const stars of Object.values(s.gameStars)) xp += stars * XP.gameStar;
  xp += Object.keys(s.seenSources).length * XP.source;
  return xp;
}

export const RANKS = [
  { xp: 0, name: 'Park Player' },
  { xp: 150, name: 'Trialist' },
  { xp: 400, name: 'Squad Player' },
  { xp: 800, name: 'First Team' },
  { xp: 1300, name: 'Captain' },
  { xp: 1900, name: 'Santa Clara Scholar' },
];

export function rankFor(xp: number) {
  let i = 0;
  RANKS.forEach((r, idx) => {
    if (xp >= r.xp) i = idx;
  });
  const cur = RANKS[i];
  const next = RANKS[i + 1];
  return { ...cur, index: i, next, toNext: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1 };
}

export function unlockedCards(s: Save) {
  const ids = new Set<string>();
  LEVELS.forEach((l) => {
    if ((s.gameStars[l.id] ?? 0) > 0) l.unlocksCards.forEach((c) => ids.add(c));
  });
  return CHARACTERS.filter((c) => ids.has(c.id));
}

export function badges(s: Save) {
  const sprints = Object.keys(s.doneTasks).filter((k) => k.endsWith('-sprint')).length;
  const vocab = Object.keys(s.doneTasks).filter((k) => k.endsWith('-vocab')).length;
  const threeStars = Object.values(s.gameStars).filter((v) => v >= 3).length;
  const wins = Object.values(s.gameStars).filter((v) => v > 0).length;
  const sources = Object.keys(s.seenSources).length;
  return [
    { id: 'whistle', icon: '📣', name: 'First Whistle', desc: 'Complete your first task', got: Object.keys(s.doneTasks).length > 0 },
    { id: 'words', icon: '📒', name: 'Wordsmith', desc: 'Vocab Drill done in 5 chapters', got: vocab >= 5 },
    { id: 'sprinter', icon: '⚡', name: 'Sprinter', desc: 'Complete 5 Sprinter Challenges', got: sprints >= 5 },
    { id: 'hattrick', icon: '🎩', name: 'Hat-trick', desc: 'Three games with 3 stars', got: threeStars >= 3 },
    { id: 'scout', icon: '🧭', name: 'Culture Scout', desc: `Open ${Math.min(8, SOURCES.length)} source files`, got: sources >= 8 },
    { id: 'season', icon: '🏆', name: 'Full Season', desc: 'Win all 14 games', got: wins >= LEVELS.length },
  ];
}
