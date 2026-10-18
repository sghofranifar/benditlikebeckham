import { motion, Reorder } from 'framer-motion';
import { useMemo, useState } from 'react';
import { spring } from '../lib/motion';
import { play } from '../lib/sound';
import { shuffle, starsFromScore, type GameProps } from './shared';

// Put events in order: drag with the handle, or use ▲ ▼ (keyboard / iPad friendly).
export function Timeline({ spec, onFinish, accent }: GameProps<'timeline'>) {
  const initial = useMemo(() => {
    let s = shuffle(spec.events);
    if (s.join() === spec.events.join()) s = s.reverse();
    return s;
  }, [spec]);
  const [order, setOrder] = useState(initial);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const correct = order.filter((e, i) => spec.events[i] === e).length;

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const n = [...order];
    [n[i], n[j]] = [n[j], n[i]];
    setOrder(n);
    setChecked(false);
    play('tap');
  };

  const check = () => {
    setChecked(true);
    setAttempts((a) => a + 1);
    play(correct === order.length ? 'win' : 'bad');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-3 text-sm text-chalk-dim">Drag the cards (or use ▲ ▼) so the first event is at the top. Then check.</p>
      <Reorder.Group axis="y" values={order} onReorder={(o) => { setOrder(o); setChecked(false); }} className="space-y-2">
        {order.map((e, i) => {
          const ok = spec.events[i] === e;
          return (
            <Reorder.Item
              key={e}
              value={e}
              transition={spring.snappy}
              whileDrag={{ scale: 1.03, boxShadow: '0 20px 40px -10px rgba(0,0,0,.6)', zIndex: 5 }}
              className="flex touch-none items-center gap-3 rounded-2xl border bg-ink-800/80 px-3 py-2.5"
              style={{ borderColor: checked ? (ok ? accent : '#ff4d8d') : 'rgba(255,255,255,.12)' }}
            >
              <span className="display w-7 shrink-0 text-center text-xl" style={{ color: checked ? (ok ? accent : '#ff4d8d') : 'rgba(255,255,255,.35)' }}>
                {i + 1}
              </span>
              <span className="cursor-grab text-chalk-mute active:cursor-grabbing" aria-hidden>
                ⋮⋮
              </span>
              <span className="flex-1 text-sm font-semibold leading-snug">{e}</span>
              <span className="flex shrink-0 flex-col">
                <button type="button" onClick={() => move(i, -1)} className="px-2 text-xs text-chalk-dim hover:text-chalk" aria-label="Move up">
                  ▲
                </button>
                <button type="button" onClick={() => move(i, 1)} className="px-2 text-xs text-chalk-dim hover:text-chalk" aria-label="Move down">
                  ▼
                </button>
              </span>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <div className="mt-5 flex min-h-[3rem] flex-wrap items-center gap-3">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={spring.snappy} onClick={check} className="rounded-full px-5 py-2.5 text-sm font-extrabold uppercase text-ink-950" style={{ background: accent }}>
          Check order
        </motion.button>
        {checked && (
          <>
            <span className="font-bold">
              {correct}/{order.length} in the right place
            </span>
            {(correct === order.length || attempts >= 3) && (
              <motion.button
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={spring.bouncy}
                onClick={() => onFinish(correct === order.length ? Math.max(1, 4 - attempts) : starsFromScore(correct, order.length))}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-extrabold uppercase"
              >
                Finish ▸
              </motion.button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
