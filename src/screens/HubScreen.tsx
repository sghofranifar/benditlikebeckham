import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../store';
import { LEVELS } from '../data/levels';
import { levelProgress, rankFor, totalXP, unlockedCards, badges } from '../lib/progress';
import { accentHex, spring } from '../lib/motion';
import { play } from '../lib/sound';
import { Reveal, SpringButton, Stars, StatBar } from '../components/ui';
import { Modal } from '../components/Modal';
import { CHARACTERS } from '../data/characters';
import type { Level } from '../types';
import { STAGES, levelsUpToStage, stageForCode } from '../lib/codes';
import { IMAGES } from '../data/config';
import { OptionalImg } from '../components/OptionalImg';

const THEMES = [
  ['Identity', '🪞'],
  ['Family & Tradition', '🏠'],
  ['Gender Expectations', '⚖️'],
  ['Prejudice', '✊🏽'],
  ['Friendship', '🤝'],
  ['Secrets & Lies', '🤫'],
  ['Dreams & Freedom', '✈️'],
];

// Season hub: asymmetric bento grid of glass cards + the fixture list of levels.
export function HubScreen() {
  const s = useGame();
  const xp = totalXP(s);
  const rank = rankFor(xp);
  const cards = unlockedCards(s);
  const current = [...LEVELS].filter((l) => !l.extra).reverse().find((l) => s.unlocked.includes(l.id)) ?? LEVELS[0];
  const stats = current.stats ?? LEVELS[12].stats!;
  const curProg = levelProgress(current, s);
  const won = Object.values(s.gameStars).filter((v) => v > 0).length;
  const [locked, setLocked] = useState<Level | null>(null);

  // kinetic typography: the giant word drifts sideways with scroll
  const { scrollY } = useScroll();
  const x1 = useTransform(scrollY, [0, 800], ['0%', '-18%']);
  const x2 = useTransform(scrollY, [0, 800], ['-10%', '6%']);

  const open = (l: Level) => {
    if (s.unlocked.includes(l.id)) s.go({ name: 'level', id: l.id });
    else {
      play('tap');
      setLocked(l);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      {/* HERO: stark oversized type, no images */}
      <section className="relative overflow-hidden pb-6 pt-10 sm:pt-14">
        <motion.div style={{ x: x1 }} className="display t-mega whitespace-nowrap text-white/[0.04]" aria-hidden>
          SEASON · SEASON · SEASON
        </motion.div>
        <div className="-mt-[0.6em] sm:-mt-[0.75em]">
          <motion.div className="mb-3 flex flex-wrap items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="font-teletext bg-[#0000ff] px-2 text-lg leading-tight text-[#ffff00]">SEASON 2001/02</span>
            <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-lime">Welcome back, {s.playerName || 'rookie'}</span>
          </motion.div>
          <motion.h1 className="display t-hero" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring.soft}>
            Your season, <span className="text-lime">{rank.name}</span>
          </motion.h1>
        </div>
        <motion.div style={{ x: x2 }} className="display t-h1 mt-2 whitespace-nowrap text-stroke" aria-hidden>
          Read · Write · Play · Unlock · Read · Write · Play
        </motion.div>
      </section>

      {/* BENTO GRID */}
      <section className="grid auto-rows-[minmax(0,auto)] grid-cols-1 gap-4 md:grid-cols-6" aria-label="Season overview">
        {/* Next up: big tile */}
        <Reveal className="md:col-span-4 md:row-span-2">
          <motion.button
            type="button"
            onClick={() => open(current)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            transition={spring.soft}
            className="glass group flex h-full min-h-[300px] w-full flex-col overflow-hidden p-6 text-left sm:p-8"
          >
            <OptionalImg src={IMAGES.hubHero} alt="" className="absolute inset-0 h-full w-full rounded-3xl object-cover opacity-30" />
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-40" style={{ background: accentHex[current.accent] }} />
            <div className="kit-stripes absolute inset-x-0 top-0 h-2 opacity-80" />
            <div className="relative flex items-center justify-between">
              <span className="chip" style={{ color: accentHex[current.accent] }}>
                Next up · Week {current.week}
              </span>
              <Stars n={s.gameStars[current.id] ?? 0} />
            </div>
            <div className="relative mt-auto">
              <div className="display text-[clamp(5rem,14vw,10rem)] leading-none" style={{ color: accentHex[current.accent] }}>
                {current.id === 14 ? 'FT' : String(current.id).padStart(2, '0')}
              </div>
              <h2 className="display t-h1">{current.title}</h2>
              <p className="mt-1 text-chalk-dim">
                {current.chapter} · {current.pages} · {current.tagline}
              </p>
              <div className="mt-5 flex items-center gap-4">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full" style={{ background: accentHex[current.accent] }} initial={{ width: 0 }} animate={{ width: `${curProg.pct * 100}%` }} transition={spring.soft} />
                </div>
                <span className="text-sm font-extrabold tabular-nums">
                  {curProg.done}/{curProg.total}
                </span>
                <span className="rounded-full px-4 py-2 text-xs font-extrabold uppercase text-ink-950" style={{ background: accentHex[current.accent] }}>
                  Play ▸
                </span>
              </div>
            </div>
          </motion.button>
        </Reveal>

        {/* XP / rank */}
        <Reveal className="md:col-span-2" delay={0.05}>
          <div className="glass h-full p-6">
            <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-chalk-dim">Experience</div>
            <div className="display mt-1 text-6xl tabular-nums text-lime">{xp}</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-lime" initial={{ width: 0 }} animate={{ width: `${rank.toNext * 100}%` }} transition={spring.soft} />
            </div>
            <p className="mt-2 text-xs text-chalk-dim">{rank.next ? `${rank.next.xp - xp} XP to ${rank.next.name}` : 'Top rank reached!'}</p>
          </div>
        </Reveal>

        {/* Games won: Ceefax-style results page */}
        <Reveal className="md:col-span-2" delay={0.1}>
          <div className="font-teletext h-full overflow-hidden rounded-3xl border border-white/10 bg-black p-4 text-[1.35rem] leading-[1.1]">
            <div className="flex justify-between bg-[#0000ff] px-1 text-white">
              <span>P303 RESULTS</span>
              <span>{won}/{LEVELS.length}</span>
            </div>
            {LEVELS.filter((l) => s.gameStars[l.id]).slice(-4).map((l) => (
              <div key={l.id} className="mt-1 flex justify-between gap-2">
                <span className="truncate text-[#00ffff]">{l.title.toUpperCase()}</span>
                <span className="shrink-0 text-[#ffff00]">{'*'.repeat(s.gameStars[l.id])}</span>
              </div>
            ))}
            {won === 0 && <div className="mt-1 text-[#00ff00]">NO RESULTS YET. WIN A GAME TO APPEAR HERE.</div>}
          </div>
        </Reveal>

        {/* Jess's stats now */}
        <Reveal className="md:col-span-3" delay={0.05}>
          <div className="glass h-full p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-chalk-dim">Jess's stats · after {current.chapter}</div>
              <span className="chip">story meter</span>
            </div>
            <div className="space-y-3">
              <StatBar icon="⚽" label="Passion for football" value={stats.passion} color="#c8ff3d" />
              <StatBar icon="🏠" label="Family harmony" value={stats.family} color="#ffb020" />
              <StatBar icon="🕊️" label="Freedom" value={stats.freedom} color="#5cc8ff" />
              <StatBar icon="🤝" label="Friendship" value={stats.friendship} color="#ff4d8d" />
            </div>
            <p className="mt-4 font-hand text-lg leading-snug text-chalk-dim">Notebook: do you agree with these scores? Which one would you change, and why?</p>
          </div>
        </Reveal>

        {/* Squad */}
        <Reveal className="md:col-span-3" delay={0.1}>
          <motion.button type="button" onClick={() => s.go({ name: 'squad' })} whileHover={{ y: -4 }} transition={spring.soft} className="glass h-full w-full p-6 text-left">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-chalk-dim">Squad cards</div>
              <span className="text-sm font-extrabold tabular-nums">
                {cards.length}/{CHARACTERS.length}
              </span>
            </div>
            <div className="flex -space-x-3">
              {CHARACTERS.map((c, i) => {
                const have = cards.some((k) => k.id === c.id);
                return (
                  <motion.div key={c.id} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ ...spring.bouncy, delay: i * 0.03 }} className="display grid h-12 w-12 place-items-center rounded-full border-2 border-ink-900 text-sm" style={{ background: have ? c.colour : '#1a2236', color: have ? '#07090f' : '#6b7591' }} title={have ? c.name : 'Locked'}>
                    {have ? c.initials : '?'}
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-chalk-dim">Collect all {CHARACTERS.length}. Flip each card for its Big Question ▸</p>
          </motion.button>
        </Reveal>

        {/* Themes */}
        <Reveal className="md:col-span-4" delay={0.05}>
          <div className="glass h-full p-6">
            <div className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-chalk-dim">Your Theme Tracker (in your notebook)</div>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(([t, i], k) => (
                <motion.span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring.soft, delay: k * 0.04 }} whileHover={{ scale: 1.06, y: -2 }}>
                  {i} {t}
                </motion.span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Badges */}
        <Reveal className="md:col-span-2" delay={0.1}>
          <motion.button type="button" onClick={() => s.go({ name: 'summary' })} whileHover={{ y: -4 }} transition={spring.soft} className="glass h-full w-full p-6 text-left">
            <div className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-chalk-dim">Badges</div>
            <div className="flex flex-wrap gap-2 text-2xl">
              {badges(s).map((b) => (
                <span key={b.id} title={`${b.name}: ${b.desc}`} className={b.got ? '' : 'opacity-20 grayscale'}>
                  {b.icon}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-chalk-dim">Season report ▸</p>
          </motion.button>
        </Reveal>
      </section>

      {/* FIXTURE LIST: the progress tracker of all levels */}
      <section className="mt-16" aria-labelledby="fixtures">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 id="fixtures" className="display t-h1">
              Fixture list
            </h2>
            <span className="hidden text-sm text-chalk-dim sm:block">1 level = 1 chapter · about 3 per week</span>
          </div>
        </Reveal>
        {[1, 2, 3, 4].map((w) => (
          <div key={w} className="mb-8">
            <Reveal>
              <div className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.25em] text-chalk-mute">Week {w}</div>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {LEVELS.filter((l) => l.week === w && !l.extra).map((l, i) => {
                return <Ticket key={l.id} l={l} onOpen={open} delay={i * 0.05} />;
              })}
            </div>
          </div>
        ))}
        <div className="mb-8">
          <Reveal>
            <div className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.25em] text-violet">Extra time · bonus research unit</div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.filter((l) => l.extra).map((l) => (
              <Ticket key={l.id} l={l} onOpen={open} />
            ))}
          </div>
        </div>
      </section>

      <UnlockModal level={locked} onClose={() => setLocked(null)} />
    </main>
  );
}

// Fixture card styled as a 2001/02 match ticket.
function Ticket({ l, onOpen, delay = 0 }: { l: Level; onOpen: (l: Level) => void; delay?: number }) {
  const s = useGame();
  const unlocked = s.unlocked.includes(l.id);
  const p = levelProgress(l, s);
  const c = accentHex[l.accent];
  const num = l.id === 14 ? 'FT' : l.id === 15 ? 'XT' : String(l.id).padStart(2, '0');
  return (
    <Reveal delay={delay}>
      <motion.button
        type="button"
        onClick={() => onOpen(l)}
        whileHover={{ y: -5, rotate: unlocked ? -0.8 : 0 }}
        whileTap={{ scale: 0.97 }}
        transition={spring.snappy}
        className={`glass ticket flex h-full min-h-[200px] w-full flex-col overflow-hidden p-0 text-left ${unlocked ? '' : 'opacity-60'}`}
      >
        <div className="flex items-start justify-between px-5 pt-4">
          <div>
            <div className="font-teletext text-base leading-none text-chalk-mute">ADMIT ONE · MATCHDAY {num}</div>
            <div className="display mt-1 text-5xl leading-none" style={{ color: unlocked ? c : '#6b7591' }}>
              {num}
            </div>
          </div>
          {unlocked ? <Stars n={s.gameStars[l.id] ?? 0} size="text-base" /> : <span className="text-xl">🔒</span>}
        </div>
        <div className="tear mx-5 mt-4" />
        <div className="mt-auto px-5 pb-4 pt-3">
          <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-chalk-mute">
            {l.chapter} · {l.pages}
          </div>
          <div className="display t-h3 mt-0.5">{l.title}</div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full" style={{ background: c }} initial={{ width: 0 }} whileInView={{ width: `${p.pct * 100}%` }} viewport={{ once: true }} transition={spring.soft} />
          </div>
        </div>
        <div className="kit-stripes h-1.5 w-full opacity-70" />
      </motion.button>
    </Reveal>
  );
}

function UnlockModal({ level, onClose }: { level: Level | null; onClose: () => void }) {
  const { unlock, go, playerName } = useGame();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(0);
  const tryIt = () => {
    if (!level) return;
    const stage = stageForCode(playerName, pw);
    if (stage >= 0) {
      play('unlock');
      levelsUpToStage(stage).forEach((id) => unlock(id));
      setPw('');
      setErr('');
      onClose();
      if (levelsUpToStage(stage).includes(level.id)) go({ name: 'level', id: level.id });
    } else {
      play('bad');
      setErr(`That code doesn't work for ${playerName}. Codes are personal: show your notebook to your teacher to get yours.`);
      setShake((n) => n + 1);
    }
  };
  return (
    <Modal open={!!level} onClose={onClose} label="Unlock level">
      {level && (
        <div>
          <div className="text-4xl">🔒</div>
          <h2 className="display t-h1 mt-2">
            {level.chapter}: {level.title}
          </h2>
          <p className="mt-2 text-chalk-dim">Finish the previous chapter in your notebook and show it to your teacher. You'll get a <b>4-character code</b> that only works for <b>{playerName}</b>. This chapter is part of: <b>{STAGES.find((st) => st.levels.includes(level.id))?.label}</b>.</p>
          <motion.div key={shake} animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : {}} transition={{ duration: 0.4 }} className="mt-5 flex gap-2">
            <motion.input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryIt()}
              placeholder="e.g. K7QF"
              aria-label="Personal unlock code"
              maxLength={6}
              autoFocus
              whileFocus={{ scale: 1.02 }}
              transition={spring.snappy}
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-bold outline-none focus:border-lime focus:shadow-glow"
            />
            <SpringButton onClick={tryIt}>Unlock</SpringButton>
          </motion.div>
          <div className="mt-2 min-h-[1.25rem] text-sm text-rose">{err}</div>
        </div>
      )}
    </Modal>
  );
}
