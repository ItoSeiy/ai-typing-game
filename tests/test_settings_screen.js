import { describe, it, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';

class MockClassList {
  constructor() {
    this._classes = new Set();
  }

  toggle(name, force) {
    if (force) {
      this._classes.add(name);
      return true;
    }
    if (force === false) {
      this._classes.delete(name);
      return false;
    }
    if (this._classes.has(name)) {
      this._classes.delete(name);
      return false;
    }
    this._classes.add(name);
    return true;
  }
}

class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.style = {};
    this.className = '';
    this.classList = new MockClassList();
    this.textContent = '';
    this.value = '';
    this.type = '';
    this.min = '';
    this.max = '';
    this._listeners = new Map();
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener(type, handler) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }
    this._listeners.get(type).push(handler);
  }

  dispatchEvent(event) {
    const handlers = this._listeners.get(event.type) || [];
    for (const handler of handlers) {
      handler(event);
    }
  }
}

class MockContainer extends MockElement {
  constructor() {
    super('div');
    this.innerHTML = '';
  }
}

const originalDocument = globalThis.document;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;

let timers;
let nextTimerId;

function installTimerMock() {
  timers = new Map();
  nextTimerId = 1;
  globalThis.setTimeout = (fn, delay) => {
    const id = nextTimerId++;
    timers.set(id, { fn, delay });
    return id;
  };
  globalThis.clearTimeout = (id) => {
    timers.delete(id);
  };
}

function runTimer(id) {
  const timer = timers.get(id);
  assert.ok(timer, `expected timer ${id} to exist`);
  timers.delete(id);
  timer.fn();
}

globalThis.document = {
  createElement(tagName) {
    return new MockElement(tagName);
  }
};

const { SettingsScreen } = await import('../src/ui/settings-screen.js');

describe('SettingsScreen（設定画面）', () => {
  beforeEach(() => {
    installTimerMock();
  });

  afterEach(() => {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  });

  after(() => {
    globalThis.document = originalDocument;
  });

  it('ボリュームスライダー操作中にプレビュー再生をデバウンスする', () => {
    const container = new MockContainer();
    const screen = new SettingsScreen(container);
    const calls = [];
    screen.setAudioManager({
      setVolume(v) {
        calls.push(['setVolume', v]);
      },
      setMute() {},
      playPreviewSE() {
        calls.push(['preview']);
      }
    });

    screen.volumeSlider.value = '60';
    screen.volumeSlider.dispatchEvent({ type: 'input' });
    screen.volumeSlider.value = '70';
    screen.volumeSlider.dispatchEvent({ type: 'input' });

    assert.deepEqual(calls.slice(0, 2), [
      ['setVolume', 0.6],
      ['setVolume', 0.7]
    ]);
    assert.equal(timers.size, 1);

    runTimer([...timers.keys()][0]);
    assert.deepEqual(calls.at(-1), ['preview']);
  });

  it('ミュート中は再生せず、解除時に1回だけ再生する', () => {
    const container = new MockContainer();
    const screen = new SettingsScreen(container);
    const calls = [];
    const audioManager = {
      setVolume(v) {
        calls.push(['setVolume', v]);
      },
      setMute(v) {
        calls.push(['setMute', v]);
      },
      playPreviewSE() {
        calls.push(['preview']);
      }
    };
    screen.setAudioManager(audioManager);

    screen.muteBtn.dispatchEvent({ type: 'click' });
    assert.deepEqual(calls, [
      ['setMute', true]
    ]);

    screen.volumeSlider.value = '40';
    screen.volumeSlider.dispatchEvent({ type: 'input' });
    assert.equal(timers.size, 0);
    assert.deepEqual(calls.at(-1), ['setVolume', 0.4]);

    screen.muteBtn.dispatchEvent({ type: 'click' });
    assert.deepEqual(calls.slice(-2), [
      ['setMute', false],
      ['preview']
    ]);
  });
});
