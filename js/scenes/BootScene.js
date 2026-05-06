export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    this._gen();
    this.scene.start('MenuScene');
  }

  _gen() {
    const T = 64;

    // FLOOR — inset tile with grout border
    {
      const ct = this.textures.createCanvas('floor', T, T);
      const c = ct.getContext();
      c.fillStyle = '#12111e';
      c.fillRect(0, 0, T, T);
      c.fillStyle = '#181627';
      c.fillRect(2, 2, T - 4, T - 4);
      c.fillStyle = 'rgba(255,255,255,0.025)';
      c.fillRect(2, 2, T - 4, 1);
      c.fillRect(2, 2, 1, T - 4);
      c.strokeStyle = '#0b0a17';
      c.lineWidth = 1;
      c.strokeRect(0.5, 0.5, T - 1, T - 1);
      c.fillStyle = '#1e1c36';
      for (const [x, y] of [[3, 3], [T - 5, 3], [3, T - 5], [T - 5, T - 5]])
        c.fillRect(x, y, 2, 2);
      ct.refresh();
    }

    // WALL — deep bevel with lit inner panel edges
    {
      const ct = this.textures.createCanvas('wall', T, T);
      const c = ct.getContext();
      c.fillStyle = '#23213f';
      c.fillRect(0, 0, T, T);
      c.fillStyle = '#3d3a6e';
      c.fillRect(0, 0, T, 5);
      c.fillStyle = '#302d58';
      c.fillRect(0, 5, T, 3);
      c.fillStyle = '#2e2b54';
      c.fillRect(0, 0, 4, T);
      c.fillStyle = '#100e24';
      c.fillRect(0, T - 4, T, 4);
      c.fillStyle = '#171528';
      c.fillRect(T - 4, 0, 4, T);
      c.fillStyle = '#1a1832';
      c.fillRect(7, 7, T - 14, T - 14);
      c.fillStyle = 'rgba(255,255,255,0.06)';
      c.fillRect(8, 8, T - 16, 2);
      c.fillRect(8, 8, 2, T - 16);
      c.fillStyle = 'rgba(0,0,0,0.35)';
      c.fillRect(8, T - 10, T - 16, 2);
      c.fillRect(T - 10, 8, 2, T - 16);
      ct.refresh();
    }

    // CRATE — amber with wood grain and outer rim glow
    {
      const ct = this.textures.createCanvas('crate', T, T);
      const c = ct.getContext();
      const g = c.createLinearGradient(0, 0, T, T);
      g.addColorStop(0, '#d4942e');
      g.addColorStop(0.5, '#b07520');
      g.addColorStop(1, '#7a4808');
      c.fillStyle = g;
      c.fillRect(0, 0, T, T);
      for (let i = 6; i < T - 4; i += 5) {
        c.fillStyle = `rgba(0,0,0,${0.06 + (i % 10 < 5 ? 0.06 : 0)})`;
        c.fillRect(4, i, T - 8, 1);
      }
      c.fillStyle = 'rgba(255,218,110,0.42)';
      c.fillRect(0, 0, T, 5);
      c.fillRect(0, 0, 5, T);
      c.fillStyle = 'rgba(0,0,0,0.45)';
      c.fillRect(0, T - 5, T, 5);
      c.fillRect(T - 5, 0, 5, T);
      c.strokeStyle = 'rgba(0,0,0,0.25)';
      c.lineWidth = 1.5;
      c.strokeRect(9, 9, T - 18, T - 18);
      c.strokeStyle = 'rgba(0,0,0,0.18)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(13, 13); c.lineTo(T - 13, T - 13);
      c.moveTo(T - 13, 13); c.lineTo(13, T - 13);
      c.stroke();
      c.strokeStyle = 'rgba(255,200,80,0.2)';
      c.lineWidth = 2;
      c.strokeRect(1.5, 1.5, T - 3, T - 3);
      ct.refresh();
    }

    // CRATE ON GOAL — teal with grain, bright rim and radial glow
    {
      const ct = this.textures.createCanvas('crate_goal', T, T);
      const c = ct.getContext();
      const g = c.createLinearGradient(0, 0, T, T);
      g.addColorStop(0, '#22bc92');
      g.addColorStop(0.5, '#13946e');
      g.addColorStop(1, '#0a6040');
      c.fillStyle = g;
      c.fillRect(0, 0, T, T);
      for (let i = 6; i < T - 4; i += 5) {
        c.fillStyle = `rgba(0,0,0,${0.06 + (i % 10 < 5 ? 0.06 : 0)})`;
        c.fillRect(4, i, T - 8, 1);
      }
      c.fillStyle = 'rgba(140,255,210,0.42)';
      c.fillRect(0, 0, T, 5);
      c.fillRect(0, 0, 5, T);
      c.fillStyle = 'rgba(0,0,0,0.42)';
      c.fillRect(0, T - 5, T, 5);
      c.fillRect(T - 5, 0, 5, T);
      c.strokeStyle = 'rgba(0,255,180,0.5)';
      c.lineWidth = 1.5;
      c.strokeRect(9, 9, T - 18, T - 18);
      c.strokeStyle = 'rgba(0,255,180,0.32)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(13, 13); c.lineTo(T - 13, T - 13);
      c.moveTo(T - 13, 13); c.lineTo(13, T - 13);
      c.stroke();
      const gl = c.createRadialGradient(T / 2, T / 2, 0, T / 2, T / 2, T * 0.52);
      gl.addColorStop(0, 'rgba(0,255,180,0.28)');
      gl.addColorStop(0.5, 'rgba(0,255,180,0.1)');
      gl.addColorStop(1, 'rgba(0,255,180,0)');
      c.fillStyle = gl;
      c.fillRect(0, 0, T, T);
      c.strokeStyle = 'rgba(0,255,180,0.38)';
      c.lineWidth = 2;
      c.strokeRect(1.5, 1.5, T - 3, T - 3);
      ct.refresh();
    }

    // GOAL — dual-diamond with outer halo ring
    {
      const ct = this.textures.createCanvas('goal', T, T);
      const c = ct.getContext();
      c.fillStyle = '#12111e';
      c.fillRect(0, 0, T, T);
      c.fillStyle = '#181627';
      c.fillRect(2, 2, T - 4, T - 4);
      const cx = T / 2, cy = T / 2;
      c.beginPath();
      c.arc(cx, cy, 22, 0, Math.PI * 2);
      c.strokeStyle = 'rgba(0,229,255,0.1)';
      c.lineWidth = 7;
      c.stroke();
      const gl = c.createRadialGradient(cx, cy, 0, cx, cy, 20);
      gl.addColorStop(0, 'rgba(0,229,255,0.22)');
      gl.addColorStop(0.6, 'rgba(0,229,255,0.07)');
      gl.addColorStop(1, 'rgba(0,229,255,0)');
      c.fillStyle = gl;
      c.fillRect(0, 0, T, T);
      const diamond = (r, alpha, lw) => {
        c.beginPath();
        c.moveTo(cx, cy - r); c.lineTo(cx + r, cy);
        c.lineTo(cx, cy + r); c.lineTo(cx - r, cy);
        c.closePath();
        c.strokeStyle = `rgba(0,229,255,${alpha})`;
        c.lineWidth = lw;
        c.stroke();
      };
      diamond(17, 0.88, 1.8);
      diamond(9, 0.35, 1);
      c.fillStyle = 'rgba(0,229,255,0.92)';
      c.beginPath();
      c.arc(cx, cy, 4, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(200,248,255,0.95)';
      c.beginPath();
      c.arc(cx, cy, 2, 0, Math.PI * 2);
      c.fill();
      ct.refresh();
    }

    // PLAYER — body glow, glowing eyes, tech stripe
    {
      const ct = this.textures.createCanvas('player', T, T);
      const c = ct.getContext();
      const mx = T / 2;
      const halo = c.createRadialGradient(mx, T / 2 + 6, 0, mx, T / 2 + 6, 28);
      halo.addColorStop(0, 'rgba(0,229,255,0.18)');
      halo.addColorStop(1, 'rgba(0,229,255,0)');
      c.fillStyle = halo;
      c.fillRect(0, 0, T, T);
      const bodyGrad = c.createRadialGradient(mx - 3, T / 2 + 4, 2, mx, T / 2 + 7, 21);
      bodyGrad.addColorStop(0, '#55e8ff');
      bodyGrad.addColorStop(1, '#0090b8');
      c.fillStyle = bodyGrad;
      c.beginPath();
      c.arc(mx, T / 2 + 7, 20, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = 'rgba(0,200,255,0.28)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(mx - 15, T / 2 + 7);
      c.lineTo(mx + 15, T / 2 + 7);
      c.stroke();
      c.strokeStyle = 'rgba(0,229,255,0.28)';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(mx, T / 2 + 7, 20, 0, Math.PI * 2);
      c.stroke();
      const headGrad = c.createRadialGradient(mx - 3, T / 2 - 10, 2, mx, T / 2 - 7, 13);
      headGrad.addColorStop(0, '#88f0ff');
      headGrad.addColorStop(1, '#00b8d4');
      c.fillStyle = headGrad;
      c.beginPath();
      c.arc(mx, T / 2 - 7, 13, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = 'rgba(0,229,255,0.28)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(mx, T / 2 - 7, 13, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = '#060e18';
      c.beginPath();
      c.arc(mx - 4.5, T / 2 - 9, 2.5, 0, Math.PI * 2);
      c.arc(mx + 4.5, T / 2 - 9, 2.5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(0,229,255,0.92)';
      c.beginPath();
      c.arc(mx - 4.5, T / 2 - 9, 1.2, 0, Math.PI * 2);
      c.arc(mx + 4.5, T / 2 - 9, 1.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.55)';
      c.beginPath();
      c.arc(mx - 6, T / 2 - 14, 3.5, 0, Math.PI * 2);
      c.fill();
      ct.refresh();
    }

    // PARTICLE — slightly larger for more dramatic bursts
    {
      const ct = this.textures.createCanvas('particle', 16, 16);
      const c = ct.getContext();
      const g = c.createRadialGradient(8, 8, 0, 8, 8, 8);
      g.addColorStop(0, 'rgba(0,229,255,1)');
      g.addColorStop(0.4, 'rgba(0,229,255,0.8)');
      g.addColorStop(1, 'rgba(0,229,255,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 16, 16);
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
