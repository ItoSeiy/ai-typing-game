import { SE_DEFINITIONS } from './se-definitions.js';

const STORAGE_KEY_VOLUME = 'matrixTyper_seVolume';
const STORAGE_KEY_MUTE = 'matrixTyper_seMute';

/**
 * AudioManager — Web Audio API sound-effect player.
 * Generates all sounds programmatically via OscillatorNode + GainNode.
 * No external audio files required.
 */
export class AudioManager {
  constructor() {
    /** @type {AudioContext|null} */
    this._ctx = null;
    this._volume = 0.5;
    this._muted = false;
  }

  /**
   * Initialise the AudioContext. Must be called after a user gesture
   * (click / keydown) to satisfy browser autoplay policy.
   */
  init() {
    if (this._ctx) return;
    this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.loadSettings();
  }

  /**
   * Play a named sound effect.
   * @param {'type'|'correct'|'miss'|'start'|'end'|'countdown'} name
   * @param {'pip'|'go'} [variant] — only used when name === 'countdown'
   */
  playSE(name, variant) {
    if (!this._ctx || this._muted) return;

    let def = SE_DEFINITIONS[name];
    if (!def) return;

    // countdown has sub-definitions (pip / go)
    if (name === 'countdown') {
      def = variant === 'go' ? def.go : def.pip;
      if (!def) return;
    }

    const now = this._ctx.currentTime;

    for (const layer of def.layers) {
      this._playLayer(layer, now);
    }
  }

  /**
   * Play the settings preview sound.
   * Uses the type SE so volume changes have an immediate audible reference.
   */
  playPreviewSE() {
    this.playSE('type');
  }

  /**
   * Set master volume (0.0–1.0). Clamped.
   * @param {number} v
   */
  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
  }

  /** @returns {number} Current volume (0.0–1.0) */
  getVolume() {
    return this._volume;
  }

  /**
   * Mute or unmute all SE.
   * @param {boolean} muted
   */
  setMute(muted) {
    this._muted = Boolean(muted);
  }

  /** @returns {boolean} Whether SE is currently muted */
  isMuted() {
    return this._muted;
  }

  /** Restore volume & mute state from localStorage. */
  loadSettings() {
    try {
      const vol = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (vol !== null) {
        this._volume = Math.max(0, Math.min(1, Number(vol)));
      }
      const mute = localStorage.getItem(STORAGE_KEY_MUTE);
      if (mute !== null) {
        this._muted = mute === 'true';
      }
    } catch {
      // localStorage may be unavailable (private browsing, etc.)
    }
  }

  /** Persist volume & mute state to localStorage. */
  saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(this._volume));
      localStorage.setItem(STORAGE_KEY_MUTE, String(this._muted));
    } catch {
      // Silently ignore storage errors
    }
  }

  // ── private ──────────────────────────────────────────

  /**
   * Render a single oscillator layer.
   * @param {object} layer  — definition from SE_DEFINITIONS
   * @param {number} baseTime — AudioContext.currentTime at call time
   */
  _playLayer(layer, baseTime) {
    const ctx = this._ctx;
    const startAt = baseTime + (layer.delay || 0);

    const osc = ctx.createOscillator();
    osc.type = layer.waveform;
    osc.frequency.setValueAtTime(layer.frequency, startAt);

    const gain = ctx.createGain();
    const peakGain = layer.gain * this._volume;
    const { attack, decay } = layer.envelope;

    // Envelope: attack → peak → decay → 0
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(peakGain, startAt + attack);
    gain.gain.linearRampToValueAtTime(0, startAt + attack + decay);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startAt);
    osc.stop(startAt + layer.duration);
  }
}
