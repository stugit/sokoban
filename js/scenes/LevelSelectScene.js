import { TOTAL_LEVELS, isLevelUnlocked, isLevelCompleted } from '../levels.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelectScene'); }

  create() {
    const { width: W, height: H } = this.cameras.main;
    const cx = W / 2;

    // Background grid
    const g = this.add.graphics();
    g.lineStyle(1, 0x1a1835, 0.6);
    for (let x = 0; x <= W; x += 48) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 48) g.lineBetween(0, y, W, y);

    // Header bar
    const hdr = this.add.graphics();
    hdr.fillStyle(0x0f0e17, 1);
    hdr.fillRect(0, 0, W, 60);
    hdr.lineStyle(1, 0x1e1c38, 1);
    hdr.lineBetween(0, 60, W, 60);

    this.add.text(cx, 30, 'SELECT LEVEL', {
      fontFamily: 'Space Grotesk',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f0eff4',
      letterSpacing: 3,
    }).setOrigin(0.5);

    // Progress info
    const unlocked = parseInt(localStorage.getItem('sokoban_reached') ?? '0') + 1;
    const completed = JSON.parse(localStorage.getItem('sokoban_completed') ?? '[]').length;
    this.add.text(W - 16, 30, `${completed} / ${TOTAL_LEVELS} complete`, {
      fontFamily: 'Space Grotesk',
      fontSize: '12px',
      color: '#504d78',
    }).setOrigin(1, 0.5);

    // Back button
    this._backBtn();

    // Level grid: 9 cols × 10 rows, buttons 44×44 with 8px gap
    const COLS = 9;
    const BTN = 44;
    const GAP = 8;
    const gridW = COLS * BTN + (COLS - 1) * GAP;
    const startX = (W - gridW) / 2;
    const startY = 76;

    for (let i = 0; i < TOTAL_LEVELS; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const bx = startX + col * (BTN + GAP) + BTN / 2;
      const by = startY + row * (BTN + GAP) + BTN / 2;
      this._levelBtn(bx, by, i, BTN);
    }
  }

  _levelBtn(x, y, idx, size) {
    const unlocked  = isLevelUnlocked(idx);
    const completed = isLevelCompleted(idx);
    const half = size / 2;

    const bg = this.add.graphics();
    const draw = (hover) => {
      bg.clear();
      if (!unlocked) {
        bg.fillStyle(0x111020, 1);
        bg.fillRoundedRect(x - half, y - half, size, size, 7);
        bg.lineStyle(1, 0x201e38, 1);
        bg.strokeRoundedRect(x - half, y - half, size, size, 7);
      } else if (completed) {
        bg.fillStyle(hover ? 0x1a3830 : 0x0d2318, 1);
        bg.fillRoundedRect(x - half, y - half, size, size, 7);
        bg.lineStyle(2, 0x00c880, hover ? 1 : 0.65);
        bg.strokeRoundedRect(x - half, y - half, size, size, 7);
      } else {
        bg.fillStyle(hover ? 0x252348 : 0x171530, 1);
        bg.fillRoundedRect(x - half, y - half, size, size, 7);
        bg.lineStyle(2, 0x4040a0, hover ? 1 : 0.55);
        bg.strokeRoundedRect(x - half, y - half, size, size, 7);
      }
    };
    draw(false);

    if (!unlocked) {
      this.add.image(x, y, 'lock').setScale(0.72).setAlpha(0.45);
    } else {
      this.add.text(x, y + (completed ? -5 : 0), `${idx + 1}`, {
        fontFamily: 'Space Grotesk',
        fontSize: '14px',
        fontStyle: 'bold',
        color: completed ? '#00c880' : '#d0cff0',
      }).setOrigin(0.5);
      if (completed) {
        this.add.text(x, y + 9, '✓', {
          fontFamily: 'Space Grotesk',
          fontSize: '10px',
          color: '#00c880',
        }).setOrigin(0.5);
      }
      const zone = this.add.zone(x, y, size, size).setInteractive({ cursor: 'pointer' });
      zone.on('pointerover',  () => draw(true));
      zone.on('pointerout',   () => draw(false));
      zone.on('pointerdown',  () => {
        window._audio?.playMenu();
        this.scene.start('GameScene', { levelIndex: idx });
      });
    }
  }

  _backBtn() {
    const bg = this.add.graphics();
    const draw = (h) => {
      bg.clear();
      bg.fillStyle(h ? 0x252340 : 0x111020, 1);
      bg.fillRoundedRect(6, 14, 68, 30, 7);
      bg.lineStyle(1, 0x3a3860, 0.8);
      bg.strokeRoundedRect(6, 14, 68, 30, 7);
    };
    draw(false);
    this.add.text(40, 29, '← BACK', {
      fontFamily: 'Space Grotesk',
      fontSize: '12px',
      color: '#a7a9be',
    }).setOrigin(0.5);
    const zone = this.add.zone(40, 29, 68, 30).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover',  () => draw(true));
    zone.on('pointerout',   () => draw(false));
    zone.on('pointerdown',  () => {
      window._audio?.playMenu();
      this.scene.start('MenuScene');
    });
  }
}
