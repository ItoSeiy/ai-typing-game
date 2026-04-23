import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';

class MockClassList {
  constructor() {
    this._classes = new Set();
  }
  add(...names) {
    for (const n of names) this._classes.add(n);
  }
  remove(...names) {
    for (const n of names) this._classes.delete(n);
  }
  contains(name) {
    return this._classes.has(name);
  }
  toggle(name, force) {
    if (force === true) {
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
    this.src = '';
    this._listeners = new Map();
  }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  addEventListener(type, handler) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(handler);
  }
}

class MockContainer extends MockElement {
  constructor() {
    super('div');
    this.innerHTML = '';
  }
}

const originalDocument = globalThis.document;
const originalBody = globalThis.document?.body;

globalThis.document = {
  createElement(tagName) {
    return new MockElement(tagName);
  },
  body: { classList: new MockClassList() }
};

const { GameScreen } = await import('../src/ui/game-screen.js');

describe('GameScreen.resetState', () => {
  after(() => {
    globalThis.document = originalDocument;
  });

  it('typed/remaining/score/timer を初期化し countdown を隠す', () => {
    const container = new MockContainer();
    const screen = new GameScreen(container);

    // 汚した状態を作る
    screen.updateQuestion('前の問題', 'image.png');
    screen.updateTyping('typed', 'remaining');
    screen.updateScore(123);
    screen.updateTimer(15); // _maxTime=15
    screen.updateTimer(5);  // 残り 5 秒で danger class 付与
    screen.showCountdown(3);

    assert.equal(screen.questionText.textContent, '前の問題');
    assert.equal(screen.typedSpan.textContent, 'typed');
    assert.equal(screen.scoreEl.textContent, 'SCORE: 123');
    assert.equal(screen.countdownEl.style.display, 'flex');
    assert.ok(screen.timerBar.classList.contains('game-screen__timer-bar--danger'));

    screen.resetState();

    assert.equal(screen.questionText.textContent, '');
    assert.equal(screen.questionImage.style.display, 'none');
    assert.equal(screen.typedSpan.textContent, '');
    assert.equal(screen.remainingSpan.textContent, '');
    assert.equal(screen.scoreEl.textContent, 'SCORE: 0');
    assert.equal(screen.timerBar.style.width, '100%');
    assert.equal(screen.countdownEl.style.display, 'none');
    assert.equal(screen._firstTimerCall, undefined);
    assert.ok(!screen.timerBar.classList.contains('game-screen__timer-bar--danger'));
  });

  it('副作用なしで複数回呼んでも安全（再入可能）', () => {
    const container = new MockContainer();
    const screen = new GameScreen(container);
    screen.updateScore(50);

    screen.resetState();
    screen.resetState();
    screen.resetState();

    assert.equal(screen.scoreEl.textContent, 'SCORE: 0');
    assert.equal(screen.timerBar.style.width, '100%');
  });

  it('resetState 後に updateTimer を呼ぶと _maxTime が再設定される', () => {
    const container = new MockContainer();
    const screen = new GameScreen(container);

    screen.updateTimer(60); // _maxTime=60
    screen.resetState();
    assert.equal(screen._firstTimerCall, undefined);

    screen.updateTimer(30); // _maxTime=30 に再設定される
    assert.equal(screen._maxTime, 30);
    assert.equal(screen.timerText.textContent, '30');
  });
});
