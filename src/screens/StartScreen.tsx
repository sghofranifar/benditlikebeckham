import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../store';
import { spring } from '../lib/motion';
import { play } from '../lib/sound';
import { SpringButton } from '../components/ui';

const WORDS = ['BEND', 'IT', 'LIKE', 'BECKHAM'];

// Animated start screen: oversized stark typography that reacts to the pointer,
// a ball bending across the screen, and a name field with spring focus.
export function StartScreen() {
  const { playerName, setName, go } = useGame();
  const [name, setLocal] = useState(playerName);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 20 });
  const sy = useSpring(my, { stiffness: 120, damping: 20 });
  const skew = useTransform(sx, [-1, 1], [-6, 6]);
  const shift = useTransform(sy, [-1, 1], [-14, 14]);

  const begin = () => {
    if (!name.trim()) return;
    setName(name.trim());
    play('whistle');
    go({ name: 'hub' });
  };

  return (
    <main
      className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden px-4 pb-8 pt-8 sm:px-8"
      onPointerMove={(e) => {
        if (reduce) return;
        mx.set((e.clientX / window.innerWidth) * 2 - 1);
        my.set((e.clientY / window.innerHeight) * 2 - 1);
      }}
    >
      {/* the bending ball */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute z-0 text-5xl sm:text-7xl"
          initial={{ left: '-10%', top: '85%', rotate: 0 }}
          animate={{ left: ['-10%', '45%', '110%'], top: ['85%', '18%', '45%'], rotate: [0, 540, 1080] }}
          transition={{ duration: 3.2, ease: 'easeInOut', delay: 1.1, repeat: Infinity, repeatDelay: 5 }}
        >
          ⚽
        </motion.div>
      )}

      <motion.div className="relative z-10 flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring.soft}>
        <span className="chip">A reading quest · Year 7</span>
        <span className="chip hidden sm:inline-flex">13 chapters · 4 weeks · 6 games</span>
      </motion.div>

      <motion.h1 className="display relative z-10 my-8 select-none" style={{ skewX: skew, y: shift }} aria-label="Bend It Like Beckham">
        {WORDS.map((w, wi) => (
          <span key={w} className="block overflow-hidden">
            <motion.span
              className={`t-mega block ${wi === 0 ? 'text-lime' : wi === 3 ? 'text-stroke' : ''}`}
              initial={{ y: '110%', rotate: 6 }}
              animate={{ y: '0%', rotate: 0 }}
              transition={{ ...spring.slam, delay: 0.1 + wi * 0.09 }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </motion.h1>

      <motion.div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: 0.6 }}>
        <p className="max-w-md text-chalk-dim">
          The story game for Narinder Dhami's novel. Read a chapter, beat the tasks in your <span className="font-hand text-xl text-chalk">notebook</span>, win the mini-game, and get the password from your teacher to unlock the next level.
        </p>
        <form
          className="glass flex w-full flex-col gap-3 p-4 sm:flex-row sm:items-center md:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            begin();
          }}
        >
          <label className="sr-only" htmlFor="player">
            Your name
          </label>
          <motion.input
            id="player"
            value={name}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="Your name, rookie"
            maxLength={24}
            autoComplete="off"
            whileFocus={{ scale: 1.03 }}
            transition={spring.snappy}
            className="w-full rounded-full border border-white/15 bg-ink-950/60 px-5 py-3 font-bold outline-none placeholder:text-chalk-mute focus:border-lime focus:shadow-glow sm:w-64"
          />
          <SpringButton type="submit" disabled={!name.trim()}>
            {playerName ? 'Continue season ▸' : 'Kick off ▸'}
          </SpringButton>
        </form>
      </motion.div>
    </main>
  );
}
