import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../store';
import { levelById, LEVELS } from '../data/levels';
import { characterById } from '../data/characters';
import { accentHex, spring } from '../lib/motion';
import { play } from '../lib/sound';
import { SpringButton, Stars } from '../components/ui';
import { MemoryMatch } from '../games/MemoryMatch';
import { KickQuiz } from '../games/KickQuiz';
import { Scramble } from '../games/Scramble';
import { SortBins } from '../games/SortBins';
import { Timeline } from '../games/Timeline';
import { TrueFalse } from '../games/TrueFalse';

const KIND_LABEL = { memory: 'Memory Match', kick: 'Penalty Shoot-out', scramble: 'Word Scramble', sort: 'Sorting Game', timeline: 'Timeline', truefalse: 'True / False Sprint' } as const;

export function GameScreen({ id }: { id: number }) {
  const s = useGame();
  const level = levelById(id);
  const c = accentHex[level.accent];
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const g = level.game;

  const finish = (stars: number) => {
    setResult(stars);
    if (stars > 0) {
      play('win');
      s.winGame(id, stars);
    } else play('bad');
  };

  const nextLevel = LEVELS.find((l) => l.id === id + 1);
  const gameProps = { onFinish: finish, accent: c };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
      <motion.button whileHover={{ x: -4 }} transition={spring.snappy} onClick={() => s.go({ name: 'level', id })} className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-chalk-dim hover:text-chalk">
        ◂ Back to {level.chapter}
      </motion.button>
      <div className="mb-6">
        <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.25em]" style={{ color: c }}>
          🎮 {KIND_LABEL[g.kind]} · Level {id}
        </div>
        <h1 className="display t-h1 mt-1">{g.title}</h1>
      </div>

      <section className="glass p-5 sm:p-8">
        <div key={round}>
          {g.kind === 'memory' && <MemoryMatch spec={g} {...gameProps} />}
          {g.kind === 'kick' && <KickQuiz spec={g} {...gameProps} />}
          {g.kind === 'scramble' && <Scramble spec={g} {...gameProps} />}
          {g.kind === 'sort' && <SortBins spec={g} {...gameProps} />}
          {g.kind === 'timeline' && <Timeline spec={g} {...gameProps} />}
          {g.kind === 'truefalse' && <TrueFalse spec={g} {...gameProps} />}
        </div>
      </section>

      <AnimatePresence>
        {result !== null && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/85 p-4 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass w-full max-w-lg overflow-hidden p-8 text-center" initial={{ scale: 0.7, y: 40 }} animate={{ scale: 1, y: 0 }} transition={spring.bouncy}>
              {result > 0 && <Confetti colour={c} />}
              <div className="display text-[clamp(3.5rem,12vw,6rem)] leading-none" style={{ color: result > 0 ? c : '#ff4d8d' }}>
                {result === 3 ? 'WORLD CLASS' : result === 2 ? 'GREAT GAME' : result === 1 ? 'YOU WON' : 'NOT YET'}
              </div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.bouncy, delay: 0.25 }} className="mt-3">
                <Stars n={result} size="text-5xl" />
              </motion.div>
              {result > 0 ? (
                <>
                  <p className="mt-3 text-chalk-dim">+{result * 25} XP</p>
                  {level.unlocksCards.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                      🃏 New squad card{level.unlocksCards.length > 1 ? 's' : ''}: <b>{level.unlocksCards.map((k) => characterById(k).name).join(', ')}</b>
                    </div>
                  )}
                  <p className="mt-4 text-sm text-chalk-dim">
                    {nextLevel ? `Finish your notebook tasks, then ask your teacher for the ${nextLevel.chapter} password.` : 'Season complete! Open your Season Report.'}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-chalk-dim">You need at least 60% to win. Have another go!</p>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <SpringButton
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setRound((r) => r + 1);
                  }}
                >
                  ↺ Play again
                </SpringButton>
                <SpringButton accent={c} onClick={() => s.go(id === 14 && result > 0 ? { name: 'summary' } : { name: 'level', id })}>
                  {id === 14 && result > 0 ? 'Season report ▸' : 'Back to tasks ▸'}
                </SpringButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Confetti({ colour }: { colour: string }) {
  const bits = Array.from({ length: 28 }, (_, i) => i);
  const cols = [colour, '#ffb020', '#ff4d8d', '#5cc8ff', '#eef1f7'];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((i) => (
        <motion.span
          key={i}
          className="absolute h-2.5 w-1.5 rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, top: '-5%', background: cols[i % cols.length] }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{ y: 520 + (i % 5) * 40, rotate: 360 + i * 40, x: ((i % 7) - 3) * 18, opacity: [1, 1, 0] }}
          transition={{ duration: 1.8 + (i % 4) * 0.3, ease: 'easeOut', delay: (i % 6) * 0.05 }}
        />
      ))}
    </div>
  );
}
