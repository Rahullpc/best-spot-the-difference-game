// Eagle Eye — audio.js: every sound is synthesized with the Web Audio API.
// No audio files are loaded. A single AudioContext is created on the first
// user gesture; all effects are short oscillator + gain envelopes.

export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  // Create (or resume) the AudioContext. Browsers require a user gesture,
  // so this is called from the first click / keypress, never on load.
  ensureContext() {
    if (!this.context) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.context = new AudioCtx();
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  setMuted(muted) {
    this.muted = muted;
  }

  // Play one oscillator note: frequency, start delay, duration, wave shape,
  // and peak gain. A short exponential decay keeps every effect crisp.
  playNote(frequency, delaySeconds, durationSeconds, waveType, peakGain) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const startAt = ctx.currentTime + delaySeconds;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = waveType;
    osc.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSeconds);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + durationSeconds + 0.05);
  }

  // A soft blip for any button press.
  playClick() {
    this.playNote(660, 0, 0.07, 'sine', 0.12);
  }

  // Two-note chime when a difference is found: satisfying, quick, bright.
  playFound() {
    this.playNote(659.25, 0, 0.14, 'sine', 0.22);
    this.playNote(880.0, 0.09, 0.22, 'sine', 0.22);
    this.playNote(1318.5, 0.18, 0.18, 'triangle', 0.1);
  }

  // Low buzz for a wrong click, paired with the time penalty.
  playWrong() {
    this.playNote(110, 0, 0.22, 'sawtooth', 0.16);
    this.playNote(98, 0.05, 0.2, 'sawtooth', 0.12);
  }

  // Gentle ping when a hint reveals a difference.
  playHint() {
    this.playNote(1174.66, 0, 0.16, 'sine', 0.16);
    this.playNote(1567.98, 0.12, 0.2, 'sine', 0.12);
  }

  // Rising arpeggio when a level is completed.
  playLevelComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => this.playNote(freq, i * 0.11, 0.22, 'triangle', 0.2));
  }

  // Short descending phrase when the clock runs out.
  playGameOver() {
    const notes = [392, 329.63, 261.63, 196];
    notes.forEach((freq, i) => this.playNote(freq, i * 0.14, 0.26, 'triangle', 0.18));
  }

  // Full fanfare for finishing all three scenes.
  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, i) => this.playNote(freq, i * 0.12, 0.26, 'triangle', 0.2));
  }

  // A single tick when the timer drops under ten seconds.
  playTick() {
    this.playNote(1200, 0, 0.05, 'square', 0.06);
  }
}
