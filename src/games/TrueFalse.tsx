import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { spring } from '../lib/motion';
import { play } from '../lib/sound';
import { shuffle, starsFromScore, type GameProps } from './shared';

// Timed sprint: true or false? Streaks build a multiplier.
export function TrueFalse({ spec, onFinish, accent }: GameProps<'truefalse'>) {
  const deck = useMemo(() => shuffle(spec.statements), [spec]);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [time, setTime] = useState(spec.seconds);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<null | { ok: boolean; why: string }>(null);
  const over = started && (time <= 0 || i >= deck.length);

  useEffect(() => {
    if (!started || over) return;
    const t = setInterval(() => setTime((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [started, over]);

  const answer = (v: boolean) => {
    if (over || flash) return;
    const ok = deck[i].t === v;
    play(ok ? 'good' : 'bad');
    if (ok) {
      setCorrect((c) => c + 1);
      setStreak((s) => s + 1);
    } else setStreak(0);
    setFlash({ ok, why: deck[i].why });
    setTimeout(() => {
      setFlash(null);
      setI((n) => n + 1);
    }, ok ? 650 : 1500);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!started) return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 't') answer(true);
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'f') answer(false);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  if (!started) {
    return (
      <div className="py-6 text-center">
        <p className="mb-5 text-chalk-dim">
          {deck.length} statements · {spec.seconds} seconds. Answer as many as you can. Keys: T / F or ← / →.
        </p>
        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} transition={spring.bouncy} onClick={() => { play('whistle'); setStarted(true); }} className="display rounded-full px-10 py-4 text-3xl text-ink-950" style={{ background: accent }}>
          Kick off
        </motion.button>
      </div>
    );
  }

  if (over) {
    return (
      <div className="py-6 text-center">
        <div className="display t-h1">
          {correct}/{deck.length}
        </div>
        <p className="mb-5 text-chalk-dim">{time <= 0 ? 'Time is up!' : 'All answered!'}</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} onClick={() => onFinish(starsFromScore(correct, deck.length))} className="rounded-full px-6 py-3 text-sm font-extrabold uppercase text-ink-950" style={{ background: accent }}>
          Finish ▸
        </motion.button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full" style={{ background: time < 10 ? '#ff4d8d' : accent }} animate={{ width: `${(time / spec.seconds) * 100}%` }} transition={{ ease: 'linear', duration: 1 }} />
        </div>
        <span className="w-10 text-right text-sm font-extrabold tabular-nums">{time}s</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-extrabold" style={{ color: streak >= 3 ? accent : undefined }}>
          🔥 {streak}
        </span>
      </div>

      <div className="relative min-h-[10rem]">
        <AnimatePresence mode="popLayout">
          <motion.div key={i} className="glass grid min-h-[10rem] place-items-center p-6 text-center" initial={{ x: 80, opacity: 0, rotate: 4 }} animate={{ x: 0, opacity: 1, rotate: 0 }} exit={{ x: -80, opacity: 0, rotate: -4 }} transition={spring.snappy}>
            <p className="t-h3 font-bold leading-snug">{deck[i]?.s}</p>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {flash && (
            <motion.div className="absolute inset-0 z-10 grid place-items-center rounded-3xl p-6 text-center backdrop-blur-sm" style={{ background: flash.ok ? `${accent}26` : '#ff4d8d26' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring.snappy}>
              <div>
                <div className="display t-h1" style={{ color: flash.ok ? accent : '#ff4d8d' }}>
                  {flash.ok ? 'Correct' : 'Not quite'}
                </div>
                {!flash.ok && <p className="mt-1 text-sm">{flash.why}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.93 }} transition={spring.bouncy} onClick={() => answer(true)} className="display rounded-3xl py-5 text-3xl text-ink-950" style={{ background: accent }}>
          True
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.93 }} transition={spring.bouncy} onClick={() => answer(false)} className="display rounded-3xl bg-rose py-5 text-3xl text-ink-950">
          False
        </motion.button>
      </div>
    </div>
  );
}
