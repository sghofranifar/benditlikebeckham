// ─────────────────────────────────────────────────────────────
// Content model. Every level (= one chapter of the novel) is pure data,
// so new tasks can be added in src/data/levels.ts without touching UI code.
// ─────────────────────────────────────────────────────────────

export type Focus =
  | 'Prediction'
  | 'Comprehension'
  | 'Language'
  | 'Theme'
  | 'Culture'
  | 'Creative'
  | 'Discussion';

export type ThemeId = 'identity' | 'family' | 'gender' | 'prejudice' | 'friendship' | 'secrets' | 'dreams';

export interface Quote {
  text: string;
  ref: string; // e.g. "Ch. 3, p. 35"
}

export interface Task {
  id: string;
  focus: Focus;
  title: string;
  prompt: string;
  support?: string; // sentence starters / scaffold
  sprinter?: string; // extension for fast finishers
  quote?: Quote;
  sourceId?: string; // opens a cultural-background modal
  minutes?: number;
}

export interface VocabWord {
  word: string;
  meaning: string;
  wordClass: 'noun' | 'verb' | 'adjective' | 'adverb';
}

export type GameSpec =
  | { kind: 'memory'; title: string; pairs: [string, string][] }
  | { kind: 'kick'; title: string; questions: { q: string; options: string[]; answer: number; why: string }[] }
  | { kind: 'scramble'; title: string; words: { word: string; clue: string }[] }
  | { kind: 'sort'; title: string; bins: string[]; items: { text: string; bin: number }[] }
  | { kind: 'timeline'; title: string; events: string[] } // events given in the CORRECT order
  | { kind: 'truefalse'; title: string; seconds: number; statements: { s: string; t: boolean; why: string }[] };

export interface JessStats {
  passion: number;
  family: number;
  freedom: number;
  friendship: number;
}

export interface Level {
  id: number; // chapter number; 14 = finale
  chapter: string; // "Chapter One"
  title: string;
  tagline: string;
  pages: string;
  week: 1 | 2 | 3 | 4;
  extra?: boolean; // bonus unit outside the chapter sequence
  setting: string;
  accent: 'lime' | 'saffron' | 'rose' | 'sky' | 'violet';
  open?: boolean; // true = playable from the start; otherwise a personal unlock code is needed
  themes: ThemeId[];
  commentator: string[]; // in-app narrator lines (not from the book)
  bookVoice?: Quote;
  stats?: JessStats; // how Jess is doing at the END of this chapter
  vocab: VocabWord[];
  pre: Task[];
  whilst: Task[];
  post: Task[];
  sprinter: Task;
  game: GameSpec;
  unlocksCards: string[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  colour: string;
  initials: string;
  bio: string;
  traits: { determination: number; tradition: number; humour: number; empathy: number };
  bigQuestion: string;
}

export interface Source {
  id: string;
  title: string;
  kicker: string;
  icon: string;
  paragraphs: string[];
  facts?: string[];
  inTheNovel: string;
  image?: { src: string; alt: string }; // optional photo the teacher can add (see img/README.md)
  thinkAbout: string;
}
