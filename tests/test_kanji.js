import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TypingEngine } from '../src/core/typing-engine.js';

/** ヘルパー: 文字列を1文字ずつ入力し、全キーが correct かつ最後に completed になることを検証 */
function typeFullString(engine, str) {
  for (let i = 0; i < str.length; i++) {
    const result = engine.handleKeyPress(str[i]);
    assert.equal(result.correct, true, `key '${str[i]}' at index ${i} should be correct`);
    if (i === str.length - 1) {
      assert.equal(result.completed, true, 'should be completed after last key');
    } else {
      assert.equal(result.completed, false, `should not be completed at index ${i}`);
    }
  }
}

describe('漢字お題フォールバック', () => {
  it('陸上 → "rikujou" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('陸上', 'rikujou');
    typeFullString(engine, 'rikujou');
  });

  it('野球 → "yakyuu" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('野球', 'yakyuu');
    typeFullString(engine, 'yakyuu');
  });

  it('富士山 → "fujisan" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('富士山', 'fujisan');
    typeFullString(engine, 'fujisan');
  });

  it('桜 → "sakura" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('桜', 'sakura');
    typeFullString(engine, 'sakura');
  });

  it('寿司 → "sushi" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('寿司', 'sushi');
    typeFullString(engine, 'sushi');
  });

  it('漢字お題で不正キーは correct:false', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('猫', 'neko');
    const result = engine.handleKeyPress('z');
    assert.equal(result.correct, false);
    assert.equal(result.completed, false);
  });

  it('漢字お題の getCurrentDisplay が正しい typed/remaining', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('侍', 'samurai');
    assert.equal(engine.getCurrentDisplay().typed, '');
    assert.equal(engine.getCurrentDisplay().remaining, 'samurai');

    engine.handleKeyPress('s');
    engine.handleKeyPress('a');
    engine.handleKeyPress('m');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, 'sam');
    assert.equal(display.remaining, 'urai');
  });

  it('漢字お題で original は元の日本語テキスト', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('富士山', 'fujisan');
    assert.equal(engine.getCurrentDisplay().original, '富士山');
  });
});

describe('ひらがな/カタカナ退行なし', () => {
  it('し → "shi" でも "si" でも正解（複数パターン維持）', () => {
    const engine1 = new TypingEngine();
    engine1.loadQuestion('し', 'si');
    typeFullString(engine1, 'shi');

    const engine2 = new TypingEngine();
    engine2.loadQuestion('し', 'si');
    typeFullString(engine2, 'si');
  });

  it('カタカナ: ラーメン → "ra-men" で正解（末尾ん は n 一打で確定）', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ラーメン', 'ra-menn');
    // 末尾の ん は最終チャンクなので "n" 一打で即確定される
    typeFullString(engine, 'ra-men');
  });

  it('ひらがなお題は引き続きチャンク分割（さくら → sakura）', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('さくら', 'sakura');
    typeFullString(engine, 'sakura');
    assert.equal(engine.getCurrentDisplay().typed, 'sakura');
  });

  it('ち → "chi" でも "ti" でも正解', () => {
    const engine1 = new TypingEngine();
    engine1.loadQuestion('ち', 'chi');
    typeFullString(engine1, 'chi');

    const engine2 = new TypingEngine();
    engine2.loadQuestion('ち', 'chi');
    typeFullString(engine2, 'ti');
  });
});

describe('混在テスト', () => {
  it('焼き鳥 → "yakitori" で正解（漢字+ひらがな混在）', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('焼き鳥', 'yakitori');
    typeFullString(engine, 'yakitori');
  });

  it('お花見 → "ohanami" で正解（ひらがな+漢字混在）', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('お花見', 'ohanami');
    typeFullString(engine, 'ohanami');
  });
});

describe('フォールバック表示テスト', () => {
  it('フォールバック時の初期表示: typed="" remaining=全文', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('漢字', 'kanji');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, '');
    assert.equal(display.remaining, 'kanji');
  });

  it('フォールバック時の途中表示が正しい', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('漢字', 'kanji');
    engine.handleKeyPress('k');
    engine.handleKeyPress('a');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, 'ka');
    assert.equal(display.remaining, 'nji');
  });

  it('フォールバック時の完了後表示', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('猫', 'neko');
    typeFullString(engine, 'neko');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, 'neko');
    assert.equal(display.remaining, '');
  });
});
