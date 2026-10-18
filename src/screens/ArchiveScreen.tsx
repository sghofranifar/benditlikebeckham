import { motion } from 'framer-motion';
import { useState } from 'react';
import { SOURCES } from '../data/sources';
import { useGame } from '../store';
import { spring } from '../lib/motion';
import { Reveal } from '../components/ui';
import { SourceModal } from '../components/SourceModal';

// The Archive: all cultural-background source files, as an asymmetric bento grid.
const SPAN = ['md:col-span-4', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-3', 'md:col-span-3', 'md:col-span-2', 'md:col-span-4', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2'];

export function ArchiveScreen() {
  const seen = useGame((s) => s.seenSources);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <Reveal>
        <h1 className="display t-hero">The Archive</h1>
        <p className="mt-2 max-w-2xl text-chalk-dim">
          Source files about the real world behind the novel: history, religion, football, language. Each one ends with a link back to the book and a question for your notebook. +5 XP for every file you open.
        </p>
      </Reveal>
      <div className="mt-8 grid gap-4 md:grid-cols-6">
        {SOURCES.map((src, i) => (
          <Reveal key={src.id} className={SPAN[i % SPAN.length]} delay={(i % 3) * 0.05}>
            <motion.button type="button" onClick={() => setOpen(src.id)} whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }} transition={spring.soft} className="glass flex h-full min-h-[190px] w-full flex-col p-6 text-left">
              <div className="flex items-start justify-between">
                <span className="text-4xl">{src.icon}</span>
                {seen[src.id] ? <span className="chip text-lime">opened ✓</span> : <span className="chip">new</span>}
              </div>
              <div className="mt-auto pt-6">
                <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-saffron">{src.kicker}</div>
                <h2 className="display t-h2 mt-1">{src.title}</h2>
              </div>
            </motion.button>
          </Reveal>
        ))}
      </div>
      <SourceModal id={open} onClose={() => setOpen(null)} />
    </main>
  );
}
