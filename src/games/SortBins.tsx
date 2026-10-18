import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { spring } from '../lib/motion';
import { play } from '../lib/sound';
import { shuffle, starsFromScore, type GameProps } from './shared';

// Tap a card, then tap a bin (works on iPads, no fiddly dragging).
export function SortBins({ spec, onFinish, accent }: GameProps<'sort'>) {
  const items = useMemo(() => shuffle(spec.items.map((it, i) => ({ ...it, id: i }))), [spec]);
  const [placed, setPlaced] = useState<Record<number, number>>({});
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const left = items.filter((it) => placed[it.id] === undefined);
  const correct = items.filter((it) => placed[it.id] === it.bin).length;

  const drop = (bin: number) => {
    if (sel === null || checked) return;
    play('tap');
    setPlaced({ ...placed, [sel]: bin });
    setSel(null);
  };

  const check = () => {
    setChecked(true);
    play(correct === items.length ? 'win' : correct / items.length >= 0.6 ? 'good' : 'bad');
  };

  const retry = () => {
    // keep the right ones, return the wrong ones to the pile
    const keep: Record<number, number> = {};
    items.forEach((it) => {
      if (placed[it.id] === it.bin) keep[it.id] = it.bin;
    });
    setPlaced(keep);
    setChecked(false);
  };

  return (
    <LayoutGroup>
      <p className="mb-3 text-sm text-chalk-dim">Tap a card, then tap the box it belongs in. Tap a placed card to take it back.</p>
      <div className="mb-5 flex min-h-[3.5rem] flex-wrap gap-2">
        <AnimatePresence>
          {left.map((it) => (
            <motion.button
              layout
              layoutId={`it-${it.id}`}
              key={it.id}
              type="button"
              onClick={() => setSel(sel === it.id ? null : it.id)}
              className="rounded-2xl border px-3 py-2 text-left text-sm font-semibold"
              style={{ borderColor: sel === it.id ? accent : 'rgba(255,255,255,.15)', background: sel === it.id ? `${accent}22` : 'rgba(255,255,255,.05)' }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              animate={{ scale: sel === it.id ? 1.05 : 1 }}
              transition={spring.snappy}
            >
              {it.text}
            </motion.button>
          ))}
        </AnimatePresence>
        {left.length === 0 && !checked && <span className="self-center text-sm text-chalk-mute">All sorted! Check your answers ↓</span>}
      </div>

      <div className={`grid gap-3 ${spec.bins.length === 2 ? 'sm:grid-cols-2' : spec.bins.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {spec.bins.map((b, bi) => (
          <motion.div
            key={b}
            role="button"
            tabIndex={0}
            onClick={() => drop(bi)}
            onKeyDown={(e) => e.key === 'Enter' && drop(bi)}
            className="min-h-[9rem] cursor-pointer rounded-3xl border-2 border-dashed p-3"
            style={{ borderColor: sel !== null ? accent : 'rgba(255,255,255,.12)' }}
            animate={{ scale: sel !== null ? 1.01 : 1 }}
            whileHover={sel !== null ? { scale: 1.03 } : {}}
            transition={spring.soft}
          >
            <div className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.16em]" style={{ color: accent }}>
              {b}
            </div>
            <div className="flex flex-col gap-1.5">
              {items
                .filter((it) => placed[it.id] === bi)
                .map((it) => {
                  const ok = it.bin === bi;
                  return (
                    <motion.button
                      layout
                      layoutId={`it-${it.id}`}
                      key={it.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (checked) return;
                        const p = { ...placed };
                        delete p[it.id];
                        setPlaced(p);
                      }}
                      className="rounded-xl border px-2.5 py-1.5 text-left text-[0.8rem]"
                      style={{
                        borderColor: checked ? (ok ? accent : '#ff4d8d') : 'rgba(255,255,255,.12)',
                        background: checked ? (ok ? `${accent}1f` : '#ff4d8d1f') : 'rgba(255,255,255,.04)',
                      }}
                      transition={spring.snappy}
                    >
                      {checked && (ok ? '✓ ' : '✗ ')}
                      {it.text}
                    </motion.button>
                  );
                })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 flex min-h-[3rem] flex-wrap items-center gap-3">
        {!checked ? (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={spring.snappy} disabled={left.length > 0} onClick={check} className="rounded-full px-5 py-2.5 text-sm font-extrabold uppercase text-ink-950 disabled:opacity-30" style={{ background: accent }}>
            Check answers
          </motion.button>
        ) : (
          <>
            <span className="font-bold">
              {correct}/{items.length} correct
            </span>
            {correct < items.length && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} onClick={retry} className="rounded-full border border-white/15 px-4 py-2 text-xs font-extrabold uppercase">
                Fix mistakes
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} onClick={() => onFinish(starsFromScore(correct, items.length))} className="rounded-full px-5 py-2.5 text-sm font-extrabold uppercase text-ink-950" style={{ background: accent }}>
              Finish ▸
            </motion.button>
          </>
        )}
      </div>
    </LayoutGroup>
  );
}
