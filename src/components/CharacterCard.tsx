import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Character } from '../types';
import { spring } from '../lib/motion';
import { StatBar } from './ui';

// Collectible character card: 3D tilt on hover, flips to reveal the "Big Question".
export function CharacterCard({ c, locked = false }: { c: Character; locked?: boolean }) {
  const [flip, setFlip] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  if (locked) {
    return (
      <div className="glass grid aspect-[3/4] place-items-center p-6 text-center">
        <div>
          <div className="mb-3 text-4xl opacity-40">🔒</div>
          <div className="display t-h3 text-chalk-mute">Locked card</div>
          <p className="mt-1 text-xs text-chalk-mute">Win more chapter games to unlock</p>
        </div>
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      className="relative block aspect-[3/4] w-full text-left [perspective:1200px]"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 12 });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onClick={() => setFlip((f) => !f)}
      aria-label={`${c.name}: tap to flip`}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flip ? 180 : tilt.y, rotateX: flip ? 0 : tilt.x }}
        transition={spring.soft}
      >
        {/* FRONT */}
        <div className="glass absolute inset-0 flex flex-col overflow-hidden p-5 [backface-visibility:hidden]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: c.colour }} />
          <div className="relative flex items-start justify-between">
            <div className="display text-5xl" style={{ color: c.colour }}>
              {c.initials}
            </div>
            <span className="chip" style={{ color: c.colour, borderColor: `${c.colour}55` }}>
              card
            </span>
          </div>
          <div className="relative mt-auto">
            <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em]" style={{ color: c.colour }}>
              {c.role}
            </div>
            <h3 className="display t-h2 mb-3 mt-1">{c.name}</h3>
            <div className="space-y-2">
              <StatBar label="Determination" value={c.traits.determination} color={c.colour} />
              <StatBar label="Tradition" value={c.traits.tradition} color={c.colour} />
              <StatBar label="Humour" value={c.traits.humour} color={c.colour} />
              <StatBar label="Empathy" value={c.traits.empathy} color={c.colour} />
            </div>
          </div>
        </div>
        {/* BACK */}
        <div className="glass absolute inset-0 flex flex-col p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em]" style={{ color: c.colour }}>
            Player profile
          </div>
          <p className="mt-2 text-sm leading-relaxed text-chalk/90">{c.bio}</p>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-chalk-dim">✏️ Big question · notebook</div>
            <p className="font-hand text-lg leading-snug">{c.bigQuestion}</p>
          </div>
          <p className="mt-3 text-[0.65rem] text-chalk-mute">Do you agree with the trait scores? Argue with evidence.</p>
        </div>
      </motion.div>
    </motion.button>
  );
}
