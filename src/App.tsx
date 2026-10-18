import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useGame } from './store';
import { Backdrop, Grain } from './components/Backdrop';
import { TopBar } from './components/TopBar';
import { StartScreen } from './screens/StartScreen';
import { HubScreen } from './screens/HubScreen';
import { LevelScreen } from './screens/LevelScreen';
import { GameScreen } from './screens/GameScreen';
import { SquadScreen } from './screens/SquadScreen';
import { ArchiveScreen } from './screens/ArchiveScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { levelById } from './data/levels';
import { accentHex, spring } from './lib/motion';

// Single-page app: one store decides which screen is shown; screens cross-fade with springs.
export default function App() {
  const screen = useGame((s) => s.screen);
  const unlocked = useGame((s) => s.unlocked);

  // Guard: a locked level can never be opened directly.
  const safe = (screen.name === 'level' || screen.name === 'game') && !unlocked.includes(screen.id) ? { name: 'hub' as const } : screen;
  const accent = safe.name === 'level' || safe.name === 'game' ? accentHex[levelById(safe.id).accent] : '#c8ff3d';
  const key = 'id' in safe ? `${safe.name}-${safe.id}` : safe.name;

  return (
    <MotionConfig reducedMotion="user">
      <Backdrop accent={accent} />
      <Grain />
      {safe.name !== 'start' && <TopBar />}
      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={spring.soft}>
          {safe.name === 'start' && <StartScreen />}
          {safe.name === 'hub' && <HubScreen />}
          {safe.name === 'level' && <LevelScreen id={safe.id} />}
          {safe.name === 'game' && <GameScreen id={safe.id} />}
          {safe.name === 'squad' && <SquadScreen />}
          {safe.name === 'archive' && <ArchiveScreen />}
          {safe.name === 'summary' && <SummaryScreen />}
        </motion.div>
      </AnimatePresence>
      {safe.name !== 'start' && (
        <footer className="no-print mx-auto max-w-7xl px-4 pb-10 text-xs text-chalk-mute sm:px-6">
          Companion to <i>Bend It Like Beckham</i> by Narinder Dhami (Hodder Children's Books, 2002), based on the screenplay by Gurinder Chadha, Guljit Bindra &amp; Paul Mayeda Berges. For classroom use. All writing happens in your notebook.
        </footer>
      )}
    </MotionConfig>
  );
}
