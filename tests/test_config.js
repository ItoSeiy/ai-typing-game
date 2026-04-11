import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../data/config.js';

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

  it('has maxQuestions field', () => {
    assert.ok('maxQuestions' in CONFIG);
    assert.equal(typeof CONFIG.maxQuestions, 'number');
  });

  it('has defaultCSVPath as a string', () => {
    assert.equal(typeof CONFIG.defaultCSVPath, 'string');
    assert.ok(CONFIG.defaultCSVPath.length > 0);
  });

  it('has scoring object with required fields', () => {
    assert.equal(typeof CONFIG.scoring, 'object');
    assert.equal(typeof CONFIG.scoring.correctPoint, 'number');
    assert.equal(typeof CONFIG.scoring.missPoint, 'number');
    assert.equal(typeof CONFIG.scoring.completionBonus, 'number');
  });

  it('has localStorage object with required keys', () => {
    assert.equal(typeof CONFIG.localStorage, 'object');
    assert.equal(typeof CONFIG.localStorage.seVolumeKey, 'string');
    assert.equal(typeof CONFIG.localStorage.seMuteKey, 'string');
    assert.equal(typeof CONFIG.localStorage.highScoreKey, 'string');
  });
});
