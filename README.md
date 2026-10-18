# Bend It Quest

A story-game companion app for reading **Bend It Like Beckham** by Narinder Dhami (Hodder, 2002) with a strong K07 class over **4 weeks**.

Students use the app to **see tasks and play games**. **All writing happens in their notebooks.**

## Use it in class

- **Live site:** https://sghofranifar.github.io/benditlikebeckham/
- **Offline:** open `index.html` (or `docs/index.html`) in any browser (iPad, laptop, Chromebook). It is one self-contained file and works offline. Only the fonts load from the internet.
- Progress is saved **in that browser on that device**.
- 🔑 **Teacher panel** (key icon, top right). Master password: `beckham7`. It shows every chapter password, can unlock all levels (for demos) and can reset a device.
- 🔔 **Call teacher** button on every screen.

### The unlock loop (anti-misuse)

1. The student enters their name once in Jess's room. **Only the teacher can change it** afterwards (Teacher panel → This device).
2. They read the chapter and **tick every notebook task** (Warm-Up, Vocab, Match Play, Cool-Down). The **game stays locked** until all are ticked.
3. They win the game and get a **completion code** (e.g. `L03-2-K7QF`) to copy into the notebook.
4. You check the notebook and the code (Teacher panel → Student codes shows the correct code for that name and star count), then give them their **personal 4-letter unlock code** for the next chapter. It only works for that student's name, so sharing codes doesn't help anyone.

Teacher panel: 🔑 icon, master password `beckham7`. Change the master password, `CODE_SECRET` (a new secret makes all old codes invalid) and the author details in `src/data/config.ts`.

| Week | Levels |
|---|---|
| 1 | Ch. 1–3 |
| 2 | Ch. 4–7 |
| 3 | Ch. 8–10 |
| 4 | Ch. 11–13 + Finale (Boss Match) |
| Any time | Extra Time: Women's Football Today (research unit) |

Optional photos: see `img/README.md`.

## What's inside

- **Jess's 3D bedroom** as the start screen, with Jess as an original animated character who talks to the player.
- **15 levels** (13 chapters + finale + Extra Time research unit). Each has pre-, while- and post-reading tasks focused on comprehension, language analysis, themes and cultural background, plus 10 vocabulary words verified against the chapter text and a Sprinter challenge.
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

## Licence

© 2026 Sebastian Ghofranifar, German Swiss International School (GSIS), Hong Kong. Licensed under CC BY 4.0. See `LICENSE.md`.
