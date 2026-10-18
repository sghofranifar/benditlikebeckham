import { motion } from 'framer-motion';
import { useGame } from '../store';
import { LEVELS } from '../data/levels';
import { CHARACTERS } from '../data/characters';
import { SOURCES } from '../data/sources';
import { badges, levelProgress, rankFor, RANKS, totalXP, unlockedCards } from '../lib/progress';
import { accentHex, spring } from '../lib/motion';
import { Reveal, SpringButton, Stars } from '../components/ui';

// End-of-season summary screen ("Season Report"). Printable.
export function SummaryScreen() {
  const s = useGame();
  const xp = totalXP(s);
  const rank = rankFor(xp);
  const tasks = Object.keys(s.doneTasks);
  const vocab = tasks.filter((t) => t.endsWith('-vocab')).length;
  const sprints = tasks.filter((t) => t.endsWith('-sprint')).length;
  const stars = Object.values(s.gameStars).reduce((a, b) => a + b, 0);
  const complete = LEVELS.filter((l) => levelProgress(l, s).complete).length;
  const bs = badges(s);

  const tiles = [
    { label: 'Total XP', value: xp, col: '#c8ff3d' },
    { label: 'Chapters complete', value: `${complete}/${LEVELS.length}`, col: '#5cc8ff' },
    { label: 'Notebook tasks', value: tasks.length, col: '#ffb020' },
    { label: 'Words learned', value: vocab * 10, col: '#ff4d8d' },
    { label: 'Sprinter challenges', value: sprints, col: '#a78bfa' },
    { label: 'Game stars', value: `${stars}/${LEVELS.length * 3}`, col: '#ffb020' },
    { label: 'Squad cards', value: `${unlockedCards(s).length}/${CHARACTERS.length}`, col: '#34d399' },
    { label: 'Source files', value: `${Object.keys(s.seenSources).length}/${SOURCES.length}`, col: '#ff7a59' },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      <Reveal>
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-lime">Season report · {s.playerName || 'Player'}</p>
        <h1 className="display t-hero mt-1">
          Full time,
          <br />
          <span className="text-lime">{rank.name}</span>
        </h1>
      </Reveal>

      {/* Rank ladder */}
      <Reveal className="mt-8">
        <div className="glass p-6">
          <div className="flex flex-wrap gap-2">
            {RANKS.map((r, i) => (
              <motion.div key={r.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring.soft, delay: i * 0.06 }} className={`flex-1 rounded-2xl border px-3 py-3 text-center ${i <= rank.index ? 'border-lime/50 bg-lime/10' : 'border-white/10 opacity-50'}`}>
                <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.16em] text-chalk-mute">{r.xp} XP</div>
                <div className="display text-lg">{r.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((t, i) => (
          <Reveal key={t.label} delay={(i % 4) * 0.05}>
            <div className="glass p-5">
              <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-chalk-dim">{t.label}</div>
              <div className="display mt-1 text-5xl tabular-nums" style={{ color: t.col }}>
                {t.value}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-4">
        <div className="glass p-6">
          <h2 className="display t-h2 mb-4">Badges</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bs.map((b) => (
              <div key={b.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${b.got ? 'border-lime/40 bg-lime/[0.06]' : 'border-white/10 opacity-50'}`}>
                <span className={`text-3xl ${b.got ? '' : 'grayscale'}`}>{b.icon}</span>
                <div>
                  <div className="font-extrabold">{b.name}</div>
                  <div className="text-xs text-chalk-dim">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-4">
        <div className="glass overflow-x-auto p-6">
          <h2 className="display t-h2 mb-4">Results by chapter</h2>
          <table className="w-full text-left text-sm">
            <tbody>
              {LEVELS.map((l) => {
                const p = levelProgress(l, s);
                return (
                  <tr key={l.id} className="border-t border-white/5">
                    <td className="display py-2 pr-3 text-xl" style={{ color: accentHex[l.accent] }}>
                      {l.id === 14 ? 'FT' : l.extra ? 'XT' : String(l.id).padStart(2, '0')}
                    </td>
                    <td className="py-2 pr-3 font-bold">{l.title}</td>
                    <td className="w-1/3 py-2 pr-3">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${p.pct * 100}%`, background: accentHex[l.accent] }} />
                      </div>
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-chalk-dim">
                      {p.done}/{p.total}
                    </td>
                    <td className="py-2">
                      <Stars n={s.gameStars[l.id] ?? 0} size="text-sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal className="mt-4">
        <div className="glass p-6">
          <h2 className="display t-h2">✏️ Final reflection (notebook)</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-chalk/90">
            <li>Which chapter changed your opinion of a character the most? Why?</li>
            <li>Which task taught you the most about language analysis?</li>
            <li>What did you learn about the real world behind the novel (the Archive)?</li>
            <li>Jess finally chooses "no more secrets, no more lies". What is one thing YOU will do differently after reading this book?</li>
          </ol>
        </div>
      </Reveal>

      <div className="no-print mt-8 flex flex-wrap gap-3">
        <SpringButton onClick={() => window.print()}>🖨 Print report</SpringButton>
        <SpringButton variant="outline" onClick={() => s.go({ name: 'hub' })}>
          Back to season
        </SpringButton>
      </div>
    </main>
  );
}
