import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

// Parallax depth: three layers move at different speeds as the page scrolls.
// Layer 1 (slowest): floodlight glows. Layer 2: pitch lines. Foreground content scrolls normally.
export function Backdrop({ accent = '#c8ff3d' }: { accent?: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 80, damping: 20, mass: 0.4 });
  const yGlow = useTransform(smooth, (v) => (reduce ? 0 : v * -0.08));
  const yLines = useTransform(smooth, (v) => (reduce ? 0 : v * -0.22));
  const rot = useTransform(smooth, (v) => (reduce ? 0 : v * 0.01));

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950">
      <motion.div style={{ y: yGlow }} className="absolute inset-0">
        <div className="absolute -left-[20vw] -top-[25vh] h-[70vh] w-[70vw] rounded-full opacity-[0.16] blur-[120px]" style={{ background: accent }} />
        <div className="absolute -right-[15vw] top-[40vh] h-[60vh] w-[55vw] rounded-full bg-violet opacity-[0.10] blur-[130px]" />
        <div className="absolute bottom-[-30vh] left-[20vw] h-[60vh] w-[60vw] rounded-full bg-sky opacity-[0.07] blur-[140px]" />
      </motion.div>
      <motion.svg style={{ y: yLines, rotate: rot }} className="absolute left-1/2 top-[8vh] h-[160vh] w-[160vh] -translate-x-1/2 opacity-[0.07]" viewBox="0 0 680 1050" fill="none" stroke="#fff" strokeWidth="2">
        <rect x="20" y="20" width="640" height="1010" rx="4" />
        <line x1="20" y1="525" x2="660" y2="525" />
        <circle cx="340" cy="525" r="92" />
        <circle cx="340" cy="525" r="4" fill="#fff" />
        <rect x="158" y="20" width="364" height="165" />
        <rect x="248" y="20" width="184" height="58" />
        <path d="M262 185 A 92 92 0 0 0 418 185" />
        <rect x="158" y="865" width="364" height="165" />
        <rect x="248" y="972" width="184" height="58" />
        <path d="M262 865 A 92 92 0 0 1 418 865" />
      </motion.svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#07090f_95%)]" />
    </div>
  );
}

export function Grain() {
  return <div aria-hidden className="grain" />;
}
