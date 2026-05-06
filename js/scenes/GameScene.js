import { LEVELS, TOTAL_LEVELS, markCompleted } from '../levels.js';

const T_EMPTY = 0, T_FLOOR = 1, T_WALL = 2, T_GOAL = 3, DPAD = 120;

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.levelIndex  = data.levelIndex ?? 0;
    this.moves       = 0;
    this.undoStack   = [];
    this.animating   = false;
    this.won         = false;
  }

  create() {
    const { width: W, height: H } = this.cameras.main;

    this._parseLevel();
    this._calcLayout(W, H);
    this._drawTiles();
    this._spawnSprites();
    this._buildHUD(W, H);
    this._setupKeys();
    this._setupTouch(W, H);

    this.cameras.main.fadeIn(280, 0, 0, 0);
  }

  // ─── Level parsing ───────────────────────────────────────────────────────
  _parseLevel() {
    const rows = LEVELS[this.levelIndex].map;
    this.grid  = [];
    this.goals = [];
    this.crates = [];
    this.playerPos = { x: 0, y: 0 };
    this.lw = 0;
    this.lh = rows.length;

    rows.forEach((row, y) => {
      this.grid[y] = [];
      this.lw = Math.max(this.lw, row.length);
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if      (ch === '#') this.grid[y][x] = T_WALL;
        else if (ch === '.') { this.grid[y][x] = T_GOAL;  this.goals.push({ x, y }); }
        else if (ch === '$') { this.grid[y][x] = T_FLOOR; this.crates.push({ x, y }); }
        else if (ch === '*') { this.grid[y][x] = T_GOAL;  this.goals.push({ x, y }); this.crates.push({ x, y }); }
        else if (ch === '@') { this.grid[y][x] = T_FLOOR; this.playerPos = { x, y }; }
        else if (ch === '+') { this.grid[y][x] = T_GOAL;  this.goals.push({ x, y }); this.playerPos = { x, y }; }
        else if (ch === ' ') this.grid[y][x] = T_FLOOR;
        else                 this.grid[y][x] = T_EMPTY;
      }
      for (let x = row.length; x < this.lw; x++) this.grid[y][x] = T_EMPTY;
    });
  }

  // ─── Layout ──────────────────────────────────────────────────────────────
  _calcLayout(W, H) {
    const HUD = 64, PAD = 20;
    const availW = W - PAD * 2;
    const availH = H - HUD - PAD * 2 - DPAD;
    this.ts = Math.min(64, Math.floor(availW / this.lw), Math.floor(availH / this.lh));
    this.ox = Math.floor(PAD + (availW - this.lw * this.ts) / 2);
    this.oy = Math.floor(HUD + PAD + (availH - this.lh * this.ts) / 2);
  }

  px(gx) { return this.ox + gx * this.ts + this.ts / 2; }
  py(gy) { return this.oy + gy * this.ts + this.ts / 2; }

  // ─── Tiles ───────────────────────────────────────────────────────────────
  _drawTiles() {
    const sc = this.ts / 64;
    for (let y = 0; y < this.lh; y++) {
      for (let x = 0; x < this.lw; x++) {
        const t = this.grid[y][x];
        if (t === T_EMPTY) continue;
        const key = t === T_WALL ? 'wall' : t === T_GOAL ? 'goal' : 'floor';
        this.add.image(this.px(x), this.py(y), key).setScale(sc);
      }
    }
  }

  // ─── Sprites ─────────────────────────────────────────────────────────────
  _spawnSprites() {
    const sc = this.ts / 64;
    this.crateSprites = this.crates.map(({ x, y }) => {
      const onGoal = this.goals.some(g => g.x === x && g.y === y);
      const spr = this.add.image(this.px(x), this.py(y), onGoal ? 'crate_goal' : 'crate').setScale(sc);
      spr.gx = x; spr.gy = y;
      return spr;
    });
    const pp = this.playerPos;
    this.player = this.add.image(this.px(pp.x), this.py(pp.y), 'player').setScale(sc);
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────
  _buildHUD(W, H) {
    const bar = this.add.graphics();
    bar.fillStyle(0x0b0a16, 1);
    bar.fillRect(0, 0, W, 58);
    bar.lineStyle(1, 0x1e1c38, 1);
    bar.lineBetween(0, 58, W, 58);

    this.levelTxt = this.add.text(16, 15, `LEVEL  ${this.levelIndex + 1} / ${TOTAL_LEVELS}`, {
      fontFamily: 'Space Grotesk', fontSize: '13px', color: '#504d78',
    });
    this.movesTxt = this.add.text(16, 34, `MOVES  0`, {
      fontFamily: 'Space Grotesk', fontSize: '13px', color: '#a7a9be',
    });

    this._hudBtn(W - 165, 29, 62, 'UNDO',    '#a7a9be', () => this._undo());
    this._hudBtn(W - 95,  29, 68, 'RESTART', '#a7a9be', () => this.scene.restart({ levelIndex: this.levelIndex }));
    this._hudBtn(W - 22,  29, 32, '≡',       '#a7a9be', () => { window._audio?.playMenu(); this.scene.start('MenuScene'); });
  }

  _hudBtn(x, y, w, label, color, cb) {
    const h = 28;
    const g = this.add.graphics();
    const draw = (hov) => {
      g.clear();
      g.fillStyle(hov ? 0x252340 : 0x131228, 1);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
      g.lineStyle(1, 0x353562, 0.75);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    };
    draw(false);
    this.add.text(x, y, label, {
      fontFamily: 'Space Grotesk', fontSize: '11px', fontStyle: 'bold', color,
    }).setOrigin(0.5);
    const z = this.add.zone(x, y, w, h).setInteractive({ cursor: 'pointer' });
    z.on('pointerover', () => draw(true));
    z.on('pointerout',  () => draw(false));
    z.on('pointerdown', cb);
  }

  // ─── Input ───────────────────────────────────────────────────────────────
  _setupKeys() {
    this.input.keyboard.on('keydown', (e) => {
      // Prevent browser scrolling for game keys
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'z', 'r'];
      if (gameKeys.includes(e.key.toLowerCase()) || gameKeys.includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':    case 'w': case 'W': this._move(0, -1); break;
        case 'ArrowDown':  case 's': case 'S': this._move(0,  1); break;
        case 'ArrowLeft':  case 'a': case 'A': this._move(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': this._move( 1, 0); break;
        case 'z': case 'Z': this._undo();    break;
        case 'r': case 'R': this.scene.restart({ levelIndex: this.levelIndex }); break;
      }
    });
  }

  _setupTouch(W, H) {
    // Swipe detection (upper game area)
    let sx, sy, st;
    this.input.on('pointerdown', (p) => {
      if (p.y > H - 120) return;
      sx = p.x; sy = p.y; st = Date.now();
    });
    this.input.on('pointerup', (p) => {
      if (!sx || p.y > H - 120) return;
      const dx = p.x - sx, dy = p.y - sy;
      if (Math.sqrt(dx * dx + dy * dy) < 22 || Date.now() - st > 480) return;
      if (Math.abs(dx) > Math.abs(dy)) this._move(dx > 0 ? 1 : -1, 0);
      else                              this._move(0, dy > 0 ? 1 : -1);
      sx = null;
    });

    // On-screen D-pad (bottom-right)
    const DCX = W - 80, DCY = H - 68, BSZ = 42;
    const dirs = [
      { lbl: '▲', dx:  0, dy: -1, ox:  0,    oy: -BSZ },
      { lbl: '▼', dx:  0, dy:  1, ox:  0,    oy:  BSZ },
      { lbl: '◀', dx: -1, dy:  0, ox: -BSZ,  oy:  0   },
      { lbl: '▶', dx:  1, dy:  0, ox:  BSZ,  oy:  0   },
    ];
    dirs.forEach(({ lbl, dx, dy, ox, oy }) => {
      const bx = DCX + ox, by = DCY + oy;
      const bg = this.add.graphics();
      const draw = (press) => {
        bg.clear();
        bg.fillStyle(press ? 0x3a3760 : 0x181630, 0.88);
        bg.fillRoundedRect(bx - BSZ / 2, by - BSZ / 2, BSZ, BSZ, 7);
        bg.lineStyle(1, 0x3a3880, 0.65);
        bg.strokeRoundedRect(bx - BSZ / 2, by - BSZ / 2, BSZ, BSZ, 7);
      };
      draw(false);
      this.add.text(bx, by, lbl, {
        fontFamily: 'Space Grotesk', fontSize: '14px', color: '#706da0',
      }).setOrigin(0.5);
      const z = this.add.zone(bx, by, BSZ, BSZ).setInteractive();
      z.on('pointerdown', () => { draw(true);  this._move(dx, dy); });
      z.on('pointerup',   () => draw(false));
      z.on('pointerout',  () => draw(false));
    });
  }

  // ─── Game logic ──────────────────────────────────────────────────────────
  _tile(x, y) {
    if (y < 0 || y >= this.lh || x < 0 || x >= this.lw) return T_WALL;
    return this.grid[y]?.[x] ?? T_EMPTY;
  }

  _crateAt(x, y) {
    return this.crateSprites.find(c => c.gx === x && c.gy === y);
  }

  _onGoal(x, y) {
    return this.goals.some(g => g.x === x && g.y === y);
  }

  _saveState() {
    this.undoStack.push({
      px: this.playerPos.x,
      py: this.playerPos.y,
      moves: this.moves,
      crates: this.crateSprites.map(c => ({ gx: c.gx, gy: c.gy })),
    });
    if (this.undoStack.length > 300) this.undoStack.shift();
  }

  _move(dx, dy) {
    if (this.animating || this.won) return;

    const nx = this.playerPos.x + dx;
    const ny = this.playerPos.y + dy;
    const tile = this._tile(nx, ny);
    if (tile === T_WALL || tile === T_EMPTY) return;

    const crate = this._crateAt(nx, ny);
    if (crate) {
      const bx = nx + dx, by = ny + dy;
      const bt = this._tile(bx, by);
      if (bt === T_WALL || bt === T_EMPTY || this._crateAt(bx, by)) return;
      this._saveState();
      this._animCrate(crate, bx, by);
      window._audio?.init(); window._audio?.resume(); window._audio?.playPush();
    } else {
      this._saveState();
      window._audio?.init(); window._audio?.resume(); window._audio?.playMove();
    }

    this.playerPos.x = nx; this.playerPos.y = ny;
    this.moves++;
    this.movesTxt.setText(`MOVES  ${this.moves}`);
    this.animating = true;

    this.tweens.add({
      targets: this.player,
      x: this.px(nx), y: this.py(ny),
      duration: 125,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.animating = false;
        this._checkWin();
      },
    });
  }

  _animCrate(crate, gx, gy) {
    crate.gx = gx; crate.gy = gy;
    this.tweens.add({
      targets: crate,
      x: this.px(gx), y: this.py(gy),
      duration: 125,
      ease: 'Quad.easeOut',
      onComplete: () => {
        const on = this._onGoal(gx, gy);
        crate.setTexture(on ? 'crate_goal' : 'crate');
        if (on) {
          window._audio?.playGoal();
          const sc = this.ts / 64;
          // Particle burst
          const em = this.add.particles(this.px(gx), this.py(gy), 'particle', {
            speed: { min: 35, max: 110 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.9, end: 0 },
            lifespan: 550,
            emitting: false,
          });
          em.explode(16);
          this.time.delayedCall(750, () => em.destroy());
          // Scale bounce
          this.tweens.add({
            targets: crate,
            scaleX: sc * 1.18, scaleY: sc * 1.18,
            duration: 75,
            ease: 'Quad.easeOut',
            yoyo: true,
          });
        }
      },
    });
  }

  _undo() {
    if (!this.undoStack.length || this.animating || this.won) return;
    window._audio?.playUndo();
    const s = this.undoStack.pop();
    this.playerPos.x = s.px; this.playerPos.y = s.py;
    this.moves = s.moves;
    this.movesTxt.setText(`MOVES  ${this.moves}`);
    this.player.setPosition(this.px(s.px), this.py(s.py));
    s.crates.forEach((saved, i) => {
      const spr = this.crateSprites[i];
      spr.gx = saved.gx; spr.gy = saved.gy;
      spr.setPosition(this.px(saved.gx), this.py(saved.gy));
      spr.setTexture(this._onGoal(saved.gx, saved.gy) ? 'crate_goal' : 'crate');
    });
  }

  _checkWin() {
    if (this.crateSprites.every(c => this._onGoal(c.gx, c.gy))) {
      this.won = true;
      markCompleted(this.levelIndex);
      window._audio?.playWin();
      this.time.delayedCall(550, () => this._winOverlay());
    }
  }

  // ─── Win overlay ─────────────────────────────────────────────────────────
  _winOverlay() {
    const { width: W, height: H } = this.cameras.main;
    const cx = W / 2, cy = H / 2;

    // Dim background
    const dim = this.add.graphics();
    dim.fillStyle(0x000000, 0);
    dim.fillRect(0, 0, W, H);
    this.tweens.add({ targets: dim, fillAlpha: 0.72, duration: 320 });

    // Panel
    const pw = 370, ph = 240;
    const panel = this.add.graphics();
    panel.fillStyle(0x14132a, 0.97);
    panel.fillRoundedRect(cx - pw / 2, cy - ph / 2, pw, ph, 16);
    panel.lineStyle(2, 0x00e5ff, 0.85);
    panel.strokeRoundedRect(cx - pw / 2, cy - ph / 2, pw, ph, 16);
    panel.setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, duration: 320 });

    const items = [];

    items.push(this.add.text(cx, cy - 88, 'LEVEL  COMPLETE', {
      fontFamily: 'Space Grotesk', fontSize: '20px', fontStyle: 'bold', color: '#00e5ff',
    }).setOrigin(0.5).setAlpha(0));

    items.push(this.add.text(cx, cy - 58, LEVELS[this.levelIndex].title, {
      fontFamily: 'Space Grotesk', fontSize: '14px', color: '#504d78',
    }).setOrigin(0.5).setAlpha(0));

    items.push(this.add.text(cx, cy - 14, `${this.moves}`, {
      fontFamily: 'Space Grotesk', fontSize: '46px', fontStyle: 'bold', color: '#f0eff4',
    }).setOrigin(0.5).setAlpha(0));

    items.push(this.add.text(cx, cy + 28, 'moves', {
      fontFamily: 'Space Grotesk', fontSize: '14px', color: '#504d78',
    }).setOrigin(0.5).setAlpha(0));

    this.tweens.add({ targets: items, alpha: 1, duration: 380, delay: 260 });

    const isLast = this.levelIndex >= TOTAL_LEVELS - 1;

    if (isLast) {
      this._overlayBtn(cx, cy + 76, 210, '★  ALL DONE!  ★', '#ffcc44', 0xffaa00, () => {
        this.scene.start('MenuScene');
      });
    } else {
      this._overlayBtn(cx, cy + 76, 210, 'NEXT LEVEL  →', '#00e5ff', 0x00e5ff, () => {
        this.scene.start('GameScene', { levelIndex: this.levelIndex + 1 });
      });
    }

    this._overlayBtn(cx, cy + 120, 210, 'SELECT LEVEL', '#a7a9be', 0x4040a0, () => {
      this.scene.start('LevelSelectScene');
    });
  }

  _overlayBtn(x, y, w, label, textColor, borderColor, cb) {
    const h = 40;
    const bg = this.add.graphics();
    const draw = (hov) => {
      bg.clear();
      bg.fillStyle(hov ? 0x1e1c3a : 0x0d0c1a, 1);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 9);
      bg.lineStyle(2, borderColor, hov ? 1 : 0.65);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 9);
    };
    draw(false);
    this.add.text(x, y, label, {
      fontFamily: 'Space Grotesk', fontSize: '15px', fontStyle: 'bold', color: textColor,
    }).setOrigin(0.5);
    const z = this.add.zone(x, y, w, h).setInteractive({ cursor: 'pointer' });
    z.on('pointerover',  () => draw(true));
    z.on('pointerout',   () => draw(false));
    z.on('pointerdown',  cb);
  }
}
