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

describe('漢字お題（text_kana方式）', () => {
  it('陸上(りくじょう) → "rikujou" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('陸上', 'りくじょう');
    typeFullString(engine, 'rikujou');
  });

  it('陸上(りくじょう) → "rikuzyou" でも正解（複数パターン）', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('陸上', 'りくじょう');
    typeFullString(engine, 'rikuzyou');
  });

  it('野球(やきゅう) → "yakyuu" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('野球', 'やきゅう');
    typeFullString(engine, 'yakyuu');
  });

  it('富士山(ふじさん) → "fujisan" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('富士山', 'ふじさん');
    typeFullString(engine, 'fujisan');
  });

  it('富士山(ふじさん) → "huzisan" でも正解（複数パターン）', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('富士山', 'ふじさん');
    typeFullString(engine, 'huzisan');
  });

  it('桜(さくら) → "sakura" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('桜', 'さくら');
    typeFullString(engine, 'sakura');
  });

  it('寿司(すし) → "sushi" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('寿司', 'すし');
    typeFullString(engine, 'sushi');
  });

  it('寿司(すし) → "susi" でも正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('寿司', 'すし');
    typeFullString(engine, 'susi');
  });

  it('漢字お題で不正キーは correct:false', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('猫', 'ねこ');
    const result = engine.handleKeyPress('z');
    assert.equal(result.correct, false);
    assert.equal(result.completed, false);
  });

  it('漢字お題の getCurrentDisplay が正しい typed/remaining', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('侍', 'さむらい');
    assert.equal(engine.getCurrentDisplay().typed, '');
    assert.equal(engine.getCurrentDisplay().remaining, 'samurai');

    engine.handleKeyPress('s');
    engine.handleKeyPress('a');
    engine.handleKeyPress('m');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, 'sam');
    assert.equal(display.remaining, 'urai');
  });

  it('漢字お題で original は元の表示テキスト', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('富士山', 'ふじさん');
    assert.equal(engine.getCurrentDisplay().original, '富士山');
  });
});

describe('ひらがな/カタカナ退行なし', () => {
  it('し → "shi" でも "si" でも正解（複数パターン維持）', () => {
    const engine1 = new TypingEngine();
    engine1.loadQuestion('し', 'し');
    typeFullString(engine1, 'shi');

    const engine2 = new TypingEngine();
    engine2.loadQuestion('し', 'し');
    typeFullString(engine2, 'si');
  });

  it('カタカナ: ラーメン(らーめん) → "ra-men" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('ラーメン', 'らーめん');
    typeFullString(engine, 'ra-men');
  });

  it('ひらがなお題は引き続きチャンク分割（さくら → sakura）', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('さくら', 'さくら');
    typeFullString(engine, 'sakura');
    assert.equal(engine.getCurrentDisplay().typed, 'sakura');
  });

  it('ち → "chi" でも "ti" でも正解', () => {
    const engine1 = new TypingEngine();
    engine1.loadQuestion('ち', 'ち');
    typeFullString(engine1, 'chi');

    const engine2 = new TypingEngine();
    engine2.loadQuestion('ち', 'ち');
    typeFullString(engine2, 'ti');
  });
});

describe('混在テスト', () => {
  it('焼き鳥(やきとり) → "yakitori" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('焼き鳥', 'やきとり');
    typeFullString(engine, 'yakitori');
  });

  it('納豆(なっとう) → "nattou" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('納豆', 'なっとう');
    typeFullString(engine, 'nattou');
  });

  it('卓球(たっきゅう) → "takkyuu" で正解', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('卓球', 'たっきゅう');
    typeFullString(engine, 'takkyuu');
  });
});

describe('text_kana方式 表示テスト', () => {
  it('初期表示: typed="" remaining=全ローマ字', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('観光', 'かんこう');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, '');
    assert.equal(display.remaining, 'kankou');
  });

  it('途中表示が正しい', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('図書館', 'としょかん');
    engine.handleKeyPress('t');
    engine.handleKeyPress('o');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, 'to');
    assert.ok(display.remaining.length > 0);
  });

  it('完了後表示', () => {
    const engine = new TypingEngine();
    engine.loadQuestion('猫', 'ねこ');
    typeFullString(engine, 'neko');
    const display = engine.getCurrentDisplay();
    assert.equal(display.typed, 'neko');
    assert.equal(display.remaining, '');
  });
});
