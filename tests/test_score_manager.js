import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../assets/config.js';
import { ScoreManager } from '../src/core/score-manager.js';

describe('ScoreManager（得点管理）', () => {
  it('初期スコアが0である', () => {
    const sm = new ScoreManager();
    assert.equal(sm.getScore(), 0);
  });

  it('addCorrectでcorrectCountが増えるが得点は増えない', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    assert.equal(sm.getCorrectCount(), 1);
    assert.equal(sm.getScore(), 0);
  });

  it('addCorrectを複数回呼ぶとcorrectCountが増える', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    sm.addCorrect();
    assert.equal(sm.getCorrectCount(), 2);
  });

  it('addMissでmissCountが増える', () => {
    const sm = new ScoreManager();
    sm.addMiss();
    assert.equal(sm.getMissCount(), 1);
  });

  it('addMissがCONFIG.scoring.missPointを適用する', () => {
    const sm = new ScoreManager();
    sm.addMiss();
    assert.equal(sm.getScore(), CONFIG.scoring.missPoint);
  });

  it('addQuestionCompleteが文字数×CONFIG.scoring.pointPerCharで加算する', () => {
    const sm = new ScoreManager();
    sm.addQuestionComplete(5);
    assert.equal(sm.getScore(), CONFIG.scoring.pointPerChar * 5);
  });

  it('入力なし時の正確性は100を返す', () => {
    const sm = new ScoreManager();
    assert.equal(sm.getAccuracy(), 100);
  });

  it('正誤混在でも正確性が正しく計算される', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    sm.addMiss();
    assert.equal(sm.getAccuracy(), 50);
  });

  it('全て正解なら正確性が100となる', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    sm.addCorrect();
    sm.addCorrect();
    assert.equal(sm.getAccuracy(), 100);
  });

  it('getTotalKeystrokesがcorrect＋missを返す', () => {
    const sm = new ScoreManager();
    sm.addCorrect();
    sm.addCorrect();
    sm.addMiss();
    assert.equal(sm.getTotalKeystrokes(), 3);
  });

  it('resetで各種カウンタがリセットされる', () => {
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

  it('問題完了でスコアが蓄積される', () => {
    const sm = new ScoreManager();
    sm.addQuestionComplete(2);
    sm.addQuestionComplete(3);
    assert.equal(sm.getScore(), CONFIG.scoring.pointPerChar * 5);
  });
});

describe('ScoreManager CONFIG駆動挙動', () => {
  const origPointPerChar = CONFIG.scoring.pointPerChar;
  const origMissPoint = CONFIG.scoring.missPoint;

  afterEach(() => {
    CONFIG.scoring.pointPerChar = origPointPerChar;
    CONFIG.scoring.missPoint = origMissPoint;
  });

  it('pointPerChar=30の場合、1問完了の加点は文字数比例になる', () => {
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

  it('ミス1回で5点減る場合の挙動', () => {
    CONFIG.scoring.missPoint = -5;
    const sm = new ScoreManager();
    sm.addMiss();
    assert.equal(sm.getScore(), -5);
  });
});
