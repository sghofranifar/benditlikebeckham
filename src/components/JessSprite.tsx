import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Original illustrated Jess (not based on any real person or actor):
// idle breathing, swinging ponytail, random blinks, mouth moves while she talks, waves on greeting.
export function JessSprite({ talking, waving }: { talking: boolean; waving: boolean }) {
  const reduce = useReducedMotion();
  const [blink, setBlink] = useState(false);
  const [mouth, setMouth] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        loop();
      }, 2200 + Math.random() * 2800);
    };
    loop();
    return () => clearTimeout(t);
  }, [reduce]);

  useEffect(() => {
    if (!talking) {
      setMouth(false);
      return;
    }
    const t = setInterval(() => setMouth((m) => !m), 130);
    return () => clearInterval(t);
  }, [talking]);

  return (
    <motion.svg
      viewBox="0 0 200 430"
      className="h-full w-auto drop-shadow-[0_30px_40px_rgba(0,0,0,.6)]"
      role="img"
      aria-label="Jess, an illustrated girl in a red number 7 football shirt"
      animate={reduce ? {} : { y: [0, -3, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx="100" cy="420" rx="62" ry="8" fill="#000" opacity=".45" />

      {/* ponytail (behind head) */}
      <motion.path
        d="M128 62 C160 70 166 120 150 160 C146 130 140 100 124 84 Z"
        fill="#1a110d"
        style={{ originX: '128px', originY: '62px' }}
        animate={reduce ? {} : { rotate: [-4, 6, -4] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* legs: navy trackies with a single white stripe */}
      <path d="M68 250 L64 398 L94 398 L98 262 Z" fill="#1c2340" />
      <path d="M132 250 L136 398 L106 398 L102 262 Z" fill="#1c2340" />
      <path d="M70 256 L67 396" stroke="#eef1f7" strokeWidth="3" />
      <path d="M130 256 L133 396" stroke="#eef1f7" strokeWidth="3" />
      {/* trainers */}
      <path d="M58 398 h40 a6 6 0 0 1 6 6 v6 h-50 v-5 a7 7 0 0 1 4 -7 Z" fill="#f4f4f4" />
      <path d="M102 398 h40 a7 7 0 0 1 4 7 v5 h-50 v-6 a6 6 0 0 1 6 -6 Z" fill="#f4f4f4" />
      <rect x="54" y="408" width="50" height="4" fill="#c8ff3d" />
      <rect x="96" y="408" width="50" height="4" fill="#c8ff3d" />

      {/* left arm (resting) */}
      <path d="M58 150 C44 180 40 215 46 250" stroke="#9a6644" strokeWidth="15" strokeLinecap="round" fill="none" />
      <path d="M60 140 C50 150 46 165 44 178 L58 182 C60 170 64 160 70 152 Z" fill="#d62839" />

      {/* right arm: waves */}
      <motion.g style={{ originX: '140px', originY: '146px' }} animate={waving && !reduce ? { rotate: [0, -150, -125, -150, -125, 0] } : { rotate: 0 }} transition={{ duration: 1.8, ease: 'easeInOut' }}>
        <path d="M142 150 C156 180 160 215 154 250" stroke="#9a6644" strokeWidth="15" strokeLinecap="round" fill="none" />
        <circle cx="154" cy="254" r="9" fill="#9a6644" />
        <path d="M140 140 C150 150 154 165 156 178 L142 182 C140 170 136 160 130 152 Z" fill="#d62839" />
      </motion.g>

      {/* torso: red No. 7 shirt */}
      <path d="M62 140 Q100 124 138 140 L140 258 Q100 268 60 258 Z" fill="#d62839" />
      <path d="M86 132 L100 150 L114 132" stroke="#fff" strokeWidth="5" fill="none" strokeLinejoin="round" />
      <path d="M62 236 Q100 246 140 236" stroke="#a91d2c" strokeWidth="4" fill="none" />
      <text x="100" y="208" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="46" fill="#fff">
        7
      </text>
      {/* left hand */}
      <circle cx="46" cy="254" r="9" fill="#9a6644" />

      {/* neck + head */}
      <rect x="90" y="108" width="20" height="26" rx="8" fill="#8a5a3c" />
      <ellipse cx="100" cy="76" rx="40" ry="46" fill="#9a6644" />
      <ellipse cx="60" cy="80" rx="6" ry="9" fill="#8a5a3c" />
      <ellipse cx="140" cy="80" rx="6" ry="9" fill="#8a5a3c" />

      {/* hair */}
      <path d="M58 76 C54 36 80 22 104 24 C132 26 148 46 142 78 C134 56 118 46 98 46 C84 58 70 62 58 76 Z" fill="#1a110d" />
      <path d="M128 40 l14 -6 l-6 12 Z" fill="#d62839" />

      {/* eyebrows */}
      <path d="M76 64 q9 -6 18 -1" stroke="#1a110d" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M106 63 q9 -5 18 1" stroke="#1a110d" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* eyes (blink by squashing) */}
      <g style={{ transform: `scaleY(${blink ? 0.1 : 1})`, transformOrigin: '100px 78px', transition: 'transform 80ms' }}>
        <ellipse cx="85" cy="78" rx="7" ry="8" fill="#fff" />
        <ellipse cx="115" cy="78" rx="7" ry="8" fill="#fff" />
        <circle cx="86" cy="79" r="4.5" fill="#2a1a12" />
        <circle cx="116" cy="79" r="4.5" fill="#2a1a12" />
        <circle cx="87.5" cy="77" r="1.5" fill="#fff" />
        <circle cx="117.5" cy="77" r="1.5" fill="#fff" />
      </g>

      {/* nose + mouth */}
      <path d="M100 84 q-3 10 3 12" stroke="#7a4a30" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {mouth ? <ellipse cx="100" cy="104" rx="8" ry="6" fill="#5a1f1a" /> : <path d="M88 101 Q100 112 112 101" stroke="#5a1f1a" strokeWidth="3.5" fill="none" strokeLinecap="round" />}
    </motion.svg>
  );
}
