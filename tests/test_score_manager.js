import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ScoreManager } from '../src/core/score-manager.js';

describe('ScoreManager', () => {
  it('initial score is 0', () => {
    const sm = new ScoreManager();
    assert.equal(sm.getScore(), 0);
  });

  it('addCorrect increases score by correctPoint', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    assert.equal(sm.getScore(), 10);
  });

  it('addCorrect increments correctCount', () => {
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

  it('addMiss does not add score (missPoint=0)', () => {
    const sm = new ScoreManager();
    sm.addMiss();
    assert.equal(sm.getScore(), 0);
  });

  it('addCompletionBonus adds 50 points', () => {
    const sm = new ScoreManager();
    sm.addCompletionBonus();
    assert.equal(sm.getScore(), 50);
  });

  it('getAccuracy returns 100 when no keystrokes', () => {
    const sm = new ScoreManager();
    assert.equal(sm.getAccuracy(), 100);
  });

  it('getAccuracy calculates correctly with mixed input', () => {
    const sm = new ScoreManager();
    sm.addCorrect(); // 1 correct
    sm.addMiss();    // 1 miss
    // accuracy = 1/2 = 50%
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
    sm.reset();
    assert.equal(sm.getScore(), 0);
    assert.equal(sm.getCorrectCount(), 0);
    assert.equal(sm.getMissCount(), 0);
  });

  it('score accumulates across multiple correct inputs', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    sm.addCorrect();
    sm.addCorrect();
    sm.addCompletionBonus();
    assert.equal(sm.getScore(), 80); // 10*3 + 50
  });
});
