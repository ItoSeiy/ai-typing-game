import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TypingEngine } from '../src/core/typing-engine.js';

/** ヘルパー: 文字列を1文字ずつエンジンに入力し、全て correct かつ最後が completed であることを検証 */
function typeFullSequence(engine, keys) {
  for (let i = 0; i < keys.length; i++) {
    const result = engine.handleKeyPress(keys[i]);
    assert.equal(result.correct, true, `key '${keys[i]}' at index ${i} should be correct`);
    if (i === keys.length - 1) {
      assert.equal(result.completed, true, `last key should complete the input`);
    }
  }
}

describe('Multi-Romaji Patterns', () => {
  // ── 基本複数パターンテスト ──

  it('し: "shi" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('し', '');
    typeFullSequence(engine, 'shi');
  });

  it('し: "si" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('し', '');
    typeFullSequence(engine, 'si');
  });

  it('ち: "chi" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ち', '');
    typeFullSequence(engine, 'chi');
  });

  it('ち: "ti" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ち', '');
    typeFullSequence(engine, 'ti');
  });

  it('つ: "tsu" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('つ', '');
    typeFullSequence(engine, 'tsu');
  });

  it('つ: "tu" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('つ', '');
    typeFullSequence(engine, 'tu');
  });

  it('ふ: "fu" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ふ', '');
    typeFullSequence(engine, 'fu');
  });

  it('ふ: "hu" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ふ', '');
    typeFullSequence(engine, 'hu');
  });

  it('じ: "ji" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('じ', '');
    typeFullSequence(engine, 'ji');
  });

  it('じ: "zi" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('じ', '');
    typeFullSequence(engine, 'zi');
  });

  it('を: "wo" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('を', '');
    typeFullSequence(engine, 'wo');
  });

  it('を: "o" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('を', '');
    typeFullSequence(engine, 'o');
  });
});

describe('Youon (拗音) Patterns', () => {
  it('しゃ: "sha" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('しゃ', '');
    typeFullSequence(engine, 'sha');
  });

  it('しゃ: "sya" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('しゃ', '');
    typeFullSequence(engine, 'sya');
  });

  it('ちゃ: "cha" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ちゃ', '');
    typeFullSequence(engine, 'cha');
  });

  it('ちゃ: "tya" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ちゃ', '');
    typeFullSequence(engine, 'tya');
  });

  it('ちゃ: "cya" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ちゃ', '');
    typeFullSequence(engine, 'cya');
  });

  it('じゃ: "ja" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('じゃ', '');
    typeFullSequence(engine, 'ja');
  });

  it('じゃ: "zya" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('じゃ', '');
    typeFullSequence(engine, 'zya');
  });

  it('じゃ: "jya" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('じゃ', '');
    typeFullSequence(engine, 'jya');
  });
});

describe('Sokuon (促音) Patterns', () => {
  it('っか: "kka" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('っか', '');
    typeFullSequence(engine, 'kka');
  });

  it('っち: "cchi" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('っち', '');
    typeFullSequence(engine, 'cchi');
  });

  it('っち: "tti" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('っち', '');
    typeFullSequence(engine, 'tti');
  });

  it('っ単体: "xtu" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('っ', '');
    typeFullSequence(engine, 'xtu');
  });

  it('っ単体: "ltu" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('っ', '');
    typeFullSequence(engine, 'ltu');
  });
});

describe('"ん" Context-Dependent Patterns', () => {
  it('かんた: "kanta" で正解 (n単打 + 子音)', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('かんた', '');
    typeFullSequence(engine, 'kanta');
  });

  it('かんた: "kannta" で正解 (nn + ta)', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('かんた', '');
    typeFullSequence(engine, 'kannta');
  });

  it('かんあ: "kanna" で正解 (nn必須 — 次が母音)', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('かんあ', '');
    typeFullSequence(engine, 'kanna');
  });

  it('かん（末尾）: "kan" で正解 (末尾のn単打OK)', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('かん', '');
    typeFullSequence(engine, 'kan');
  });
});

describe('Compound Patterns (複合テスト)', () => {
  it('しっかり: "sikkari" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('しっかり', '');
    typeFullSequence(engine, 'sikkari');
  });

  it('しっかり: "shikkari" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('しっかり', '');
    typeFullSequence(engine, 'shikkari');
  });
});

describe('getCurrentDisplay Tracking', () => {
  it('入力に応じてtyped/remainingが正しく変化する', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('しか', '');

    // 初期状態
    let display = engine.getCurrentDisplay();
    assert.equal(display.typed, '');
    // remaining は最短パターン: し→si(2), か→ka(2) = "sika"
    assert.equal(display.remaining, 'sika');

    // 's' を入力 → 'shi' or 'si' のプレフィックスにマッチ
    engine.handleKeyPress('s');
    display = engine.getCurrentDisplay();
    assert.equal(display.typed, 's');

    // 'i' を入力 → 'si' で完全一致、チャンク確定
    engine.handleKeyPress('i');
    display = engine.getCurrentDisplay();
    assert.equal(display.typed, 'si');
    assert.equal(display.remaining, 'ka');

    // 'k' を入力
    engine.handleKeyPress('k');
    display = engine.getCurrentDisplay();
    assert.equal(display.typed, 'sik');
    assert.equal(display.remaining, 'a');

    // 'a' を入力 → 完了
    const result = engine.handleKeyPress('a');
    assert.equal(result.completed, true);
    display = engine.getCurrentDisplay();
    assert.equal(display.typed, 'sika');
    assert.equal(display.remaining, '');
  });
});

describe('Mistype Handling', () => {
  it('不正キー入力で correct: false、位置変わらず', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('か', '');

    const before = engine.getCurrentDisplay();
    const result = engine.handleKeyPress('z');
    assert.equal(result.correct, false);
    const after = engine.getCurrentDisplay();
    assert.equal(before.typed, after.typed);
    assert.equal(before.remaining, after.remaining);
  });

  it('途中の不正キーで位置が戻らない', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('かき', '');

    engine.handleKeyPress('k');
    engine.handleKeyPress('a');
    // かき: 'ka' 完了、次は 'ki'
    const beforeMiss = engine.getCurrentDisplay();
    assert.equal(beforeMiss.typed, 'ka');

    const result = engine.handleKeyPress('z');
    assert.equal(result.correct, false);
    const afterMiss = engine.getCurrentDisplay();
    assert.equal(afterMiss.typed, 'ka');
    assert.equal(afterMiss.remaining, 'ki');
  });
});
