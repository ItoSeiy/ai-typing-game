import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../assets/config.js';
import { ScoreManager } from '../src/core/score-manager.js';

describe('ScoreManager', () => {
  it('initial score is 0', () => {
    const sm = new ScoreManager();
    assert.equal(sm.getScore(), 0);
  });

  it('addCorrect increments correctCount but does not add score', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    assert.equal(sm.getCorrectCount(), 1);
    assert.equal(sm.getScore(), 0);
  });

  it('addCorrect increments correctCount multiple times', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    sm.addCorrect();
    assert.equal(sm.getCorrectCount(), 2);
  });

  it('addMiss increments missCount', () => {
    const sm = new ScoreManager();
    sm.addMiss();
    assert.equal(sm.getMissCount(), 1);
  });

  it('addMiss applies CONFIG.scoring.missPoint', () => {
    const sm = new ScoreManager();
    sm.addMiss();
    assert.equal(sm.getScore(), CONFIG.scoring.missPoint);
  });

  it('addQuestionComplete adds CONFIG.scoring.pointPerChar × kanaLength', () => {
    const sm = new ScoreManager();
    sm.addQuestionComplete(5);
    assert.equal(sm.getScore(), CONFIG.scoring.pointPerChar * 5);
  });

  it('getAccuracy returns 100 when no keystrokes', () => {
    const sm = new ScoreManager();
    assert.equal(sm.getAccuracy(), 100);
  });

  it('getAccuracy calculates correctly with mixed input', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    sm.addMiss();
    assert.equal(sm.getAccuracy(), 50);
  });

  it('getAccuracy with all correct returns 100', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    sm.addCorrect();
    sm.addCorrect();
    assert.equal(sm.getAccuracy(), 100);
  });

  it('getTotalKeystrokes returns correct + miss', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    sm.addCorrect();
    sm.addMiss();
    assert.equal(sm.getTotalKeystrokes(), 3);
  });

  it('reset clears all counters', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    sm.addCorrect();
    sm.addMiss();
    sm.addQuestionComplete(3);
    sm.reset();
    assert.equal(sm.getScore(), 0);
    assert.equal(sm.getCorrectCount(), 0);
    assert.equal(sm.getMissCount(), 0);
  });

  it('score accumulates across question completions', () => {
    const sm = new ScoreManager();
    sm.addQuestionComplete(2);
    sm.addQuestionComplete(3);
    assert.equal(sm.getScore(), CONFIG.scoring.pointPerChar * 5);
  });
});

describe('ScoreManager CONFIG-driven behavior', () => {
  const origPointPerChar = CONFIG.scoring.pointPerChar;
  const origMissPoint = CONFIG.scoring.missPoint;

  afterEach(() => {
    CONFIG.scoring.pointPerChar = origPointPerChar;
    CONFIG.scoring.missPoint = origMissPoint;
  });

  it('pointPerChar=30 → 1問完了で文字数比例の加点', () => {
    CONFIG.scoring.pointPerChar = 30;
    const sm = new ScoreManager();
    sm.addQuestionComplete(4);
    assert.equal(sm.getScore(), 120);
  });

  it('短いお題と長いお題でスコアが異なる', () => {
    const shortSm = new ScoreManager();
    shortSm.addQuestionComplete(2);

    const longSm = new ScoreManager();
    longSm.addQuestionComplete(7);

    assert.equal(shortSm.getScore(), CONFIG.scoring.pointPerChar * 2);
    assert.equal(longSm.getScore(), CONFIG.scoring.pointPerChar * 7);
    assert.notEqual(shortSm.getScore(), longSm.getScore());
  });

  it('missPoint=-5 → ミス1回で5点減算', () => {
    CONFIG.scoring.missPoint = -5;
    const sm = new ScoreManager();
    sm.addMiss();
    assert.equal(sm.getScore(), -5);
  });
});
