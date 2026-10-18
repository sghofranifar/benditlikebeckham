import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { spring } from '../lib/motion';
import { play } from '../lib/sound';
import { shuffle, type GameProps } from './shared';

// Tap the letter tiles in the right order to rebuild the word.
export function Scramble({ spec, onFinish, accent }: GameProps<'scramble'>) {
  const [wi, setWi] = useState(0);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const target = spec.words[wi].word;
  const tiles = useMemo(() => {
    let s = shuffle(target.split('').map((ch, i) => ({ ch, id: `${wi}-${i}` })));
    if (s.map((t) => t.ch).join('') === target) s = s.reverse();
    return s;
  }, [target, wi]);
  const [used, setUsed] = useState<string[]>([]);
  const [shake, setShake] = useState(0);
  const built = used.map((id) => tiles.find((t) => t.id === id)!.ch).join('');
  const solved = built === target;

  const tap = (id: string) => {
    if (solved || used.includes(id)) return;
    const ch = tiles.find((t) => t.id === id)!.ch;
    if (ch !== target[used.length]) {
      play('bad');
      setShake((n) => n + 1);
      setMistakes((m) => m + 1);
      return;
    }
    play('tap');
    const next = [...used, id];
    setUsed(next);
    if (next.length === target.length) play('good');
  };

  const hint = () => {
    if (solved) return;
    const need = target[used.length];
    const tile = tiles.find((t) => t.ch === need && !used.includes(t.id));
    if (tile) {
      setHints((h) => h + 1);
      tap(tile.id);
    }
  };

  const next = () => {
    if (wi + 1 >= spec.words.length) {
      const penalty = hints + mistakes;
      onFinish(penalty <= 2 ? 3 : penalty <= 7 ? 2 : 1);
      return;
    }
    setWi(wi + 1);
    setUsed([]);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex justify-between text-xs font-extrabold uppercase tracking-[0.16em] text-chalk-dim">
        <span>
          Word {wi + 1}/{spec.words.length}
        </span>
        <span>
          Hints {hints} · Slips {mistakes}
        </span>
      </div>
      <p className="mb-5 min-h-[3rem] font-hand text-2xl leading-tight">Clue: {spec.words[wi].clue}</p>

      <motion.div key={shake} animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.35 }} className="mb-6 flex min-h-[3.75rem] flex-wrap gap-1.5">
        {target.split('').map((_, i) => (
          <div key={i} className="grid h-12 w-10 place-items-center rounded-xl border-b-4 text-2xl sm:h-14 sm:w-11" style={{ borderColor: i < used.length ? accent : 'rgba(255,255,255,.15)', background: 'rgba(255,255,255,.04)' }}>
            <AnimatePresence>
              {i < used.length && (
                <motion.span className="display" initial={{ y: -30, opacity: 0, scale: 0.4 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={spring.bouncy} style={{ color: accent }}>
                  {built[i]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {tiles.map((t) => {
          const isUsed = used.includes(t.id);
          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => tap(t.id)}
              disabled={isUsed}
              className="display grid h-14 w-12 place-items-center rounded-2xl border border-white/15 bg-white/[0.07] text-2xl disabled:opacity-0"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: isUsed ? 0.6 : 1, rotate: 0 }}
              whileHover={{ y: -4, scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              transition={spring.bouncy}
            >
              {t.ch}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex min-h-[3rem] items-center gap-3">
        {!solved ? (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={spring.snappy} onClick={hint} className="rounded-full border border-white/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-chalk-dim">
            💡 Hint
          </motion.button>
        ) : (
          <motion.button initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={spring.bouncy} onClick={next} className="rounded-full px-5 py-2.5 text-sm font-extrabold uppercase text-ink-950" style={{ background: accent }}>
            {wi + 1 >= spec.words.length ? 'Finish ▸' : 'Next word ▸'}
          </motion.button>
        )}
      </div>
    </div>
  );
}
