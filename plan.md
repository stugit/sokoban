# Sokoban — Project Plan

A browser-based recreation of the original Sokoban (Thinking Rabbit, 1982) with modern sci-fi graphics, procedural audio, and progressive level unlocking. Live at **https://stugit.github.io/sokoban/**.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Game engine | Phaser 3.88 via CDN — no build step |
| Graphics | Procedural Canvas 2D in `BootScene.js` — no image files |
| Audio | Web Audio API (`AudioManager`) — no audio files |
| Levels | XSB format in `levels.js` (90 original levels) |
| Progress | `localStorage` (`sokoban_reached`, `sokoban_completed`, `sokoban_best`) |
| Hosting | GitHub Pages — `main` branch root |

---

## File Structure

```
sokoban/
├── index.html                  Entry point; Phaser CDN + js/main.js (ES module)
├── style.css                   Dark background, touch-action: none, canvas centered
├── js/
│   ├── main.js                 Phaser game config, registers 4 scenes (800×600, Scale.FIT)
│   ├── levels.js               90 XSB levels + localStorage helpers
│   ├── audio.js                AudioManager — procedural drone + melody + SFX
│   └── scenes/
│       ├── BootScene.js        Generates all textures via Canvas 2D, starts MenuScene
│       ├── MenuScene.js        Animated title screen with floating crates
│       ├── LevelSelectScene.js 9×10 grid of level buttons with lock/complete state
│       └── GameScene.js        Full game loop — parsing, movement, undo, touch, win
└── .claude/
    └── settings.local.json     Whitelisted CLI commands (git, python server, npx)
```

---

## Scenes

### `BootScene`
- Generates all 8 textures procedurally using `this.textures.createCanvas()` + Canvas 2D API:
  `floor`, `wall`, `crate`, `crate_goal`, `goal`, `player`, `particle`, `lock`
- Starts `MenuScene` immediately after

### `MenuScene`
- Animated title ("SOKOBAN") with bob tween and floating background crates
- PLAY button → resumes from last reached level
- SELECT LEVEL button → goes to `LevelSelectScene`
- MUSIC ON/OFF toggle via `AudioManager.toggle()`
- First pointer event initialises `AudioContext` (browser autoplay policy)

### `LevelSelectScene`
- 9-column × 10-row grid of 44×44px buttons with 8px gaps
- Locked: dark with padlock icon
- Unlocked: level number, hover highlight
- Completed: green number + ✓ checkmark, green border

### `GameScene`
- `init(data)`: sets `levelIndex`, resets `moves`, `undoStack`, `animating`, `won`
- `create()`: parse → layout → draw tiles → spawn sprites → build HUD → setup input → `fadeIn(280)`
- HUD: level/total, move counter, **BEST (personal best from localStorage)**, UNDO, RESTART, ≡ menu
- Win overlay: move count, **"FIRST CLEAR!" / "★ NEW BEST! (was X)" / "BEST X moves"**, NEXT/SELECT buttons

---

## Core Game Logic

### Level Format (XSB)
```
#  = Wall        @  = Player         $  = Crate
.  = Goal        *  = Crate on Goal  +  = Player on Goal
   = Floor (space)
```
Tile constants: `T_EMPTY=0, T_FLOOR=1, T_WALL=2, T_GOAL=3`

### Movement
1. Player moves one tile per input (125ms tween).
2. Wall or empty cell → reject.
3. Crate in the way: check beyond cell — wall/empty/another crate → reject, otherwise push.
4. `_saveState()` snaps `{px, py, moves, crates[]}` to `undoStack` before every move (max 300 entries).

### Undo
Pops `undoStack`, teleports all sprites (no animation), restores crate textures.

### Win Detection
After each player tween completes: every crate's `(gx, gy)` must be in the `goals` array.
On win: `markCompleted()` → `saveBestMoves()` → win overlay after 550ms delay.

---

## Progress & Records

```
localStorage keys:
  sokoban_reached    — highest index unlocked (int)
  sokoban_completed  — array of completed level indices (JSON)
  sokoban_best       — object mapping level index → best move count (JSON)
```

- Level 0 always unlocked; each completion unlocks the next.
- `saveBestMoves(index, moves)` — saves and returns `true` if a new personal best.
- `getBestMoves(index)` — returns best move count or `null` if never completed.
- `resetProgress()` clears all three keys.

---

## Audio (Procedural — no files)

- `AudioContext` created on first pointer/key event.
- Background: 5 detuned sine-wave drone oscillators + pentatonic random melody via `setTimeout`.
- SFX: `playMove()`, `playPush()`, `playGoal()`, `playWin()`, `playUndo()`, `playMenu()`.
- `toggle()` mutes/unmutes via `masterGain`.

---

## Graphics (Procedural — no files)

All textures are 64×64 Canvas 2D drawings:

| Texture | Description |
|---|---|
| `floor` | Dark inset tile with grout border and corner dots |
| `wall` | Deep bevel (bright top-left, dark bottom-right) with lit inner panel |
| `crate` | Amber gradient with horizontal wood grain, outer rim glow |
| `crate_goal` | Teal gradient with grain, bright teal panel stroke, radial center glow |
| `goal` | Dual concentric diamonds with outer halo ring, bright center dot |
| `player` | Cyan body with ambient glow, tech stripe, glowing eyes, head highlight |
| `particle` | 16×16 cyan radial gradient — used for crate-on-goal bursts (16 particles) |
| `lock` | Geometric padlock for locked level buttons |

---

## Touch / Mobile

- Swipe detection in upper game area (threshold 22px, timeout 480ms).
- On-screen D-pad (bottom-right corner, 42×42px buttons) for explicit taps.
- `Scale.FIT` + `CENTER_BOTH` scales to any screen.
- `touch-action: none` in CSS prevents scroll interference.

---

## Deployment

Live at **https://stugit.github.io/sokoban/**

- Repo: `github.com/stugit/sokoban`, branch `main`, root `/`
- GitHub Pages enabled via `gh api repos/stugit/sokoban/pages`
- No build step — Phaser via CDN, native ES modules

---

## Status

### Done
- [x] All 90 original Sokoban levels (XSB format)
- [x] Full game loop — movement, pushing, undo (300-step stack), win detection
- [x] Procedural graphics — all 8 textures via Canvas 2D
- [x] Procedural audio — drone music + 6 SFX via Web Audio API
- [x] Level select with lock/complete state
- [x] Touch controls — swipe + on-screen D-pad
- [x] localStorage progress — unlocking, completion tracking
- [x] Personal best move tracking per level with new-record detection in win overlay
- [x] HUD shows live move count + personal best
- [x] Deployed to GitHub Pages

### Possible Next Steps
- [ ] Show optimal (minimum possible) move count per level as a target alongside personal best
- [ ] Animated goal tile (pulse/glow tween)
- [ ] Player direction — flip/rotate sprite based on last move direction
- [ ] Level-complete celebration — camera shake or screen flash
- [ ] README with play link and screenshot
