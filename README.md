# Bend It Quest

A story-game companion app for reading **Bend It Like Beckham** by Narinder Dhami (Hodder, 2002) with a strong Year 7 (K07) class over **4 weeks**.

Students use the app to **see tasks and play games**. **All writing happens in their notebooks.**

## Use it in class

- **Live site:** https://sghofranifar.github.io/benditlikebeckham/
- **Offline:** open `index.html` (or `docs/index.html`) in any browser (iPad, laptop, Chromebook). It is one self-contained file and works offline. Only the fonts load from the internet.
- Progress is saved **in that browser on that device**.
- 🔑 **Teacher panel** (key icon, top right). Master password: `beckham7`. It shows every chapter password, can unlock all levels (for demos) and can reset a device.
- 🔔 **Call teacher** button on every screen.

### The unlock loop

1. A student reads the chapter and completes the tasks in their notebook (Warm-Up → Vocab Drill → Match Play → Cool-Down → optional ⚡ Sprinter).
2. They win the chapter's mini-game (≥ 60%), which earns stars, XP and character cards.
3. They show you their notebook, and you tell them the **password for the next chapter**.

| Week | Levels |
|---|---|
| 1 | Ch. 1–3 |
| 2 | Ch. 4–7 |
| 3 | Ch. 8–10 |
| 4 | Ch. 11–13 + Finale (Boss Match) |

Passwords: Ch.1 open · Ch.2 `trial` · Ch.3 `boots` · Ch.4 `hmv` · Ch.5 `chiswick` · Ch.6 `predator` · Ch.7 `busstop` · Ch.8 `nairobi` · Ch.9 `hamburg` · Ch.10 `crossbar` · Ch.11 `bandstand` · Ch.12 `jaggo` · Ch.13 `freekick` · Finale `santaclara`

## What's inside

- **14 levels** (one per chapter + finale). Each has pre-, while- and post-reading tasks focused on comprehension, language analysis, themes and cultural background, plus 10 vocabulary words verified against the chapter text and a Sprinter challenge.
- **6 game engines**: Memory Match, Penalty Shoot-out (the ball bends!), Word Scramble, Sorting Game, Timeline, True/False Sprint.
- **13 character cards**, **12 source files** (the Archive), Theme Tracker, XP ranks, badges, and a printable **Season Report**.
- Chapter 10 contains a racist slur. The app never prints it and starts that chapter with a discussion-rules task.

## Edit content

All content is plain data in `src/data/`:
- `levels.ts`: tasks, vocab, quotes, games, passwords
- `characters.ts`: squad cards
- `sources.ts`: cultural background

## Develop

```bash
npm install
npm run dev     # live preview (opens dev.html)
npm run build   # writes index.html + docs/index.html (single file)
```

Built with React, TypeScript, Tailwind CSS, Framer Motion (spring physics) and Zustand (state).
