import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock browser globals
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
};

class MockGainNode {
  constructor() {
    this.gain = { setValueAtTime() {}, linearRampToValueAtTime() {} };
  }
  connect() {}
}

class MockOscillatorNode {
  constructor() {
    this.type = '';
    this.frequency = { setValueAtTime() {} };
  }
  connect() {}
  start() {}
  stop() {}
}

class MockAudioContext {
  constructor() { this.currentTime = 0; }
  createOscillator() { return new MockOscillatorNode(); }
  createGain() { return new MockGainNode(); }
  get destination() { return {}; }
}

globalThis.window = { AudioContext: MockAudioContext };
globalThis.AudioContext = MockAudioContext;

const { AudioManager } = await import('../src/audio/audio-manager.js');

describe('AudioManager', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('constructor sets default volume and muted state', () => {
    const am = new AudioManager();
    assert.equal(am.getVolume(), 0.5);
    assert.equal(am.isMuted(), false);
  });

  it('setVolume changes volume', () => {
    const am = new AudioManager();
    am.setVolume(0.8);
    assert.equal(am.getVolume(), 0.8);
  });

  it('setVolume clamps to 0-1 range', () => {
    const am = new AudioManager();
    am.setVolume(-0.5);
    assert.equal(am.getVolume(), 0);
    am.setVolume(2.0);
    assert.equal(am.getVolume(), 1);
  });

  it('setMute toggles muted state', () => {
    const am = new AudioManager();
    am.setMute(true);
    assert.equal(am.isMuted(), true);
    am.setMute(false);
    assert.equal(am.isMuted(), false);
  });

  it('init creates AudioContext', () => {
    const am = new AudioManager();
    assert.equal(am._ctx, null);
    am.init();
    assert.notEqual(am._ctx, null);
  });

  it('init is idempotent (second call does nothing)', () => {
    const am = new AudioManager();
    am.init();
    const ctx = am._ctx;
    am.init();
    assert.equal(am._ctx, ctx);
  });

  it('saveSettings persists volume and mute', () => {
    const am = new AudioManager();
    am.setVolume(0.7);
    am.setMute(true);
    am.saveSettings();
    assert.equal(storage.get('matrixTyper_seVolume'), '0.7');
    assert.equal(storage.get('matrixTyper_seMute'), 'true');
  });

  it('loadSettings restores volume and mute', () => {
    storage.set('matrixTyper_seVolume', '0.3');
    storage.set('matrixTyper_seMute', 'true');
    const am = new AudioManager();
    am.loadSettings();
    assert.equal(am.getVolume(), 0.3);
    assert.equal(am.isMuted(), true);
  });

  it('loadSettings clamps restored volume to 0-1', () => {
    storage.set('matrixTyper_seVolume', '5');
    const am = new AudioManager();
    am.loadSettings();
    assert.equal(am.getVolume(), 1);
  });

  it('playSE does nothing when not initialized', () => {
    const am = new AudioManager();
    // Should not throw
    am.playSE('type');
  });

  it('playSE does nothing when muted', () => {
    const am = new AudioManager();
    am.init();
    am.setMute(true);
    // Should not throw
    am.playSE('type');
  });
});
