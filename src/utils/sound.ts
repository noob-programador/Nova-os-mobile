// Web Audio API pure synthesizer for native zero-latency sound effects & procedural music

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.7;
  private activeSynthMusic: { stop: () => void } | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol / 100));
  }

  // Soft UI tap / click
  public playTap() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  // App launch / switch chime
  public playAppOpen() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  // Lock phone click
  public playLock() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.2 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  // Unlock phone melodic chime
  public playUnlock() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);

        gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.12);
      });
    } catch {}
  }

  // Notification chime
  public playNotification() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      [659.25, 880, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0.15 * this.volume, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.18);
      });
    } catch {}
  }

  // Pomodoro timer finished gong
  public playChimeGong() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      [440, 554.37, 659.25, 880].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.2 * this.volume, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 1.2);
      });
    } catch {}
  }

  // Success fanfare
  public playSuccess() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);

        gain.gain.setValueAtTime(0.18 * this.volume, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.25);
      });
    } catch {}
  }

  // Camera shutter snap
  public playCameraShutter() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      whiteNoise.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  // Game Retro sound
  public playGameBeep(type: 'eat' | 'die' | 'rotate' | 'clear' | 'move' | 'flag' | 'win') {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      switch (type) {
        case 'eat':
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.04);
          gain.gain.setValueAtTime(0.1 * this.volume, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
          break;
        case 'rotate':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03);
          gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
          osc.start();
          osc.stop(ctx.currentTime + 0.03);
          break;
        case 'clear':
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'square';
            o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.04);
            g.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime + i * 0.04);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.08);
            o.connect(g);
            g.connect(ctx.destination);
            o.start(ctx.currentTime + i * 0.04);
            o.stop(ctx.currentTime + i * 0.04 + 0.08);
          });
          return;
        case 'die':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.15 * this.volume, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
          break;
        case 'move':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          gain.gain.setValueAtTime(0.05 * this.volume, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
          osc.start();
          osc.stop(ctx.currentTime + 0.02);
          break;
        case 'flag':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(900, ctx.currentTime);
          gain.gain.setValueAtTime(0.1 * this.volume, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
          osc.start();
          osc.stop(ctx.currentTime + 0.04);
          break;
        case 'win':
          [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.07);
            g.gain.setValueAtTime(0.18 * this.volume, ctx.currentTime + i * 0.07);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.15);
            o.connect(g);
            g.connect(ctx.destination);
            o.start(ctx.currentTime + i * 0.07);
            o.stop(ctx.currentTime + i * 0.07 + 0.15);
          });
          return;
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch {}
  }

  // Synthesizer ambient lo-fi track for Music Player widget
  public playSynthTrack(track: 'lofi' | 'cyberpunk' | 'chill', onProgress?: (percent: number) => void): { stop: () => void } {
    this.stopSynthTrack();
    if (!this.enabled || this.volume <= 0) return { stop: () => {} };

    const ctx = this.getContext();
    if (!ctx) return { stop: () => {} };

    let isRunning = true;
    let noteIndex = 0;
    const tempo = track === 'cyberpunk' ? 140 : 80;
    const intervalMs = (60 / tempo / 2) * 1000;

    const scales = {
      lofi: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
      cyberpunk: [130.81, 155.56, 174.61, 196.00, 233.08, 261.63],
      chill: [329.63, 369.99, 392.00, 493.88, 587.33, 659.25],
    };

    const notes = scales[track];

    const timer = setInterval(() => {
      if (!isRunning) return;
      try {
        const freq = notes[Math.floor(Math.random() * notes.length)];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = track === 'cyberpunk' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + intervalMs / 1000);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + intervalMs / 1000);

        noteIndex++;
        if (onProgress) {
          onProgress((noteIndex % 100) / 100);
        }
      } catch {}
    }, intervalMs);

    const controller = {
      stop: () => {
        isRunning = false;
        clearInterval(timer);
      },
    };

    this.activeSynthMusic = controller;
    return controller;
  }

  public stopSynthTrack() {
    if (this.activeSynthMusic) {
      this.activeSynthMusic.stop();
      this.activeSynthMusic = null;
    }
  }
}

export const sounds = new SoundEngine();
