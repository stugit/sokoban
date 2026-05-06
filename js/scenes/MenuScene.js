import AudioManager from '../audio.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    if (!window._audio) window._audio = new AudioManager();

    const { width: W, height: H } = this.cameras.main;
    const cx = W / 2;

    this._drawBg(W, H);
    this._addFloatingCrates(W, H);

    // Glow behind title
    const glow = this.add.graphics();
    glow.fillStyle(0x00e5ff, 0.04);
    glow.fillEllipse(cx, 155, 500, 120);

    const title = this.add.text(cx, 140, 'SOKOBAN', {
      fontFamily: 'Space Grotesk',
      fontSize: '74px',
      fontStyle: 'bold',
      color: '#f0eff4',
      stroke: '#00e5ff',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(cx, 200, 'W A R E H O U S E   K E E P E R', {
      fontFamily: 'Space Grotesk',
      fontSize: '13px',
      color: '#504d78',
      letterSpacing: 2,
    }).setOrigin(0.5);

    const sep = this.add.graphics();
    sep.fillStyle(0x00e5ff, 0.35);
    sep.fillRect(cx - 100, 220, 200, 1);

    // PLAY button
    this._btn(cx, 295, 240, 'PLAY', '#00e5ff', 0x00e5ff, () => {
      const reached = parseInt(localStorage.getItem('sokoban_reached') ?? '0');
      this._go(Math.min(reached, 89));
    });

    // SELECT LEVEL button
    this._btn(cx, 365, 240, 'SELECT LEVEL', '#f0eff4', 0x4444aa, () => {
      window._audio?.playMenu();
      this.scene.start('LevelSelectScene');
    });

    // Music toggle
    let musicOn = true;
    const [musicBg, musicTxt] = this._btnParts(cx, 435, 200, '♪  MUSIC  ON', '#a7a9be', 0x3a3760);
    const musicZone = this.add.zone(cx, 435, 200, 46).setInteractive({ cursor: 'pointer' });
    musicZone.on('pointerover',  () => this._btnHover(musicBg, cx, 435, 200, 46, 0x3a3760, true));
    musicZone.on('pointerout',   () => this._btnHover(musicBg, cx, 435, 200, 46, 0x3a3760, false));
    musicZone.on('pointerdown',  () => {
      window._audio?.init();
      musicOn = window._audio?.toggle() ?? !musicOn;
      musicTxt.setText(musicOn ? '♪  MUSIC  ON' : '♪  MUSIC  OFF');
    });

    // Version hint
    this.add.text(cx, H - 18, 'Original 90 levels  ·  Use arrows or swipe  ·  Z to undo', {
      fontFamily: 'Space Grotesk',
      fontSize: '11px',
      color: '#2d2b48',
    }).setOrigin(0.5);

    // Floating title bob
    this.tweens.add({
      targets: title,
      y: 133,
      duration: 2200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Start audio on first touch
    this.input.on('pointerdown', () => {
      window._audio?.init();
      window._audio?.resume();
      window._audio?.startMusic();
    });
  }

  _go(levelIndex) {
    window._audio?.playMenu();
    this.scene.start('GameScene', { levelIndex });
  }

  _drawBg(W, H) {
    const g = this.add.graphics();
    g.lineStyle(1, 0x1a1835, 0.6);
    for (let x = 0; x <= W; x += 48) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 48) g.lineBetween(0, y, W, y);
  }

  _addFloatingCrates(W, H) {
    for (let i = 0; i < 9; i++) {
      const x = Phaser.Math.Between(30, W - 30);
      const y = Phaser.Math.Between(30, H - 30);
      const img = this.add.image(x, y, 'crate')
        .setScale(0.35 + Math.random() * 0.3)
        .setAlpha(0.055 + Math.random() * 0.07)
        .setAngle(Math.random() * 25 - 12);
      this.tweens.add({
        targets: img,
        y: y - 25 - Math.random() * 35,
        angle: img.angle + 8,
        duration: 3500 + Math.random() * 3000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2500,
      });
    }
  }

  _btn(x, y, w, label, textColor, borderColor, onClick) {
    const h = 50;
    const [bg, txt] = this._btnParts(x, y, w, label, textColor, borderColor);
    const zone = this.add.zone(x, y, w, h).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover',  () => { this._btnHover(bg, x, y, w, h, borderColor, true);  txt.setScale(1.04); });
    zone.on('pointerout',   () => { this._btnHover(bg, x, y, w, h, borderColor, false); txt.setScale(1); });
    zone.on('pointerdown',  onClick);
  }

  _btnParts(x, y, w, label, textColor, borderColor) {
    const h = 50;
    const bg = this.add.graphics();
    this._btnHover(bg, x, y, w, h, borderColor, false);
    const txt = this.add.text(x, y, label, {
      fontFamily: 'Space Grotesk',
      fontSize: '17px',
      fontStyle: 'bold',
      color: textColor,
    }).setOrigin(0.5);
    return [bg, txt];
  }

  _btnHover(bg, x, y, w, h, borderColor, hover) {
    bg.clear();
    bg.fillStyle(hover ? 0x1e1c3a : 0x0d0c1a, hover ? 0.98 : 0.75);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    bg.lineStyle(2, borderColor, hover ? 0.95 : 0.55);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
  }
}
