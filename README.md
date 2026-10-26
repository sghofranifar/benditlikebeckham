# Bend It Quest

A story-game companion app for reading **Bend It Like Beckham** by Narinder Dhami (Hodder, 2002) with a strong K07 class over **4 weeks**.

Students use the app to **see tasks and play games**. **All writing happens in their notebooks.**

## Use it in class

- **Live site:** https://sghofranifar.github.io/benditlikebeckham/
- **Offline:** open `index.html` (or `docs/index.html`) in any browser (iPad, laptop, Chromebook). It is one self-contained file and works offline. Only the fonts load from the internet.
- Progress is saved **in that browser on that device**.
- 🔑 **Teacher panel** (key icon, top right). Master password: `beckham7`. Type a name to see that student's password and codes; it can also unlock all levels (for demos) and reset a device.
- 🔔 **Call teacher** button on every screen.

### Logins and unlock codes

1. Each student logs in once per device in Jess's room with their **first name** + the shared **class code `JESS7`** (or their personal password). This opens Chapter 1. Change the class code in `src/data/config.ts` (`CLASS_CODE`).
2. **Chapter 1** is always open after login. **Code 1** opens Chapters 2–5. **Codes 2–6** each open two more levels (6–7, 8–9, 10–11, 12–13, Finale + Extra Time). A code also opens every earlier stage, so on a new device the student only needs their latest code.
3. A chapter's game opens once all its notebook tasks are ticked. Winning shows a **completion code** to copy into the notebook; the Teacher panel shows the correct one.
4. All codes are personal: they only work with that student's name.

**Class sheet (private):** put names (one per line) in `class/names.txt`, then run `npm run class-sheet`. It writes `class/class-sheet.html` (overview, login cards, code strips) and `class/class-codes.csv`. The `class/` folder is git-ignored: student names never go into the public app or repository.

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
- `levels.ts`: tasks, vocab, quotes, games
- `../lib/codes.ts`: unlock stages (which chapters each code opens)
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
