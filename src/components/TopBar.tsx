import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../store';
import { rankFor, totalXP } from '../lib/progress';
import { spring } from '../lib/motion';
import { play } from '../lib/sound';
import { TeacherPanel } from './TeacherPanel';
import { Modal } from './Modal';

// Sticky top bar: logo/home, XP + rank progress tracker, sound, call teacher, teacher panel.
export function TopBar() {
  const s = useGame();
  const xp = totalXP(s);
  const rank = rankFor(xp);
  const [teacher, setTeacher] = useState(false);
  const [called, setCalled] = useState(false);

  return (
    <>
      <header className="no-print sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6" aria-label="Main">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} transition={spring.snappy} onClick={() => s.go({ name: 'room' })} className="display flex items-baseline gap-1 text-xl sm:text-2xl" aria-label="Back to Jess's room">
            <span className="text-lime">BEND</span>
            <span>IT</span>
            <span className="ml-1 hidden font-body text-[0.6rem] font-extrabold tracking-[0.25em] text-chalk-mute sm:inline">QUEST</span>
          </motion.button>

          <div className="ml-2 hidden gap-1 md:flex">
            {(
              [
                ['room', 'Room'],
                ['hub', 'Season'],
                ['squad', 'Squad'],
                ['archive', 'Archive'],
                ['summary', 'Report'],
              ] as const
            ).map(([name, label]) => (
              <motion.button
                key={name}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.94 }}
                transition={spring.snappy}
                onClick={() => s.go({ name } as never)}
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] ${s.screen.name === name ? 'bg-white/10 text-chalk' : 'text-chalk-dim hover:text-chalk'}`}
              >
                {label}
              </motion.button>
            ))}
          </div>

          {/* Progress tracker: XP + rank */}
          <div className="ml-auto flex min-w-0 items-center gap-3">
            <div className="hidden min-w-[150px] sm:block">
              <div className="flex justify-between text-[0.62rem] font-extrabold uppercase tracking-[0.16em]">
                <span className="text-lime">{rank.name}</span>
                <span className="led text-base leading-none">{String(xp).padStart(4, '0')} XP</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-lime" animate={{ width: `${Math.round(rank.toNext * 100)}%` }} transition={spring.soft} />
              </div>
            </div>
            <span className="led rounded-md bg-black/70 px-2 py-0.5 text-lg leading-none sm:hidden">{String(xp).padStart(4, '0')}</span>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring.snappy} onClick={s.toggleSound} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-sm" aria-label={s.sound ? 'Mute sound' : 'Turn sound on'}>
              {s.sound ? '🔊' : '🔇'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              animate={called ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
              transition={spring.snappy}
              onClick={() => {
                play('unlock');
                setCalled(true);
              }}
              className="flex h-9 items-center gap-1.5 rounded-full bg-rose px-3 text-xs font-extrabold uppercase tracking-[0.1em] text-ink-950"
            >
              🔔 <span className="hidden sm:inline">Call teacher</span>
            </motion.button>
            <motion.button whileHover={{ rotate: 25 }} whileTap={{ scale: 0.9 }} transition={spring.snappy} onClick={() => setTeacher(true)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-sm" aria-label="Teacher panel">
              🔑
            </motion.button>
          </div>
        </nav>
        {/* Mobile nav */}
        <div className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {(
            [
              ['room', 'Room'],
              ['hub', 'Season'],
              ['squad', 'Squad'],
              ['archive', 'Archive'],
              ['summary', 'Report'],
            ] as const
          ).map(([name, label]) => (
            <button key={name} onClick={() => s.go({ name } as never)} className={`shrink-0 rounded-full px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] ${s.screen.name === name ? 'bg-white/10 text-chalk' : 'text-chalk-dim'}`}>
              {label}
            </button>
          ))}
        </div>
      </header>

      <Modal open={called} onClose={() => setCalled(false)} label="Teacher called">
        <div className="py-4 text-center">
          <motion.div className="text-6xl" animate={{ rotate: [0, 18, -18, 12, -12, 0] }} transition={{ duration: 0.9 }}>
            🔔
          </motion.div>
          <h2 className="display t-h1 mt-3">Teacher called!</h2>
          <p className="mt-2 text-chalk-dim">Raise your hand too. While you wait, re-read the task and write down exactly what you are stuck on.</p>
          <button onClick={() => setCalled(false)} className="mt-6 rounded-full bg-lime px-6 py-2.5 text-sm font-extrabold uppercase text-ink-950">
            OK
          </button>
        </div>
      </Modal>
      <TeacherPanel open={teacher} onClose={() => setTeacher(false)} />
    </>
  );
}
