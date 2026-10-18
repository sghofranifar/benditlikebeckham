import { CHARACTERS } from '../data/characters';
import { useGame } from '../store';
import { unlockedCards } from '../lib/progress';
import { CharacterCard } from '../components/CharacterCard';
import { Reveal } from '../components/ui';

export function SquadScreen() {
  const s = useGame();
  const have = new Set(unlockedCards(s).map((c) => c.id));
  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <Reveal>
        <h1 className="display t-hero">The Squad</h1>
        <p className="mt-2 max-w-2xl text-chalk-dim">
          Character cards unlock when you win chapter games. Tap a card to flip it. The trait scores are there to be argued with: in your notebook, pick one score you disagree with and prove it with a quotation.
        </p>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CHARACTERS.map((c, i) => (
          <Reveal key={c.id} delay={(i % 4) * 0.05}>
            <CharacterCard c={c} locked={!have.has(c.id)} />
          </Reveal>
        ))}
      </div>
    </main>
  );
}
