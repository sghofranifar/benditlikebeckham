import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { spring } from '../lib/motion';
import { play } from '../lib/sound';
import { starsFromScore, type GameProps } from './shared';

// Penalty / free-kick quiz: each answer is a target in the goal.
// Pick an answer (button or target letter) → the ball BENDS along a curved path. Right = GOAL, wrong = keeper saves.
const LETTERS = ['A', 'B', 'C', 'D'];
const TARGETS = [
  { x: 18, y: 26 },
  { x: 82, y: 26 },
  { x: 18, y: 72 },
  { x: 82, y: 72 },
];

export function KickQuiz({ spec, onFinish, accent }: GameProps<'kick'>) {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = spec.questions[qi];
  const right = picked !== null && picked === q.answer;
  const keeperTarget = picked === null ? null : right ? TARGETS[(picked + 1) % 4] : TARGETS[picked];

  const shoot = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setTimeout(() => {
      if (i === q.answer) {
        play('good');
        setScore((s) => s + 1);
      } else play('bad');
    }, 650);
  };

  const next = () => {
    if (qi + 1 >= spec.questions.length) {
      onFinish(starsFromScore(score, spec.questions.length));
      return;
    }
    setQi(qi + 1);
    setPicked(null);
  };

  const t = picked !== null ? TARGETS[picked] : null;
  const stateOf = (i: number) => (picked === null ? 'idle' : i === q.answer ? 'right' : i === picked ? 'wrong' : 'dim');
  const stateStyle = (st: string) => ({
    borderColor: st === 'right' ? accent : st === 'wrong' ? '#ff4d8d' : 'rgba(255,255,255,.2)',
    background: st === 'right' ? `${accent}30` : st === 'wrong' ? '#ff4d8d26' : 'rgba(7,9,15,.55)',
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.16em] text-chalk-dim">
        <span>
          Kick {qi + 1}/{spec.questions.length}
        </span>
        <span className="flex gap-1">
          {spec.questions.map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-full" style={{ background: i < qi || (i === qi && picked !== null) ? accent : 'rgba(255,255,255,.15)' }} />
          ))}
        </span>
        <span>
          Goals <span style={{ color: accent }}>{score}</span>
        </span>
      </div>

      <h3 className="t-h3 mb-4 min-h-[3.4rem] font-bold leading-snug">{q.q}</h3>

      {/* The goal */}
      <div className="relative mx-auto aspect-[16/9] w-full max-w-2xl overflow-hidden rounded-t-xl border-x-4 border-t-4 border-white/80 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,.06)_0_1px,transparent_1px_18px),repeating-linear-gradient(90deg,rgba(255,255,255,.06)_0_1px,transparent_1px_18px)]">
        {/* Target markers A–D (the answers themselves are in the grid below the goal) */}
        {TARGETS.map((tg, i) => {
          const state = stateOf(i);
          return (
            <motion.button
              key={`${qi}-t${i}`}
              type="button"
              aria-label={`Shoot at ${LETTERS[i]}: ${q.options[i]}`}
              disabled={picked !== null}
              onClick={() => shoot(i)}
              className="display absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-2xl sm:h-16 sm:w-16 sm:text-3xl"
              style={{ left: `${tg.x}%`, top: `${tg.y}%`, ...stateStyle(state), opacity: state === 'dim' ? 0.35 : 1 }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: state === 'dim' ? 0.35 : 1 }}
              whileHover={picked === null ? { scale: 1.12 } : {}}
              whileTap={{ scale: 0.92 }}
              transition={{ ...spring.bouncy, delay: picked === null ? i * 0.05 : 0 }}
            >
              {LETTERS[i]}
            </motion.button>
          );
        })}

        {/* Keeper */}
        <motion.div
          className="pointer-events-none absolute z-10 text-4xl sm:text-5xl"
          style={{ left: '50%', top: '55%', x: '-50%', y: '-50%' }}
          animate={keeperTarget ? { left: `${keeperTarget.x}%`, top: `${keeperTarget.y}%`, rotate: keeperTarget.x < 50 ? -60 : 60 } : { left: '50%', top: '55%', rotate: 0 }}
          transition={{ ...spring.snappy, delay: picked !== null ? 0.25 : 0 }}
        >
          🧤
        </motion.div>

        {/* Ball, bending on a curve */}
        <AnimatePresence>
          {t && (
            <motion.div
              key={`ball-${qi}`}
              className="pointer-events-none absolute z-20 text-3xl sm:text-4xl"
              style={{ x: '-50%', y: '-50%' }}
              initial={{ left: '50%', top: '130%', scale: 1.6, rotate: 0 }}
              animate={{
                left: ['50%', `${t.x < 50 ? 72 : 28}%`, `${t.x}%`],
                top: ['130%', '70%', `${t.y}%`],
                scale: [1.6, 1.1, 0.75],
                rotate: [0, 360, 720],
              }}
              transition={{ duration: 0.65, ease: 'easeOut', times: [0, 0.55, 1] }}
            >
              ⚽
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mx-auto h-1 max-w-2xl bg-white/30" />

      {/* Answer grid: always fully visible, wraps long answers */}
      <div className="mx-auto mt-4 grid max-w-2xl gap-2 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const state = stateOf(i);
          return (
            <motion.button
              key={`${qi}-${i}`}
              type="button"
              disabled={picked !== null}
              onClick={() => shoot(i)}
              className="flex items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm font-bold leading-snug sm:text-[0.95rem]"
              style={{ ...stateStyle(state), opacity: state === 'dim' ? 0.4 : 1 }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: state === 'dim' ? 0.4 : 1 }}
              whileHover={picked === null ? { scale: 1.02, y: -2 } : {}}
              whileTap={{ scale: 0.97 }}
              transition={{ ...spring.snappy, delay: picked === null ? i * 0.04 : 0 }}
            >
              <span className="display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-lg">{LETTERS[i]}</span>
              <span>{opt}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mx-auto mt-4 min-h-[5.5rem] max-w-2xl">
        <AnimatePresence mode="wait">
          {picked !== null && (
            <motion.div key={qi} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ ...spring.soft, delay: 0.7 }} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="display t-h2" style={{ color: right ? accent : '#ff4d8d' }}>
                  {right ? 'GOAL!' : 'SAVED!'}
                </div>
                <p className="text-sm text-chalk-dim">{q.why}</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={spring.snappy} onClick={next} className="rounded-full px-5 py-2.5 text-sm font-extrabold uppercase text-ink-950" style={{ background: accent }}>
                {qi + 1 >= spec.questions.length ? 'Full time ▸' : 'Next kick ▸'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
