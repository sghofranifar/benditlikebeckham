import { useGame } from '../store';

// Tiny Web Audio synth: no audio files, works offline.
let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = ctx.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export type Sfx = 'tap' | 'good' | 'bad' | 'win' | 'whistle' | 'unlock';

export function play(s: Sfx) {
  if (!useGame.getState().sound) return;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    return;
  }
  switch (s) {
    case 'tap':
      tone(660, 0, 0.06, 'triangle', 0.05);
      break;
    case 'good':
      tone(659, 0, 0.12, 'triangle');
      tone(988, 0.08, 0.2, 'triangle');
      break;
    case 'bad':
      tone(220, 0, 0.18, 'sawtooth', 0.05);
      tone(180, 0.1, 0.22, 'sawtooth', 0.05);
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.4, 'triangle'));
      break;
    case 'whistle':
      tone(2100, 0, 0.12, 'sine', 0.07);
      tone(2300, 0.14, 0.35, 'sine', 0.07);
      break;
    case 'unlock':
      [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.35, 'sine', 0.1));
      break;
  }
}
