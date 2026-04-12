import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../assets/config.js';

describe('CONFIG', () => {
  it('is a non-null object', () => {
    assert.equal(typeof CONFIG, 'object');
    assert.notEqual(CONFIG, null);
  });

  it('has timeLimit as a number', () => {
    assert.equal(typeof CONFIG.timeLimit, 'number');
    assert.ok(CONFIG.timeLimit > 0);
  });

  it('has countdownDuration as a number', () => {
    assert.equal(typeof CONFIG.countdownDuration, 'number');
    assert.ok(CONFIG.countdownDuration > 0);
  });

  it('has defaultCSVPath as a string', () => {
    assert.equal(typeof CONFIG.defaultCSVPath, 'string');
    assert.ok(CONFIG.defaultCSVPath.length > 0);
  });

  it('has scoring object with required fields', () => {
    assert.equal(typeof CONFIG.scoring, 'object');
    assert.equal(typeof CONFIG.scoring.pointPerQuestion, 'number');
    assert.equal(typeof CONFIG.scoring.missPoint, 'number');
  });

  it('does not have removed fields', () => {
    assert.equal('maxQuestions' in CONFIG, false);
    assert.equal('localStorage' in CONFIG, false);
    assert.equal('correctPoint' in CONFIG.scoring, false);
    assert.equal('completionBonus' in CONFIG.scoring, false);
  });
});
