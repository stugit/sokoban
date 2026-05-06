export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    this._gen();
    this.scene.start('MenuScene');
  }

  _gen() {
    const T = 64;

    // FLOOR
    {
      const ct = this.textures.createCanvas('floor', T, T);
      const c = ct.getContext();
      c.fillStyle = '#1a1830';
      c.fillRect(0, 0, T, T);
      c.strokeStyle = '#141226';
      c.lineWidth = 1;
      c.strokeRect(0.5, 0.5, T - 1, T - 1);
      c.fillStyle = '#1e1c38';
      for (const x of [2, T - 4]) for (const y of [2, T - 4]) c.fillRect(x, y, 2, 2);
      ct.refresh();
    }

    // WALL
    {
      const ct = this.textures.createCanvas('wall', T, T);
      const c = ct.getContext();
      c.fillStyle = '#252342';
      c.fillRect(0, 0, T, T);
      c.fillStyle = '#3a3768';
      c.fillRect(0, 0, T, 6);
      c.fillStyle = '#2e2b54';
      c.fillRect(0, 0, 5, T);
      c.fillStyle = '#141228';
      c.fillRect(0, T - 5, T, 5);
      c.fillStyle = '#191730';
      c.fillRect(T - 5, 0, 5, T);
      c.fillStyle = '#201e3c';
      c.fillRect(7, 7, T - 14, T - 14);
      c.fillStyle = 'rgba(255,255,255,0.04)';
      c.fillRect(8, 8, T - 16, 3);
      c.fillRect(8, 8, 3, T - 16);
      ct.refresh();
    }

    // CRATE
    {
      const ct = this.textures.createCanvas('crate', T, T);
      const c = ct.getContext();
      const g = c.createLinearGradient(0, 0, T, T);
      g.addColorStop(0, '#cc8c2a');
      g.addColorStop(1, '#8a5510');
      c.fillStyle = g;
      c.fillRect(0, 0, T, T);
      c.fillStyle = 'rgba(255,218,110,0.3)';
      c.fillRect(0, 0, T, 5);
      c.fillRect(0, 0, 5, T);
      c.fillStyle = 'rgba(0,0,0,0.38)';
      c.fillRect(0, T - 5, T, 5);
      c.fillRect(T - 5, 0, 5, T);
      c.strokeStyle = 'rgba(0,0,0,0.22)';
      c.lineWidth = 1.5;
      c.strokeRect(9, 9, T - 18, T - 18);
      c.strokeStyle = 'rgba(0,0,0,0.17)';
      c.beginPath();
      c.moveTo(12, 12); c.lineTo(T - 12, T - 12);
      c.moveTo(T - 12, 12); c.lineTo(12, T - 12);
      c.stroke();
      ct.refresh();
    }

    // CRATE ON GOAL
    {
      const ct = this.textures.createCanvas('crate_goal', T, T);
      const c = ct.getContext();
      const g = c.createLinearGradient(0, 0, T, T);
      g.addColorStop(0, '#1ea882');
      g.addColorStop(1, '#0c6b52');
      c.fillStyle = g;
      c.fillRect(0, 0, T, T);
      c.fillStyle = 'rgba(140,255,210,0.3)';
      c.fillRect(0, 0, T, 5);
      c.fillRect(0, 0, 5, T);
      c.fillStyle = 'rgba(0,0,0,0.38)';
      c.fillRect(0, T - 5, T, 5);
      c.fillRect(T - 5, 0, 5, T);
      c.strokeStyle = 'rgba(0,255,180,0.28)';
      c.lineWidth = 1.5;
      c.strokeRect(9, 9, T - 18, T - 18);
      c.beginPath();
      c.moveTo(12, 12); c.lineTo(T - 12, T - 12);
      c.moveTo(T - 12, 12); c.lineTo(12, T - 12);
      c.stroke();
      const gl = c.createRadialGradient(T / 2, T / 2, 0, T / 2, T / 2, T / 2);
      gl.addColorStop(0, 'rgba(0,255,180,0.18)');
      gl.addColorStop(1, 'rgba(0,255,180,0)');
      c.fillStyle = gl;
      c.fillRect(0, 0, T, T);
      ct.refresh();
    }

    // GOAL
    {
      const ct = this.textures.createCanvas('goal', T, T);
      const c = ct.getContext();
      c.fillStyle = '#1a1830';
      c.fillRect(0, 0, T, T);
      c.strokeStyle = '#141226';
      c.lineWidth = 1;
      c.strokeRect(0.5, 0.5, T - 1, T - 1);
      const cx = T / 2, cy = T / 2, r = 15;
      const gl = c.createRadialGradient(cx, cy, 0, cx, cy, r + 6);
      gl.addColorStop(0, 'rgba(0,229,255,0.16)');
      gl.addColorStop(1, 'rgba(0,229,255,0)');
      c.fillStyle = gl;
      c.fillRect(0, 0, T, T);
      c.beginPath();
      c.moveTo(cx, cy - r);
      c.lineTo(cx + r, cy);
      c.lineTo(cx, cy + r);
      c.lineTo(cx - r, cy);
      c.closePath();
      c.strokeStyle = 'rgba(0,229,255,0.75)';
      c.lineWidth = 1.8;
      c.stroke();
      c.fillStyle = 'rgba(0,229,255,0.55)';
      c.beginPath();
      c.arc(cx, cy, 3.5, 0, Math.PI * 2);
      c.fill();
      ct.refresh();
    }

    // PLAYER
    {
      const ct = this.textures.createCanvas('player', T, T);
      const c = ct.getContext();
      const mx = T / 2;
      const bg = c.createRadialGradient(mx - 3, T / 2 + 2, 2, mx, T / 2 + 6, T * 0.3);
      bg.addColorStop(0, '#55e8ff');
      bg.addColorStop(1, '#0099bb');
      c.fillStyle = bg;
      c.beginPath();
      c.arc(mx, T / 2 + 6, T * 0.26, 0, Math.PI * 2);
      c.fill();
      const hg = c.createRadialGradient(mx - 3, T / 2 - 12, 2, mx, T / 2 - 8, T * 0.18);
      hg.addColorStop(0, '#88f0ff');
      hg.addColorStop(1, '#00bbd8');
      c.fillStyle = hg;
      c.beginPath();
      c.arc(mx, T / 2 - 8, T * 0.17, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#091520';
      c.beginPath();
      c.arc(mx - 4.5, T / 2 - 10, 2.2, 0, Math.PI * 2);
      c.arc(mx + 4.5, T / 2 - 10, 2.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.beginPath();
      c.arc(mx - 6, T / 2 - 14, 3, 0, Math.PI * 2);
      c.fill();
      ct.refresh();
    }

    // PARTICLE
    {
      const ct = this.textures.createCanvas('particle', 12, 12);
      const c = ct.getContext();
      const g = c.createRadialGradient(6, 6, 0, 6, 6, 6);
      g.addColorStop(0, 'rgba(0,229,255,1)');
      g.addColorStop(0.5, 'rgba(0,229,255,0.7)');
      g.addColorStop(1, 'rgba(0,229,255,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 12, 12);
      ct.refresh();
    }

    // LOCK (level select)
    {
      const ct = this.textures.createCanvas('lock', 32, 32);
      const c = ct.getContext();
      c.strokeStyle = '#504d78';
      c.lineWidth = 2.5;
      c.beginPath();
      c.arc(16, 13, 7, Math.PI, 0);
      c.stroke();
      c.fillStyle = '#302e52';
      c.fillRect(7, 15, 18, 13);
      c.strokeStyle = '#504d78';
      c.lineWidth = 1.5;
      c.strokeRect(7, 15, 18, 13);
      c.fillStyle = '#504d78';
      c.beginPath();
      c.arc(16, 20, 2.5, 0, Math.PI * 2);
      c.fill();
      c.fillRect(14.5, 21, 3, 4);
      ct.refresh();
    }
  }
}
