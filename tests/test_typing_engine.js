import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TypingEngine } from '../src/core/typing-engine.js';

describe('TypingEngine（タイピングエンジン）', () => {
  it('loadQuestionでoriginalを設定し入力状態を初期化', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('さくら', 'さくら');
    assert.equal(engine.original, 'さくら');
    const display = engine.getCurrentDisplay();
    assert.equal(display.remaining, 'sakura');
    assert.equal(display.typed, '');
  });

  it('正解キーでhandleKeyPressがcorrect:trueを返す', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('あ', 'あ');
    const result = engine.handleKeyPress('a');
    assert.equal(result.correct, true);
  });

  it('誤入力でhandleKeyPressがcorrect:falseを返す', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('あ', 'あ');
    const result = engine.handleKeyPress('b');
    assert.equal(result.correct, false);
    assert.equal(result.currentPos, 0);
  });

  it('正しいキーでcurrentPosが進む', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('かき', 'かき');
    const r1 = engine.handleKeyPress('k');
    assert.equal(r1.currentPos, 1);
    const r2 = engine.handleKeyPress('a');
    assert.equal(r2.currentPos, 2);
  });

  it('誤入力ではcurrentPosが進まない', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('か', 'か');
    const result = engine.handleKeyPress('z');
    assert.equal(result.currentPos, 0);
  });

  it('全文字入力時にcompleted:trueが返る', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('あ', 'あ');
    const result = engine.handleKeyPress('a');
    assert.equal(result.completed, true);
    assert.equal(result.currentPos, 1);
    assert.equal(result.totalLen, 1);
  });

  it('未入力文字がある場合はcompleted:false', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('かき', 'かき');
    const result = engine.handleKeyPress('k');
    assert.equal(result.completed, false);
  });

  it('完了後はcorrect:falseかつcompleted:trueが返る', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('あ', 'あ');
    engine.handleKeyPress('a');
    const result = engine.handleKeyPress('x');
    assert.equal(result.correct, false);
    assert.equal(result.completed, true);
  });

  it('resetで全状態がクリアされる', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('さくら', 'さくら');
    engine.handleKeyPress('s');
    engine.handleKeyPress('a');
    engine.reset();
    assert.equal(engine.original, '');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, '');
    assert.equal(display.remaining, '');
  });

  it('getCurrentDisplayがtyped/remainingを正しく分割して返す', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('さくら', 'さくら');
    engine.handleKeyPress('s');
    engine.handleKeyPress('a');
    const display = engine.getCurrentDisplay();
    assert.equal(display.original, 'さくら');
    assert.equal(display.typed, 'sa');
    assert.equal(display.remaining, 'kura');
  });

  it('入力前にgetCurrentDisplayが残りだけを示す', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('てすと', 'てすと');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, '');
    assert.equal(display.remaining, 'tesuto');
  });

  it('一連入力で正しく完了する', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('き', 'き');
    const r1 = engine.handleKeyPress('k');
    assert.equal(r1.correct, true);
    assert.equal(r1.completed, false);
    const r2 = engine.handleKeyPress('i');
    assert.equal(r2.correct, true);
    assert.equal(r2.completed, true);
  });

  it('記号を含む問題を正しく入力できる', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('いざ！', 'いざ！');
    const inputs = ['i', 'z', 'a', '!'];

    let result;
    for (const key of inputs) {
      result = engine.handleKeyPress(key);
      assert.equal(result.correct, true, `key=${key}`);
    }

    assert.equal(result.completed, true);
    assert.equal(result.currentPos, 4);
  });
});
