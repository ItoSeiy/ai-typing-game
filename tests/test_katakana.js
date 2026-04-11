import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TypingEngine } from '../src/core/typing-engine.js';

/** ヘルパー: キー列を順に入力し、全て correct かつ最後が completed であることを検証 */
function typeAll(engine, keys) {
  for (let i = 0; i < keys.length; i++) {
    const result = engine.handleKeyPress(keys[i]);
    assert.equal(result.correct, true, `key '${keys[i]}' at index ${i} should be correct`);
    if (i === keys.length - 1) {
      assert.equal(result.completed, true, 'should be completed after last key');
    }
  }
}

describe('カタカナ正規化', () => {
  it('カタカナ「ラーメン」をロードしてチャンク分割が正常動作する', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ラーメン', 'ra-menn');
    assert.ok(engine.chunks.length > 0, 'chunks should not be empty');
    const display = engine.getCurrentDisplay();
    assert.ok(display.remaining.length > 0, 'remaining should not be empty');
  });

  it('「ラーメン」を ra-men で入力完了できる（末尾ん=n単打確定）', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ラーメン', '');
    typeAll(engine, 'ra-men'.split(''));
  });

  it('「サッカー」(促音+カタカナ) を sakka- で入力完了できる', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('サッカー', '');
    typeAll(engine, 'sakka-'.split(''));
  });

  it('「インターネット」を正しく分割・入力できる', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('インターネット', '');
    // いんたーねっと → innta-netto
    typeAll(engine, 'innta-netto'.split(''));
  });

  it('「テスト」を tesuto で入力完了できる', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('テスト', '');
    typeAll(engine, 'tesuto'.split(''));
  });

  it('「パソコン」を pasokon で入力完了できる（末尾ん=n単打確定）', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('パソコン', '');
    typeAll(engine, 'pasokon'.split(''));
  });
});

describe('伸ばし棒テスト', () => {
  it('「ー」単体を "-" キーで入力できる', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ー', '');
    const result = engine.handleKeyPress('-');
    assert.equal(result.correct, true);
    assert.equal(result.completed, true);
  });

  it('「コーヒー」を ko-hi- で入力完了できる', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('コーヒー', '');
    typeAll(engine, 'ko-hi-'.split(''));
  });
});

describe('ひらがな・カタカナ混在テスト', () => {
  it('originalプロパティは変換前のテキストを保持する', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('タワー', '');
    assert.equal(engine.original, 'タワー');
  });

  it('カタカナ部分のみ含む「タワー」を tawa- で入力できる', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('タワー', '');
    typeAll(engine, 'tawa-'.split(''));
  });
});

describe('既存ひらがなテスト非影響', () => {
  it('ひらがなのみ「さくら」がこれまで通り動作する', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('さくら', '');
    typeAll(engine, 'sakura'.split(''));
  });

  it('ひらがなの促音「きって」がこれまで通り動作する', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('きって', '');
    typeAll(engine, 'kitte'.split(''));
  });

  it('ひらがなの拗音「しゃしん」がこれまで通り動作する', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('しゃしん', '');
    typeAll(engine, 'shasin'.split(''));
  });

  it('ひらがなの「ん」が正しく処理される（末尾=n単打確定）', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ほん', '');
    typeAll(engine, 'hon'.split(''));
  });
});
