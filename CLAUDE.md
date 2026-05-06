# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

No build step. Serve the project root with any static server:

```
python -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080`. **Cannot open `index.html` directly** — ES modules require HTTP.

## Project Stack

| Layer | Choice |
|---|---|
| Engine | Phaser 3.88 via CDN (`phaser.min.js`) |
| Modules | Native ES modules (`type="module"`) |
| Graphics | Procedural Canvas 2D in `BootScene.js` — no image files |
| Audio | Web Audio API (`AudioManager` in `audio.js`) — no audio files |
| Progress | `localStorage` (`sokoban_reached`, `sokoban_completed`) |
| Hosting | GitHub Pages (static, no backend) |

## File Structure

```
js/
  main.js              Phaser game config, registers 4 scenes
  levels.js            90 XSB-format level definitions + localStorage helpers
  audio.js             AudioManager — procedural drone + melody + SFX
  scenes/
    BootScene.js       Generates all textures via Canvas 2D, then starts MenuScene
    MenuScene.js       Animated title screen with floating crates
    LevelSelectScene.js  9×10 grid of level buttons with lock/complete state
    GameScene.js       Full game loop — parsing, movement, undo, touch, win
```

## Architecture Notes

**Texture pipeline**: `BootScene` runs first and draws every tile/sprite to `this.textures.createCanvas(key, w, h)` canvases, then calls `.refresh()`. Phaser uses these as normal texture keys everywhere else. No image files needed.

**Level format (XSB)**: `# @ $ . * +` — wall, player, crate, goal, crate-on-goal, player-on-goal. `LEVELS` array in `levels.js`; `markCompleted(index)` / `isLevelUnlocked(index)` wrap `localStorage`.

**Tile types** in `GameScene`: `T_EMPTY=0, T_FLOOR=1, T_WALL=2, T_GOAL=3`. Empty cells are impassable. `_parseLevel()` builds the grid and extracts `crateSprites`, `goals`, `playerPos`.

**Undo**: `_saveState()` pushes `{px, py, moves, crates[]}` onto `undoStack` before every move. `_undo()` pops and teleports all sprites (no animation on undo).

**Audio init**: `AudioContext` creation is deferred to first pointer/key event (browser autoplay policy). All sound methods guard with `if (!this.ctx) return`.

**Touch controls**: Swipe detection in the upper portion of the canvas; on-screen D-pad (bottom-right) for explicit taps. Both call `_move(dx, dy)`.

**Win detection**: Called after each player tween (`onComplete`). Checks every crate's `(gx,gy)` against the `goals` array. On win, `markCompleted()` saves to `localStorage` and the overlay appears.

## Deploying to GitHub Pages

1. `git init && git add . && git commit -m "initial"`
2. Create repo on GitHub, push `main` branch
3. Settings → Pages → Source: `main` / `(root)`
4. Live at `https://<username>.github.io/<repo>/`

## Updating Levels

Edit `js/levels.js`. Each entry is `{ title: string, map: string[] }`. XSB characters: `#` wall, `@` player, `$` crate, `.` goal, `*` crate-on-goal, `+` player-on-goal, space for floor/empty.

To reset player progress during development:
```js
localStorage.clear(); // in browser console
```
