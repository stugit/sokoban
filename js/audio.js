export default class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicPlaying = false;
    this.droneOscs = [];
    this.noteTimer = null;
    this.masterGain = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.ctx.destination);
  }

  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  _tone(freq, type, duration, volume = 0.3, startTime = null) {
    if (!this.enabled || !this.ctx) return;
    const t = startTime ?? this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  playMove() {
    this._tone(160, 'square', 0.055, 0.06);
  }

  playPush() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._tone(90, 'sawtooth', 0.09, 0.18, t);
    this._tone(130, 'square', 0.07, 0.1, t + 0.01);
  }

  playGoal() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._tone(880,  'triangle', 0.22, 0.22, t);
    this._tone(1108, 'triangle', 0.18, 0.18, t + 0.1);
    this._tone(1320, 'triangle', 0.14, 0.14, t + 0.2);
  }

  playWin() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => {
      this._tone(f, 'sine', 0.35, 0.38, t + i * 0.13);
    });
  }

  playUndo() {
    this._tone(220, 'triangle', 0.1, 0.12);
  }

  playMenu() {
    this._tone(440, 'sine', 0.12, 0.15);
  }

  startMusic() {
    if (!this.enabled || !this.ctx || this.musicPlaying) return;
    this.musicPlaying = true;
    const droneFreqs = [55, 55.6, 110, 110.5, 82.5];
    this.droneOscs = droneFreqs.map((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.035;
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      return { osc, gain };
    });
    this._scheduleNote();
  }

  _scheduleNote() {
    if (!this.musicPlaying) return;
    const scale = [220, 247, 294, 330, 392, 440, 494, 587, 660, 784];
    const freq = scale[Math.floor(Math.random() * scale.length)];
    const octave = Math.random() > 0.65 ? 2 : 1;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq * octave;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.07, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 2);
    this.noteTimer = setTimeout(() => this._scheduleNote(), 1800 + Math.random() * 3200);
  }

  stopMusic() {
    this.musicPlaying = false;
    clearTimeout(this.noteTimer);
    const t = this.ctx?.currentTime ?? 0;
    this.droneOscs.forEach(({ osc, gain }) => {
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.stop(t + 1.3);
    });
    this.droneOscs = [];
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? 0.7 : 0;
    }
    return this.enabled;
  }
}
