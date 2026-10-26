import { CODE_SECRET } from '../data/config';

// Personal codes: each code only works for ONE student name, so sharing codes is pointless.
// FNV-1a hash → 4 characters from an alphabet without look-alikes (no 0/O, 1/I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const normaliseName = (n: string) => n.toLowerCase().normalize('NFKD').replace(/[^a-z]/g, '');

function hash4(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let out = '';
  for (let i = 0; i < 4; i++) {
    // avalanche mix (murmur3 finaliser) so similar names give unrelated codes
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    out += ALPHABET[h % ALPHABET.length];
    h = (h + 0x9e3779b9 + i) >>> 0;
  }
  return out;
}

/** Login password: the student needs it (with their name) to start on a device. */
export const loginCode = (name: string) => hash4(`${CODE_SECRET}|login|${normaliseName(name)}`) + hash4(`${CODE_SECRET}|login2|${normaliseName(name)}`).slice(0, 2);

/**
 * Unlock stages. Code 1 opens Chapters 1–5 (holiday reading); every later code opens two more levels.
 * A code also opens every EARLIER stage, so a student on a new device only needs their latest code.
 */
export const STAGES: { label: string; levels: number[] }[] = [
  { label: 'Chapters 1–5', levels: [1, 2, 3, 4, 5] },
  { label: 'Chapters 6–7', levels: [6, 7] },
  { label: 'Chapters 8–9', levels: [8, 9] },
  { label: 'Chapters 10–11', levels: [10, 11] },
  { label: 'Chapters 12–13', levels: [12, 13] },
  { label: 'Finale + Extra Time', levels: [14, 15] },
];

/** Code the TEACHER gives a student for one stage (shown in the Teacher Panel and on the class sheet). */
export const stageCode = (name: string, stage: number) => hash4(`${CODE_SECRET}|stage|${normaliseName(name)}|${stage}`);

/** Which stage (0-based) does this code open for this student? -1 = none. */
export const stageForCode = (name: string, code: string) => STAGES.findIndex((_, i) => sameCode(code, stageCode(name, i)));

/** All levels opened by a stage, including every earlier stage. */
export const levelsUpToStage = (stage: number) => STAGES.slice(0, stage + 1).flatMap((st) => st.levels);

/** Code the APP shows a student after winning a game; they copy it into their notebook. */
export const completionCode = (name: string, levelId: number, stars: number) =>
  `L${String(levelId).padStart(2, '0')}-${stars}-${hash4(`${CODE_SECRET}|done|${normaliseName(name)}|${levelId}|${stars}`)}`;

export const sameCode = (a: string, b: string) => a.toUpperCase().replace(/[^A-Z0-9]/g, '') === b.toUpperCase().replace(/[^A-Z0-9]/g, '');
