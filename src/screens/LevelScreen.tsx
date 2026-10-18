import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useGame } from '../store';
import { levelById } from '../data/levels';
import { coreDone, coreTaskIds, levelProgress } from '../lib/progress';
import { accentHex, spring } from '../lib/motion';
import { LevelSign } from '../components/LevelSign';
import { DialoguePanel } from '../components/DialoguePanel';
import { SourceModal } from '../components/SourceModal';
import { Chip, Reveal, SpringButton, SpringToggle, Stars, StatBar } from '../components/ui';
import type { Task } from '../types';

const PHASES = [
  { key: 'pre', label: 'Warm-Up', sub: 'Before reading', icon: '🔥' },
  { key: 'vocab', label: 'Vocab Drill', sub: 'Copy into notebook', icon: '📒' },
  { key: 'whilst', label: 'Match Play', sub: 'While reading', icon: '⚽' },
  { key: 'post', label: 'Cool-Down', sub: 'After reading', icon: '🧊' },
  { key: 'sprinter', label: 'Sprinter', sub: 'Challenge', icon: '⚡' },
] as const;
type PhaseKey = (typeof PHASES)[number]['key'];

const FOCUS_COLOUR: Record<string, string> = {
  Prediction: '#a78bfa',
  Comprehension: '#5cc8ff',
  Language: '#c8ff3d',
  Theme: '#ffb020',
  Culture: '#ff7a59',
  Creative: '#ff4d8d',
  Discussion: '#34d399',
};

export function LevelScreen({ id }: { id: number }) {
  const s = useGame();
  const level = levelById(id);
  const c = accentHex[level.accent];
  const [phase, setPhase] = useState<PhaseKey>('pre');
  const [src, setSrc] = useState<string | null>(null);
  const [sign, setSign] = useState(!s.seenSigns[id]);
  const done = useCallback(() => {
    setSign(false);
    s.seeSign(id);
  }, [id, s]);
  const prog = levelProgress(level, s);
  const need = coreTaskIds(level).length;
  const have = coreDone(level, s);
  const gameOpen = have >= need || s.teacherMode || (s.gameStars[id] ?? 0) > 0;
  const num = level.id === 14 ? 'FT' : level.id === 15 ? 'XT' : String(level.id).padStart(2, '0');

  const tasks: Task[] = phase === 'pre' ? level.pre : phase === 'whilst' ? level.whilst : phase === 'post' ? level.post : phase === 'sprinter' ? [level.sprinter] : [];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 sm:px-6">
      <LevelSign level={level} show={sign} onDone={done} />

      {/* Header */}
      <section className="pt-8 sm:pt-12">
        <motion.button whileHover={{ x: -4 }} transition={spring.snappy} onClick={() => s.go({ name: 'hub' })} className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-chalk-dim hover:text-chalk">
          ◂ Season hub
        </motion.button>
        <div className="mb-6 flex items-stretch overflow-hidden rounded-xl border border-white/10">
          <div className="kit-stripes w-3 shrink-0 sm:w-6" />
          <div className="font-teletext flex flex-1 flex-wrap items-center justify-between gap-x-4 bg-black/60 px-3 py-1.5 text-lg leading-tight sm:text-xl">
            <span className="text-[#ffff00]">OFFICIAL MATCHDAY PROGRAMME</span>
            <span className="text-[#00ffff]">SEASON 2001/02 · ISSUE {num}</span>
            <span className="text-chalk-dim">HOUNSLOW HARRIERS · 50p</span>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip color={c}>{level.chapter}</Chip>
              <Chip>{level.pages}</Chip>
              <Chip>Week {level.week}</Chip>
            </div>
            <div className="mt-3 flex items-end gap-4">
              <span className="display text-[clamp(5rem,14vw,9rem)] leading-[0.8]" style={{ color: c }}>
                {num}
              </span>
              <h1 className="display t-hero pb-1">{level.title}</h1>
            </div>
            <p className="mt-3 max-w-xl text-chalk-dim">
              📍 {level.setting}
            </p>
            {level.bookVoice && (
              <Reveal className="mt-5">
                <blockquote className="border-l-4 pl-4" style={{ borderColor: c }}>
                  <p className="font-hand text-2xl leading-snug">“{level.bookVoice.text}”</p>
                  <cite className="mt-1 block text-xs not-italic text-chalk-mute">{level.bookVoice.ref}</cite>
                </blockquote>
              </Reveal>
            )}
          </div>
          <div className="space-y-4">
            <DialoguePanel lines={level.commentator} accent={c} />
            {level.stats && (
            <div className="glass p-5">
              <div className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-chalk-dim">Jess at the end of this chapter</div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                <StatBar label="Passion" value={level.stats.passion} color="#c8ff3d" />
                <StatBar label="Family" value={level.stats.family} color="#ffb020" />
                <StatBar label="Freedom" value={level.stats.freedom} color="#5cc8ff" />
                <StatBar label="Friends" value={level.stats.friendship} color="#ff4d8d" />
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Progress + game CTA */}
      <section className="glass mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="mb-1.5 flex justify-between text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-chalk-dim">
            <span>Level progress</span>
            <span className="tabular-nums text-chalk">
              {prog.done}/{prog.total}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full" style={{ background: c }} animate={{ width: `${prog.pct * 100}%` }} transition={spring.soft} />
          </div>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <div className="flex items-center gap-3">
            <Stars n={s.gameStars[id] ?? 0} />
            <SpringButton accent={c} disabled={!gameOpen} onClick={() => s.go({ name: 'game', id })}>
              {gameOpen ? '🎮 Play the game' : `🔒 Game: ${have}/${need} tasks`}
            </SpringButton>
          </div>
          {!gameOpen && <span className="text-xs text-chalk-mute">Tick every Warm-Up, Vocab, Match Play and Cool-Down task first. Your teacher will check your notebook.</span>}
        </div>
      </section>

      {/* Phase tabs */}
      <nav className="rail sticky top-16 z-30 -mx-4 mt-8 flex gap-2 overflow-x-auto bg-ink-950/70 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-full sm:px-2" aria-label="Task phases">
        {PHASES.map((p) => {
          const active = p.key === phase;
          return (
            <button key={p.key} onClick={() => setPhase(p.key)} className="relative shrink-0 rounded-full px-4 py-2 text-left">
              {active && <motion.span layoutId="phase-pill" className="absolute inset-0 rounded-full" style={{ background: `${c}22`, boxShadow: `inset 0 0 0 1px ${c}66` }} transition={spring.snappy} />}
              <span className="relative block text-sm font-extrabold">
                {p.icon} {p.label}
              </span>
              <span className="relative block text-[0.62rem] uppercase tracking-[0.14em] text-chalk-mute">{p.sub}</span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.section key={phase} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring.soft} className="mt-6">
          {phase === 'vocab' ? (
            <VocabDrill levelId={id} accent={c} />
          ) : (
            <div className={`grid gap-4 ${tasks.length > 1 ? 'md:grid-cols-2' : ''}`}>
              {tasks.map((t, i) => (
                <TaskCard key={t.id} t={t} i={i} accent={c} sprinter={phase === 'sprinter'} onSource={setSrc} />
              ))}
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      <SourceModal id={src} onClose={() => setSrc(null)} />
    </main>
  );
}

function TaskCard({ t, i, accent, sprinter, onSource }: { t: Task; i: number; accent: string; sprinter: boolean; onSource: (id: string) => void }) {
  const { doneTasks, toggleTask } = useGame();
  const [help, setHelp] = useState(false);
  const [ext, setExt] = useState(false);
  const done = !!doneTasks[t.id];
  const fc = FOCUS_COLOUR[t.focus];

  return (
    <Reveal delay={i * 0.06} as="article" className={sprinter ? 'md:col-span-2' : ''}>
      <motion.div
        className="glass flex h-full flex-col p-6"
        animate={{ borderColor: done ? `${accent}88` : 'rgba(255,255,255,0.1)' }}
        whileHover={{ y: -3 }}
        transition={spring.soft}
        style={sprinter ? { background: 'linear-gradient(135deg, rgba(255,176,32,.10), rgba(255,255,255,.03))' } : undefined}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Chip color={fc}>{t.focus}</Chip>
          {sprinter && <Chip color="#ffb020">⚡ Sprinter</Chip>}
          {t.minutes && <span className="text-xs text-chalk-mute">~{t.minutes} min</span>}
        </div>
        <h3 className="display t-h2 mb-2">{t.title}</h3>
        <p className="leading-relaxed text-chalk/90">
          <span className="mr-1.5 font-hand text-lg text-chalk-dim">✏️ In your notebook:</span>
          {t.prompt}
        </p>

        {t.quote && (
          <blockquote className="mt-4 rounded-2xl border border-white/10 bg-ink-950/50 p-4">
            <p className="font-hand text-xl leading-snug">“{t.quote.text}”</p>
            <cite className="mt-1 block text-xs not-italic text-chalk-mute">{t.quote.ref}</cite>
          </blockquote>
        )}

        <AnimatePresence initial={false}>
          {help && t.support && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring.soft} className="overflow-hidden">
              <div className="mt-4 rounded-2xl border border-sky/30 bg-sky/[0.06] p-4 text-sm">
                <div className="mb-1 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-sky">Help · sentence starters</div>
                {t.support}
              </div>
            </motion.div>
          )}
          {ext && t.sprinter && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring.soft} className="overflow-hidden">
              <div className="mt-4 rounded-2xl border border-saffron/40 bg-saffron/[0.07] p-4 text-sm">
                <div className="mb-1 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-saffron">⚡ Sprinter extension</div>
                {t.sprinter}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          {t.support && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={spring.snappy} onClick={() => setHelp(!help)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-chalk-dim hover:text-chalk">
              {help ? 'Hide help' : '🛟 Help'}
            </motion.button>
          )}
          {t.sprinter && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={spring.snappy} onClick={() => setExt(!ext)} className="rounded-full border border-saffron/30 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-saffron">
              {ext ? 'Hide' : '⚡ Sprinter'}
            </motion.button>
          )}
          {t.sourceId && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={spring.snappy} onClick={() => onSource(t.sourceId!)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-chalk-dim hover:text-chalk">
              🗂 Source file
            </motion.button>
          )}
          <span className="ml-auto">
            <SpringToggle on={done} onChange={() => toggleTask(t.id)} label={done ? 'Done ✓' : 'Done in notebook'} accent={accent} />
          </span>
        </div>
      </motion.div>
    </Reveal>
  );
}

function VocabDrill({ levelId, accent }: { levelId: number; accent: string }) {
  const level = levelById(levelId);
  const { doneTasks, toggleTask } = useGame();
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [all, setAll] = useState(false);
  const id = `l${levelId}-vocab`;

  return (
    <div>
      <div className="glass mb-5 p-6">
        <h3 className="display t-h2">📒 Vocab Drill: {level.chapter}</h3>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-chalk/90">
          <li>
            Copy each word into the vocabulary section of your notebook with its <b>word class</b> and <b>meaning</b>.
          </li>
          <li>
            Find the word in the chapter and copy the <b>sentence</b> it appears in (with page number).
          </li>
          <li>
            Write <b>your own sentence</b> using the word.
          </li>
          <li>
            ⚡ Sprinter: add a <b>synonym</b> and find <b>3 more</b> new words in the chapter on your own.
          </li>
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SpringButton variant="outline" onClick={() => setAll(!all)}>
            {all ? 'Hide all meanings' : 'Show all meanings'}
          </SpringButton>
          <span className="ml-auto">
            <SpringToggle on={!!doneTasks[id]} onChange={() => toggleTask(id)} label={doneTasks[id] ? 'Vocab done ✓' : 'All 10 in notebook'} accent={accent} />
          </span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {level.vocab.map((v, i) => {
          const open = all || reveal[v.word];
          return (
            <Reveal key={v.word} delay={i * 0.03}>
              <motion.button
                type="button"
                onClick={() => setReveal({ ...reveal, [v.word]: !reveal[v.word] })}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={spring.snappy}
                className="glass flex min-h-[8.5rem] w-full flex-col p-5 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="display text-3xl" style={{ color: accent }}>
                    {v.word}
                  </span>
                  <span className="mt-1 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-chalk-mute">{v.wordClass}</span>
                </div>
                <div className="mt-auto min-h-[2.75rem] pt-2">
                  <AnimatePresence mode="wait" initial={false}>
                    {open ? (
                      <motion.p key="m" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.snappy} className="text-sm leading-snug">
                        {v.meaning}
                      </motion.p>
                    ) : (
                      <motion.p key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-chalk-mute">
                        Guess the meaning first, then tap to check
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
