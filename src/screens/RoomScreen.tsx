import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useGame, type Screen } from '../store';
import { LEVELS } from '../data/levels';
import { IMAGES } from '../data/config';
import { rankFor, totalXP } from '../lib/progress';
import { spring } from '../lib/motion';
import { play } from '../lib/sound';
import { JessSprite } from '../components/JessSprite';
import { OptionalImg } from '../components/OptionalImg';
import { LicenceButton } from '../components/Licence';

// ─────────────────────────────────────────────────────────────
// The starting point: Jess's bedroom in 3D (pure CSS 3D, runs on iPads).
// The camera follows the pointer; objects in the room are clickable;
// Jess talks to the player through a story-game dialogue box.
// ─────────────────────────────────────────────────────────────

const W = 1200; // room width
const H = 680; // room height
const D = 1000; // room depth

type Line = string;
type Action = { label: string; to: Screen; primary?: boolean };

export function RoomScreen() {
  const s = useGame();
  const reduce = useReducedMotion();
  const current = [...LEVELS].filter((l) => !l.extra).reverse().find((l) => s.unlocked.includes(l.id)) ?? LEVELS[0];
  const xp = totalXP(s);

  // ── dialogue state ──
  const intro: Line[] = s.playerName
    ? [`Hey ${s.playerName}! You're back. Mum thinks I'm revising, so keep your voice down.`, `You're on ${current.chapter}: "${current.title}". Shall we carry on?`]
    : [
        'Oh! Hi! Sorry, I was doing the match commentary. In my head. Again.',
        "I'm Jess. Well, Jesminder, if you're my mum.",
        'Welcome to my room in Hounslow. The planes from Heathrow fly right over us, and my posters drive Mum mad.',
        "I've got a story to tell you: thirteen chapters of it. Every chapter is a level in this game.",
        "But first: what's your name? Choose carefully, because only your teacher can change it later!",
      ];
  const [lines, setLines] = useState<Line[]>(intro);
  const [inIntro, setInIntro] = useState(true);
  const [li, setLi] = useState(0);
  const [shown, setShown] = useState(0);
  const [askName, setAskName] = useState(false);
  const [name, setName] = useState('');
  const [hint, setHint] = useState<Action | null>(null);
  const [waving, setWaving] = useState(true);
  const line = (lines[li] ?? '').replace('{name}', s.playerName);
  const typing = shown < line.length;
  const lastLine = li >= lines.length - 1;

  useEffect(() => {
    const t = setTimeout(() => setWaving(false), 1900);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => setShown(reduce ? line.length : 0), [li, line, reduce]);
  useEffect(() => {
    if (!typing) {
      if (lastLine && !s.playerName && inIntro) setAskName(true);
      return;
    }
    const t = setTimeout(() => setShown((n) => Math.min(line.length, n + 2)), 20);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, typing]);

  const say = (ls: Line[], action: Action | null = null) => {
    setInIntro(false);
    setLines(ls);
    setLi(0);
    setHint(action);
    play('tap');
  };
  const advance = () => {
    if (typing) setShown(line.length);
    else if (!lastLine) setLi(li + 1);
  };
  const submitName = () => {
    const n = name.trim();
    if (!n) return;
    s.setName(n);
    setAskName(false);
    setWaving(true);
    setTimeout(() => setWaving(false), 1900);
    play('whistle');
    setInIntro(false);
    setLines([`Nice to meet you, ${n}!`, "One rule: you'll need a notebook. All your answers go in THERE, not in here. This is where you find the tasks and play the games.", 'Click anything in my room to explore, or pick where to go.']);
    setLi(0);
  };

  // ── camera: pointer parallax with spring physics ──
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const rotY = useTransform(sx, [-1, 1], [9, -9]);
  const rotX = useTransform(sy, [-1, 1], [-4, 4]);

  // ── fit the room to the screen ──
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const el = wrap.current;
      if (!el) return;
      setScale(Math.min(el.clientWidth / (W * 1.08), el.clientHeight / (H * 1.08)) * (el.clientWidth < 700 ? 1.5 : 1));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const menu: Action[] = s.playerName
    ? [
        { label: `▶ Play ${current.chapter}`, to: { name: 'level', id: current.id }, primary: true },
        { label: '🏟 Season hub', to: { name: 'hub' } },
        { label: '🃏 Squad cards', to: { name: 'squad' } },
        { label: '🗂 Archive', to: { name: 'archive' } },
        { label: '📊 Season report', to: { name: 'summary' } },
      ]
    : [];

  const nameReady = !!s.playerName;

  return (
    <main
      className="relative h-[100dvh] overflow-hidden bg-ink-950"
      onPointerMove={(e) => {
        if (reduce) return;
        mx.set((e.clientX / window.innerWidth) * 2 - 1);
        my.set((e.clientY / window.innerHeight) * 2 - 1);
      }}
    >
      {/* ── 3D ROOM ── */}
      <div ref={wrap} className="absolute inset-0" style={{ perspective: 1100 * scale }}>
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2, scale, rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', z: 120 }}
          initial={reduce ? false : { opacity: 0, z: -300 }}
          animate={{ opacity: 1, z: 120 }}
          transition={{ type: 'spring', stiffness: 40, damping: 16 }}
        >
          {/* back wall */}
          <Face w={W} h={H} t={`translateZ(${-D / 2}px)`} cls="wall">
            <Window disabled={!nameReady} onClick={() => say(['Another plane to Heathrow. Dad works there as a security guard, and so does half of Hounslow, nearly.', 'One day I want to be ON one of those planes.'], null)} />
            <Poster disabled={!nameReady} onClick={() => say(["My favourite poster. Nobody can bend a ball like Beckham. Well... nobody YET.", 'Want to know what "bending it" actually means? Check the Archive.'], { label: '🗂 Open the Archive', to: { name: 'archive' }, primary: true })} />
            <TV xp={xp} current={current.title} chapter={current.id} disabled={!nameReady} onClick={() => say(['Our telly. Ceefax has all the scores, including yours!', "Let's look at the whole season."], { label: '🏟 Go to the Season hub', to: { name: 'hub' }, primary: true })} />
          </Face>
          {/* left wall */}
          <Face w={D} h={H} t={`translateX(${-W / 2}px) rotateY(90deg)`} cls="wall-side">
            <Shirt disabled={!nameReady} onClick={() => say(["My No. 7 shirt. I wear it under everything, even when I'm not supposed to.", "Want to meet everyone in my story? Win games to collect their cards."], { label: '🃏 See the Squad cards', to: { name: 'squad' }, primary: true })} />
            <Calendar />
            <Pennant />
            <Bed />
          </Face>
          {/* right wall */}
          <Face w={D} h={H} t={`translateX(${W / 2}px) rotateY(-90deg)`} cls="wall-side">
            <Door chapter={current.chapter} disabled={!nameReady} onClick={() => say([`Through there is the real world, ${s.playerName || 'rookie'}. And ${current.chapter}.`, 'Got your notebook? Then go!'], { label: `▶ Play ${current.chapter}`, to: { name: 'level', id: current.id }, primary: true })} />
            <Shelf disabled={!nameReady} onClick={() => say(['My trophy shelf. Well, it will be.', 'Your Season Report shows everything you have won so far.'], { label: '📊 Season report', to: { name: 'summary' }, primary: true })} />
          </Face>
          {/* floor */}
          <Face w={W} h={D} t={`translateY(${H / 2}px) rotateX(90deg)`} cls="floor">
            <div className="absolute left-1/2 top-1/2 h-[46%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[10px] border-[#3a1d4a] bg-[#5b2a6e] opacity-80" />
            <Ball disabled={!nameReady} onKick={() => say(['GOAL! ...Sorry. Mum will go spare if we break something.'], null)} />
          </Face>
          {/* ceiling */}
          <Face w={W} h={D} t={`translateY(${-H / 2}px) rotateX(-90deg)`} cls="ceiling">
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffe9b0] opacity-70 blur-xl" />
          </Face>
        </motion.div>
      </div>

      {/* warm lamp glow + vignette over the room */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,200,120,.12),transparent_60%),radial-gradient(ellipse_at_center,transparent_45%,rgba(7,9,15,.85)_100%)]" />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6">
        <span className="chip whitespace-nowrap bg-ink-950/60">K07<span className="hidden sm:inline"> · A reading quest</span></span>
        <div className="flex items-center gap-2">
          {s.playerName && (
            <span className="led hidden whitespace-nowrap rounded-lg bg-black/70 px-3 py-1 text-xl leading-none sm:inline">
              {rankFor(xp).name.toUpperCase()} · {String(xp).padStart(4, '0')} XP
            </span>
          )}
          <LicenceButton compact />
        </div>
      </div>

      {/* title */}
      <motion.h1 className="display pointer-events-none absolute left-4 top-16 z-10 text-[clamp(2.2rem,7vw,6rem)] leading-[0.85] sm:left-8" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring.soft, delay: 0.4 }}>
        <span className="text-lime">Bend it</span>
        <br />
        <span className="text-stroke">like Beckham</span>
      </motion.h1>

      {/* Jess */}
      <motion.div className="pointer-events-none absolute bottom-0 left-[2%] z-20 h-[min(36dvh,300px)] sm:left-[6%] sm:h-[min(62dvh,560px)]" initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ ...spring.soft, delay: 0.6 }}>
        <JessSprite talking={typing} waving={waving} />
      </motion.div>

      {/* dialogue box */}
      <motion.section aria-label="Jess speaking" className="glass absolute bottom-3 left-3 right-3 z-30 bg-ink-950/80 p-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[min(640px,58vw)] sm:p-6" initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring.soft, delay: 0.8 }}>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-lime">Jess</span>
          {!askName && lines.length > 1 && <span className="text-[0.65rem] tabular-nums text-chalk-mute">{li + 1}/{lines.length}</span>}
        </div>
        <button type="button" onClick={advance} className="block w-full text-left" aria-live="polite">
          <p className="min-h-[3.4rem] text-[1.05rem] leading-relaxed sm:text-lg">
            {line.slice(0, shown)}
            {typing && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-lime" />}
          </p>
        </button>

        <AnimatePresence mode="wait">
          {askName ? (
            <motion.form key="name" className="mt-3 flex gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.snappy} onSubmit={(e) => { e.preventDefault(); submitName(); }}>
              <motion.input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="Your first and last name" aria-label="Your name" whileFocus={{ scale: 1.02 }} transition={spring.snappy} className="min-w-0 flex-1 rounded-full border border-white/15 bg-ink-950/70 px-5 py-3 font-bold outline-none focus:border-lime focus:shadow-glow" />
              <motion.button type="submit" disabled={!name.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} transition={spring.snappy} className="rounded-full bg-lime px-5 font-extrabold uppercase text-ink-950 disabled:opacity-40">
                That's me ▸
              </motion.button>
            </motion.form>
          ) : typing || !lastLine ? (
            <motion.button key="next" onClick={advance} className="mt-2 text-xs font-extrabold uppercase tracking-[0.18em] text-chalk-dim hover:text-chalk" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {typing ? 'Skip ▸▸' : 'Next ▸'}
            </motion.button>
          ) : (
            <motion.div key="menu" className="mt-3 flex flex-wrap gap-2" initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.05 } } }}>
              {(hint ? [hint, ...menu.filter((m) => m.to.name !== hint.to.name)] : menu).map((a) => (
                <motion.button
                  key={a.label}
                  variants={{ h: { opacity: 0, y: 10 }, s: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  transition={spring.snappy}
                  onClick={() => {
                    play('tap');
                    s.go(a.to);
                  }}
                  className={`rounded-full px-4 py-2.5 text-sm font-extrabold ${a.primary ? 'bg-lime text-ink-950' : 'border border-white/15 bg-white/5 text-chalk'}`}
                >
                  {a.label}
                </motion.button>
              ))}
              {s.playerName && <span className="w-full pt-1 text-[0.7rem] text-chalk-mute">Tip: click the TV, the door, the shirt, the poster, the shelf or the ball.</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
}

// ── room building blocks ─────────────────────────────────────

function Face({ w, h, t, cls, children }: { w: number; h: number; t: string; cls: 'wall' | 'wall-side' | 'floor' | 'ceiling'; children?: ReactNode }) {
  const bg = {
    wall: 'linear-gradient(180deg,#24304f 0%,#1c2640 70%,#141b2e 100%)',
    'wall-side': 'linear-gradient(90deg,#141b2e 0%,#1d2742 100%)',
    floor: 'repeating-linear-gradient(90deg,#3b2a1f 0 78px,#33241a 78px 80px), linear-gradient(#3b2a1f,#2a1d15)',
    ceiling: 'linear-gradient(#10162a,#0c1120)',
  }[cls];
  return (
    <div className="absolute left-1/2 top-1/2 overflow-hidden" style={{ width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2, transform: t, background: bg, transformStyle: 'preserve-3d' }}>
      {cls !== 'floor' && cls !== 'ceiling' && <div className="absolute inset-x-0 bottom-0 h-6 bg-[#e8e2d6]/80" />}
      {children}
    </div>
  );
}

function Hotspot({ x, y, w, h, label, onClick, disabled, children }: { x: number; y: number; w: number; h: number; label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="group absolute disabled:cursor-default"
      style={{ left: x, top: y, width: w, height: h }}
      whileHover={disabled ? {} : { scale: 1.04, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={spring.snappy}
    >
      {children}
      {!disabled && (
        <>
          <span className="pointer-events-none absolute -inset-2 rounded-2xl opacity-0 ring-4 ring-lime/70 transition-opacity group-hover:opacity-100" />
          <span className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-lime px-4 py-1.5 text-lg font-extrabold text-ink-950 opacity-0 transition-opacity group-hover:opacity-100">{label}</span>
          <motion.span className="pointer-events-none absolute -right-2 -top-2 h-5 w-5 rounded-full bg-lime" animate={{ scale: [1, 1.5, 1], opacity: [0.9, 0.3, 0.9] }} transition={{ duration: 2, repeat: Infinity }} />
        </>
      )}
    </motion.button>
  );
}

function Window({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <Hotspot x={360} y={80} w={360} h={260} label="Look outside" onClick={onClick} disabled={disabled}>
      <div className="absolute inset-0 overflow-hidden rounded-md border-[12px] border-[#e8e2d6] bg-[linear-gradient(180deg,#2b3a7a_0%,#d9607a_62%,#ffb36b_100%)] shadow-[inset_0_0_40px_rgba(0,0,0,.4)]">
        <OptionalImg src={IMAGES.roomWindow} alt="View from Jess's window" className="absolute inset-0 h-full w-full object-cover" />
        <svg viewBox="0 0 320 230" className="absolute inset-x-0 bottom-0 w-full" preserveAspectRatio="none">
          <path d="M0 230 V170 h30 v-20 h20 v20 h25 v-30 l15 -12 l15 12 v30 h30 v-18 h40 v18 h20 v-40 h12 v40 h30 v-25 l18 -10 l18 10 v25 h47 V230 Z" fill="#1a1630" />
        </svg>
        <motion.span className="absolute text-3xl" style={{ top: 40 }} initial={{ left: '-20%' }} animate={{ left: ['-20%', '120%'] }} transition={{ duration: 9, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}>
          ✈️
        </motion.span>
        <div className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-[#e8e2d6]" />
        <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-[#e8e2d6]" />
      </div>
    </Hotspot>
  );
}

function Poster({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <Hotspot x={790} y={40} w={190} h={250} label="Poster" onClick={onClick} disabled={disabled}>
      <div className="absolute inset-0 rotate-[-2deg] overflow-hidden rounded-sm bg-[linear-gradient(160deg,#d62839,#7a1020)] shadow-2xl">
        <div className="display absolute -right-3 top-4 text-[180px] leading-none text-white/90">7</div>
        <svg viewBox="0 0 220 310" className="absolute inset-0" preserveAspectRatio="none">
          <path d="M20 280 C 60 120, 200 200, 170 40" stroke="#fff" strokeWidth="3" strokeDasharray="8 8" fill="none" />
          <circle cx="170" cy="40" r="12" fill="#fff" />
        </svg>
        <div className="display absolute bottom-3 left-3 text-4xl text-white">BEND IT</div>
      </div>
    </Hotspot>
  );
}

function Pennant() {
  return (
    <div className="absolute left-[660px] top-[330px] h-[70px] w-[230px] [clip-path:polygon(0_0,100%_50%,0_100%)]" style={{ background: 'linear-gradient(90deg,#0b3d91,#1e5bc6)' }}>
      <span className="display absolute left-3 top-1/2 -translate-y-1/2 text-xl tracking-wide text-white">HOUNSLOW HARRIERS</span>
    </div>
  );
}

function TV({ xp, current, chapter, onClick, disabled }: { xp: number; current: string; chapter: number; onClick: () => void; disabled: boolean }) {
  return (
    <Hotspot x={840} y={310} w={300} h={350} label="Watch the telly" onClick={onClick} disabled={disabled}>
      <div className="absolute inset-x-0 bottom-0 h-[110px] rounded-md bg-[#5a3b26] shadow-xl" />
      <div className="absolute inset-x-4 top-0 h-[230px] rounded-[22px] bg-[#2a2a2e] p-4 shadow-2xl">
        <div className="font-teletext h-full overflow-hidden rounded-[30px/40px] bg-black p-3 text-left text-[22px] leading-[1.05] shadow-[inset_0_0_30px_rgba(120,200,255,.25)]">
          <div className="bg-[#0000ff] px-1 text-white">P302 CEEFAX 302 Sat</div>
          <div className="mt-1 text-[#ffff00]">FOOTBALL · SEASON 01/02</div>
          <div className="text-[#00ffff]">NOW PLAYING: CH {String(chapter).padStart(2, '0')}</div>
          <div className="truncate text-white">{current.toUpperCase()}</div>
          <div className="mt-1 text-[#00ff00]">YOUR XP ........ {String(xp).padStart(4, '0')}</div>
          <motion.div className="text-[#ff00ff]" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
            PRESS TO VIEW TABLE ▸
          </motion.div>
        </div>
      </div>
    </Hotspot>
  );
}

function Shirt({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <Hotspot x={380} y={90} w={250} h={260} label="No. 7 shirt" onClick={onClick} disabled={disabled}>
      <svg viewBox="0 0 250 260" className="absolute inset-0 drop-shadow-2xl">
        <path d="M60 30 L100 10 Q125 30 150 10 L190 30 L240 80 L205 115 L185 95 L185 250 L65 250 L65 95 L45 115 L10 80 Z" fill="#d62839" />
        <path d="M100 10 Q125 40 150 10" stroke="#fff" strokeWidth="6" fill="none" />
        <text x="125" y="200" textAnchor="middle" fontFamily="Anton, Impact" fontSize="110" fill="#fff">
          7
        </text>
      </svg>
    </Hotspot>
  );
}

function Calendar() {
  return (
    <div className="absolute left-[700px] top-[120px] w-[150px] rounded bg-[#f3efe6] p-2 text-center text-ink-950 shadow-xl">
      <div className="bg-[#d62839] py-1 text-sm font-extrabold text-white">AUGUST</div>
      <div className="display text-6xl">2002</div>
      <div className="text-xs font-bold">A-level results soon…</div>
    </div>
  );
}

function Bed() {
  return (
    <div className="absolute bottom-6 left-[120px] h-[150px] w-[520px]">
      <div className="absolute bottom-0 h-[90px] w-full rounded-t-lg bg-[#6b4a8a]" />
      <div className="absolute bottom-[80px] left-4 h-[50px] w-[150px] rounded-2xl bg-[#e8e2d6]" />
      <div className="absolute bottom-0 left-0 h-[150px] w-4 bg-[#4a3226]" />
    </div>
  );
}

function Door({ chapter, onClick, disabled }: { chapter: string; onClick: () => void; disabled: boolean }) {
  return (
    <Hotspot x={560} y={160} w={260} h={496} label={`Go to ${chapter}`} onClick={onClick} disabled={disabled}>
      <div className="absolute inset-0 rounded-t-md border-[10px] border-[#e8e2d6] bg-[linear-gradient(180deg,#6b4a2f,#563a24)]">
        <div className="absolute left-6 right-6 top-8 h-[150px] rounded border-4 border-[#4a301d]" />
        <div className="absolute bottom-10 left-6 right-6 h-[180px] rounded border-4 border-[#4a301d]" />
        <div className="absolute right-5 top-1/2 h-5 w-5 rounded-full bg-[#ffd36b]" />
        <div className="absolute left-1/2 top-[60px] -translate-x-1/2 rotate-[-3deg] rounded bg-[#f3efe6] px-3 py-1 font-hand text-2xl text-ink-950 shadow">Keep out! (Pinky)</div>
      </div>
    </Hotspot>
  );
}

function Shelf({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <Hotspot x={120} y={150} w={340} h={200} label="Trophy shelf" onClick={onClick} disabled={disabled}>
      <div className="absolute inset-x-0 bottom-0 h-4 rounded bg-[#5a3b26] shadow-lg" />
      <div className="absolute bottom-4 left-4 flex items-end gap-1">
        {['#d62839', '#ffb020', '#5cc8ff', '#c8ff3d', '#a78bfa', '#eef1f7'].map((c, i) => (
          <div key={c} className="w-6 rounded-sm" style={{ background: c, height: 90 + ((i * 17) % 40) }} />
        ))}
      </div>
      <div className="absolute bottom-4 right-10 text-[90px] leading-none">🏆</div>
    </Hotspot>
  );
}

function Ball({ onKick, disabled }: { onKick: () => void; disabled: boolean }) {
  const [k, setK] = useState(0);
  return (
    <motion.button
      type="button"
      aria-label="Kick the ball"
      disabled={disabled}
      className="absolute text-[90px] leading-none"
      style={{ left: 760, top: 640 }}
      animate={k ? { x: [0, -380, -560], y: [0, -420, -760], rotate: [0, 540, 900] } : { x: 0, y: 0, rotate: 0 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      onAnimationComplete={() => k && setTimeout(() => setK(0), 300)}
      onClick={() => {
        play('good');
        setK((n) => n + 1);
        onKick();
      }}
      whileHover={{ scale: 1.15 }}
    >
      ⚽
    </motion.button>
  );
}
