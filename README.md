# Lucky Queens
### Open-source Classic Queens Game

A browser-based logic puzzle where you place exactly one queen in every row, column, and colour region — with no two queens touching, not even diagonally. Built with React 19, TypeScript, and Tailwind CSS v4.

---

## Gameplay

Place one queen per row, per column, and per colour region. No two queens may occupy adjacent cells in any direction — including diagonals. Every queen must have at least one empty cell separating it from all others.

**Cell interaction cycle:** empty → ✕ (cross) → ♛ (queen) → empty

---

## Features

- **Procedural puzzle generation** — every game is a unique, freshly generated board using a seeded PRNG and flood-fill region builder
- **3 difficulty levels** — Easy (compact blob regions), Medium (organic irregular shapes), Hard (wide snaking regions)
- **4 board sizes** — 8×8, 10×10, 12×12, 15×15
- **Auto-fill crosses** — automatically marks invalid cells when a queen is placed, and cleanly undoes them if the queen is removed
- **Hint system** — reveals the next correct queen position; hints are limited per difficulty (Easy: 8, Medium: 4, Hard: 2)
- **Drag-to-cross** — click and drag across empty cells to mark a run of eliminations in one gesture
- **Live timer & move counter** — tracks time elapsed and total moves per session
- **Dark / light theme** — toggleable from the settings panel
- **Victory screen** — shows final time and move count on puzzle completion

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui, Base UI, Vaul drawer |
| Icons | Lucide React |
| Build tool | Vite 8 |

---

## Getting Started

### install dependencies
```bash
npm install
```
### start dev server
```bash
npm run dev
```
### production build
```bash
npm run build
```
### preview production build
```bash
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui primitives (button, drawer, select, switch, alert-dialog)
│   ├── Board.tsx    # renders the game grid
│   └── Cell.tsx     # individual cell with mark state and interaction handlers
├── hooks/
│   └── useGameLogic.ts  # all game state: board, moves, timer, hints, auto-cross, win detection
├── locales/
│   └── en.ts        # all ui strings, rules, controls guide, and difficulty descriptions
├── generator.ts     # procedural level generation (queen placement + flood-fill regions)
├── solver.ts        # backtracking solver used by the hint system
├── levels.ts        # board size / difficulty constants and hint counts
└── types.ts         # shared TypeScript types
```

---

## How the Generator Works

1. **Queen placement** — a backtracking algorithm places N non-conflicting queens on an N×N board using a seeded PRNG for reproducibility
2. **Region flood-fill** — each queen seeds a region that expands outward; the expansion strategy varies by difficulty (stack for Easy, queue for Hard, random for Medium)
3. **Single-cell region tuning** — a post-processing pass enforces per-difficulty limits on single-cell regions to control puzzle feel

---

## License

Open-source — see repository for licence details.

#### Developed by
### Neama Kazemi
### at LuckyGene Indie Studio
Email: [neama@luckygene.net](mailto:neama@luckygene.net)