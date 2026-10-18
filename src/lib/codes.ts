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
    out += ALPHABET[h % ALPHABET.length];
    h = Math.floor(h / ALPHABET.length) ^ Math.imul(h, 31);
    h >>>= 0;
  }
  return out;
}

/** Code the TEACHER gives a student to unlock a level (shown in the Teacher Panel). */
export const unlockCode = (name: string, levelId: number) => hash4(`${CODE_SECRET}|unlock|${normaliseName(name)}|${levelId}`);

/** Code the APP shows a student after winning a game; they copy it into their notebook. */
export const completionCode = (name: string, levelId: number, stars: number) =>
  `L${String(levelId).padStart(2, '0')}-${stars}-${hash4(`${CODE_SECRET}|done|${normaliseName(name)}|${levelId}|${stars}`)}`;

export const sameCode = (a: string, b: string) => a.toUpperCase().replace(/[^A-Z0-9]/g, '') === b.toUpperCase().replace(/[^A-Z0-9]/g, '');
