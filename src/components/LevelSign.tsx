import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { Level } from '../types';
import { accentHex, spring } from '../lib/motion';
import { play } from '../lib/sound';

// Dramatic full-screen level sign: the number SLAMS in, the title wipes across.
export function LevelSign({ level, show, onDone }: { level: Level; show: boolean; onDone: () => void }) {
  const c = accentHex[level.accent];
  useEffect(() => {
    if (!show) return;
    play('whistle');
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Skip intro"
          onClick={onDone}
          className="fixed inset-0 z-[70] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-ink-950/95 px-4 text-center backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        >
          <motion.div
            className="absolute inset-x-0 top-1/2 h-[38vh] -translate-y-1/2"
            style={{ background: `linear-gradient(90deg, transparent, ${c}22, transparent)` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ ...spring.soft, delay: 0.1 }}
          />
          <motion.div className="relative text-[0.75rem] font-extrabold uppercase tracking-[0.45em]" style={{ color: c }} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring.soft, delay: 0.05 }}>
            {level.id === 14 ? 'Finale' : `Level ${String(level.id).padStart(2, '0')} · ${level.chapter}`}
          </motion.div>
          <motion.div
            className="display relative my-2 text-[clamp(7rem,30vw,22rem)]"
            style={{ color: c, textShadow: `0 0 60px ${c}66` }}
            initial={{ scale: 3.2, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: -3 }}
            transition={{ ...spring.slam, delay: 0.15 }}
          >
            {level.id === 14 ? 'FT' : String(level.id).padStart(2, '0')}
          </motion.div>
          <motion.h2
            className="display t-hero relative"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.55, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {level.title}
          </motion.h2>
          <motion.p className="relative mt-4 max-w-xl text-chalk-dim" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.9 }}>
            {level.tagline}
          </motion.p>
          <motion.span className="relative mt-10 text-[0.65rem] uppercase tracking-[0.3em] text-chalk-mute" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
            tap to skip
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
