import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { spring } from '../lib/motion';

// Story-game dialogue box: typewriter text, click to advance.
export function DialoguePanel({ lines, speaker = 'The Commentator', avatar = '🎙️', accent = '#c8ff3d' }: { lines: string[]; speaker?: string; avatar?: string; accent?: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const line = lines[i] ?? '';
  const typing = shown < line.length;

  useEffect(() => setShown(reduce ? line.length : 0), [i, line, reduce]);
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setShown((n) => Math.min(line.length, n + 2)), 18);
    return () => clearTimeout(t);
  }, [shown, typing, line.length]);

  const advance = () => {
    if (typing) setShown(line.length);
    else setI((n) => (n + 1) % lines.length);
  };

  return (
    <div className="glass flex gap-4 p-5">
      <motion.div
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
        style={{ background: `${accent}22`, boxShadow: `inset 0 0 0 1px ${accent}55` }}
        animate={typing && !reduce ? { rotate: [0, -6, 6, 0] } : { rotate: 0 }}
        transition={{ duration: 0.5, repeat: typing ? Infinity : 0 }}
      >
        {avatar}
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em]" style={{ color: accent }}>
            {speaker}
          </span>
          <span className="text-[0.65rem] tabular-nums text-chalk-mute">
            {i + 1}/{lines.length}
          </span>
        </div>
        {/* Reserve height for the full line so the box never jumps (zero CLS) */}
        <div className="relative">
          <p className="invisible text-[1.02rem] leading-relaxed" aria-hidden>
            {line}
          </p>
          <AnimatePresence mode="wait">
            <motion.p key={i} className="absolute inset-0 text-[1.02rem] leading-relaxed" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={spring.snappy} aria-live="polite">
              {line.slice(0, shown)}
              {typing && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse" style={{ background: accent }} />}
            </motion.p>
          </AnimatePresence>
        </div>
        <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }} transition={spring.snappy} onClick={advance} className="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] text-chalk-dim hover:text-chalk">
          {typing ? 'Skip ▸▸' : i === lines.length - 1 ? 'Replay ↺' : 'Next ▸'}
        </motion.button>
      </div>
    </div>
  );
}
