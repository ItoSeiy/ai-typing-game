import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TypingEngine } from '../src/core/typing-engine.js';

describe('TypingEngine', () => {
  it('loadQuestion sets original and romaji', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('さくら', 'sakura');
    assert.equal(engine.original, 'さくら');
    assert.equal(engine.romaji, 'sakura');
    assert.equal(engine.currentPos, 0);
  });

  it('handleKeyPress returns correct:true for correct key', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('あ', 'a');
    const result = engine.handleKeyPress('a');
    assert.equal(result.correct, true);
  });

  it('handleKeyPress returns correct:false for wrong key', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('あ', 'a');
    const result = engine.handleKeyPress('b');
    assert.equal(result.correct, false);
    assert.equal(engine.currentPos, 0);
  });

  it('handleKeyPress advances currentPos on correct key', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('かき', 'kaki');
    engine.handleKeyPress('k');
    assert.equal(engine.currentPos, 1);
    engine.handleKeyPress('a');
    assert.equal(engine.currentPos, 2);
  });

  it('handleKeyPress does not advance on wrong key', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('か', 'ka');
    engine.handleKeyPress('z');
    assert.equal(engine.currentPos, 0);
  });

  it('returns completed:true when all characters typed', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('あ', 'a');
    const result = engine.handleKeyPress('a');
    assert.equal(result.completed, true);
    assert.equal(result.currentPos, 1);
    assert.equal(result.totalLen, 1);
  });

  it('returns completed:false when characters remain', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('かき', 'kaki');
    const result = engine.handleKeyPress('k');
    assert.equal(result.completed, false);
  });

  it('handleKeyPress after completion returns correct:false, completed:true', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('あ', 'a');
    engine.handleKeyPress('a');
    const result = engine.handleKeyPress('x');
    assert.equal(result.correct, false);
    assert.equal(result.completed, true);
  });

  it('reset() clears all state', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('さくら', 'sakura');
    engine.handleKeyPress('s');
    engine.handleKeyPress('a');
    engine.reset();
    assert.equal(engine.original, '');
    assert.equal(engine.romaji, '');
    assert.equal(engine.currentPos, 0);
  });

  it('getCurrentDisplay returns correct typed/remaining split', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('さくら', 'sakura');
    engine.handleKeyPress('s');
    engine.handleKeyPress('a');
    const display = engine.getCurrentDisplay();
    assert.equal(display.original, 'さくら');
    assert.equal(display.typed, 'sa');
    assert.equal(display.remaining, 'kura');
  });

  it('getCurrentDisplay before any input shows all remaining', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('てすと', 'tesuto');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, '');
    assert.equal(display.remaining, 'tesuto');
  });

  it('full sequence completes correctly', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('き', 'ki');
    const r1 = engine.handleKeyPress('k');
    assert.equal(r1.correct, true);
    assert.equal(r1.completed, false);
    const r2 = engine.handleKeyPress('i');
    assert.equal(r2.correct, true);
    assert.equal(r2.completed, true);
  });
});
