import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { spring } from '../lib/motion';
import { play } from '../lib/sound';
import { shuffle, type GameProps } from './shared';

type Card = { key: string; pair: number; text: string; isWord: boolean };

export function MemoryMatch({ spec, onFinish, accent }: GameProps<'memory'>) {
  const cards = useMemo<Card[]>(
    () => shuffle(spec.pairs.flatMap(([w, d], i) => [
      { key: `w${i}`, pair: i, text: w, isWord: true },
      { key: `d${i}`, pair: i, text: d, isWord: false },
    ])),
    [spec],
  );
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const click = (c: Card) => {
    if (open.length === 2 || open.includes(c.key) || matched.includes(c.pair)) return;
    const next = [...open, c.key];
    setOpen(next);
    play('tap');
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((k) => cards.find((x) => x.key === k)!);
      if (a.pair === b.pair) {
        setTimeout(() => {
          play('good');
          const m = [...matched, a.pair];
          setMatched(m);
          setOpen([]);
          if (m.length === spec.pairs.length) {
            const perfect = spec.pairs.length;
            const total = moves + 1;
            onFinish(total <= perfect + 3 ? 3 : total <= perfect + 8 ? 2 : 1);
          }
        }, 380);
      } else {
        setTimeout(() => {
          play('bad');
          setOpen([]);
        }, 900);
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between text-xs font-extrabold uppercase tracking-[0.16em] text-chalk-dim">
        <span>
          Pairs {matched.length}/{spec.pairs.length}
        </span>
        <span>Moves {moves}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {cards.map((c) => {
          const up = open.includes(c.key) || matched.includes(c.pair);
          const done = matched.includes(c.pair);
          return (
            <motion.button
              key={c.key}
              type="button"
              onClick={() => click(c)}
              className="relative aspect-[16/10] [perspective:900px]"
              whileHover={!up ? { y: -3, scale: 1.03 } : {}}
              whileTap={{ scale: 0.96 }}
              transition={spring.snappy}
              aria-label={up ? c.text : 'Hidden card'}
            >
              <motion.div className="relative h-full w-full [transform-style:preserve-3d]" animate={{ rotateY: up ? 180 : 0 }} transition={spring.soft}>
                <div className="absolute inset-0 grid place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-ink-700 to-ink-800 [backface-visibility:hidden]">
                  <span className="display text-3xl text-white/20">?</span>
                </div>
                <div
                  className="absolute inset-0 grid place-items-center rounded-2xl border p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  style={{ borderColor: done ? accent : 'rgba(255,255,255,.15)', background: done ? `${accent}22` : 'rgba(255,255,255,.06)' }}
                >
                  <span className={c.isWord ? 'display text-xl sm:text-2xl' : 'text-[0.78rem] leading-snug sm:text-sm'} style={c.isWord ? { color: accent } : undefined}>
                    {c.text}
                  </span>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
