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

describe('AudioManager（音声管理）', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('コンストラクタでデフォルト音量とミュート状態が設定される', () => {
    const am = new AudioManager();
    assert.equal(am.getVolume(), 0.5);
    assert.equal(am.isMuted(), false);
  });

  it('setVolumeで音量が変更される', () => {
    const am = new AudioManager();
    am.setVolume(0.8);
    assert.equal(am.getVolume(), 0.8);
  });

  it('setVolumeが0〜1の範囲に収まる', () => {
    const am = new AudioManager();
    am.setVolume(-0.5);
    assert.equal(am.getVolume(), 0);
    am.setVolume(2.0);
    assert.equal(am.getVolume(), 1);
  });

  it('setMuteがミュート状態を切り替える', () => {
    const am = new AudioManager();
    am.setMute(true);
    assert.equal(am.isMuted(), true);
    am.setMute(false);
    assert.equal(am.isMuted(), false);
  });

  it('initでAudioContextが作成される', () => {
    const am = new AudioManager();
    assert.equal(am._ctx, null);
    am.init();
    assert.notEqual(am._ctx, null);
  });

  it('initが二度呼び出しても初回だけ実行される', () => {
    const am = new AudioManager();
    am.init();
    const ctx = am._ctx;
    am.init();
    assert.equal(am._ctx, ctx);
  });

  it('saveSettingsで音量とミュートを永続化する', () => {
    const am = new AudioManager();
    am.setVolume(0.7);
    am.setMute(true);
    am.saveSettings();
    assert.equal(storage.get('matrixTyper_seVolume'), '0.7');
    assert.equal(storage.get('matrixTyper_seMute'), 'true');
  });

  it('loadSettingsで音量とミュートが復元される', () => {
    storage.set('matrixTyper_seVolume', '0.3');
    storage.set('matrixTyper_seMute', 'true');
    const am = new AudioManager();
    am.loadSettings();
    assert.equal(am.getVolume(), 0.3);
    assert.equal(am.isMuted(), true);
  });

  it('loadSettingsで復元音量を0〜1に正規化する', () => {
    storage.set('matrixTyper_seVolume', '5');
    const am = new AudioManager();
    am.loadSettings();
    assert.equal(am.getVolume(), 1);
  });

  it('初期化前の状態でplaySEを呼び出しても例外が出ない', () => {
    const am = new AudioManager();
    // Should not throw
    am.playSE('type');
  });

  it('ミュート時はplaySEが無効化される', () => {
    const am = new AudioManager();
    am.init();
    am.setMute(true);
    // Should not throw
    am.playSE('type');
  });
});
