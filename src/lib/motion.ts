import type { Transition } from 'framer-motion';

// Shared spring presets: every interaction in the app uses physics, never linear easing.
export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 30, mass: 0.8 } as Transition,
  soft: { type: 'spring', stiffness: 220, damping: 26 } as Transition,
  bouncy: { type: 'spring', stiffness: 380, damping: 14 } as Transition,
  slam: { type: 'spring', stiffness: 700, damping: 18, mass: 1.2 } as Transition,
};

export const accentHex: Record<string, string> = {
  lime: '#c8ff3d',
  saffron: '#ffb020',
  rose: '#ff4d8d',
  sky: '#5cc8ff',
  violet: '#a78bfa',
};
