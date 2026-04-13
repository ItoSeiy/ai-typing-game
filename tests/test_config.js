import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../assets/config.js';

describe('CONFIG（設定値）', () => {
  it('非nullのオブジェクトである', () => {
    assert.equal(typeof CONFIG, 'object');
    assert.notEqual(CONFIG, null);
  });

  it('timeLimitが数値である', () => {
    assert.equal(typeof CONFIG.timeLimit, 'number');
    assert.ok(CONFIG.timeLimit > 0);
  });

  it('countdownDurationが数値である', () => {
    assert.equal(typeof CONFIG.countdownDuration, 'number');
    assert.ok(CONFIG.countdownDuration > 0);
  });

  it('defaultCSVPathが文字列である', () => {
    assert.equal(typeof CONFIG.defaultCSVPath, 'string');
    assert.ok(CONFIG.defaultCSVPath.length > 0);
  });

  it('scoringオブジェクトに必要項目が含まれる', () => {
    assert.equal(typeof CONFIG.scoring, 'object');
    assert.equal(typeof CONFIG.scoring.pointPerChar, 'number');
    assert.equal(typeof CONFIG.scoring.missPoint, 'number');
  });

  it('削除済みフィールドが存在しない', () => {
    assert.equal('maxQuestions' in CONFIG, false);
    assert.equal('localStorage' in CONFIG, false);
    assert.equal('pointPerQuestion' in CONFIG.scoring, false);
    assert.equal('correctPoint' in CONFIG.scoring, false);
    assert.equal('completionBonus' in CONFIG.scoring, false);
  });
});
