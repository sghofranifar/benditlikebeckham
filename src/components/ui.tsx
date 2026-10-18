import { motion, useInView, type HTMLMotionProps } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { spring } from '../lib/motion';
import { play } from '../lib/sound';

// ── Spring button: every hover / press is physical ──────────────
type BtnProps = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'ghost' | 'outline';
  accent?: string;
  sfx?: boolean;
};

export function SpringButton({ variant = 'primary', accent = '#c8ff3d', className = '', sfx = true, onClick, children, style, ...rest }: BtnProps) {
  const base = 'relative inline-flex select-none items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-40';
  const look =
    variant === 'primary'
      ? 'text-ink-950'
      : variant === 'outline'
        ? 'border border-white/15 bg-white/5 text-chalk hover:bg-white/10'
        : 'text-chalk-dim hover:text-chalk';
  return (
    <motion.button
      whileHover={{ scale: 1.045, y: -1 }}
      whileTap={{ scale: 0.94, y: 1 }}
      transition={spring.snappy}
      className={`${base} ${look} ${className}`}
      style={variant === 'primary' ? { background: accent, boxShadow: `0 10px 30px -10px ${accent}aa`, ...style } : style}
      onClick={(e) => {
        if (sfx) play('tap');
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

// ── Scroll-triggered reveal: fade in + slide up as it enters the viewport ──
export function Reveal({ children, delay = 0, className = '', as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' | 'li' | 'article' }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const M = motion[as] as typeof motion.div;
  return (
    <M
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...spring.soft, delay }}
    >
      {children}
    </M>
  );
}

// ── Stat bar with spring fill ──────────────────────────────────
export function StatBar({ label, value, color, icon }: { label: string; value: number; color: string; icon?: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[0.72rem] font-bold uppercase tracking-[0.14em] text-chalk-dim">
        <span>
          {icon && <span className="mr-1.5">{icon}</span>}
          {label}
        </span>
        <span className="tabular-nums text-chalk">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})`, boxShadow: `0 0 16px ${color}66` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </div>
    </div>
  );
}

// ── Toggle with spring knob (used for "done in my notebook") ──
export function SpringToggle({ on, onChange, label, accent = '#c8ff3d' }: { on: boolean; onChange: () => void; label: string; accent?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => {
        play(on ? 'tap' : 'good');
        onChange();
      }}
      className="group inline-flex items-center gap-3 rounded-full py-1 pr-2 text-left text-sm font-bold"
    >
      <span className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-white/15 p-0.5 transition-colors" style={{ background: on ? accent : 'rgba(255,255,255,0.06)' }}>
        <motion.span layout transition={spring.bouncy} className="h-5 w-5 rounded-full bg-white shadow" style={{ marginLeft: on ? 'auto' : 0 }} />
      </span>
      <span className={on ? 'text-chalk' : 'text-chalk-dim group-hover:text-chalk'}>{label}</span>
    </button>
  );
}

export function Chip({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="chip" style={color ? { color, borderColor: `${color}55`, background: `${color}14` } : undefined}>
      {children}
    </span>
  );
}

export function Stars({ n, size = 'text-lg' }: { n: number; size?: string }) {
  return (
    <span className={`${size} tracking-tight`} aria-label={`${n} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= n ? 'text-saffron' : 'text-white/15'}>
          ★
        </span>
      ))}
    </span>
  );
}
