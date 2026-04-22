import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ROMAJI_TABLE } from '../src/core/romaji-table.js';

describe('ROMAJI_TABLE（ローマ字変換表）', () => {
  it('非nullのオブジェクトである', () => {
    assert.equal(typeof ROMAJI_TABLE, 'object');
    assert.notEqual(ROMAJI_TABLE, null);
  });

  const seion = ['あ','い','う','え','お','か','き','く','け','こ',
    'さ','し','す','せ','そ','た','ち','つ','て','と',
    'な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ',
    'ま','み','む','め','も','や','ゆ','よ',
    'ら','り','る','れ','ろ','わ','を','ん'];

  it('清音の全項目が含まれる', () => {
    for (const kana of seion) {
      assert.ok(ROMAJI_TABLE[kana], `Missing entry for ${kana}`);
      assert.ok(Array.isArray(ROMAJI_TABLE[kana]), `Entry for ${kana} is not an array`);
      assert.ok(ROMAJI_TABLE[kana].length > 0, `Entry for ${kana} is empty`);
    }
  });

  it('「し」に対して複数入力方式（shi/si）がある', () => {
    const entries = ROMAJI_TABLE['し'];
    assert.ok(entries.includes('si'), 'Missing si');
    assert.ok(entries.includes('shi'), 'Missing shi');
  });

  it('「ち」に対して複数入力方式（chi/ti）がある', () => {
    const entries = ROMAJI_TABLE['ち'];
    assert.ok(entries.includes('ti'), 'Missing ti');
    assert.ok(entries.includes('chi'), 'Missing chi');
  });

  it('「つ」に対して複数入力方式（tsu/tu）がある', () => {
    const entries = ROMAJI_TABLE['つ'];
    assert.ok(entries.includes('tu'), 'Missing tu');
    assert.ok(entries.includes('tsu'), 'Missing tsu');
  });

  it('「ふ」に対して複数入力方式（fu/hu）がある', () => {
    const entries = ROMAJI_TABLE['ふ'];
    assert.ok(entries.includes('hu'), 'Missing hu');
    assert.ok(entries.includes('fu'), 'Missing fu');
  });

  it('「ふぁ・ふぃ・ふぇ・ふぉ」に対して受理エントリがある', () => {
    assert.ok(ROMAJI_TABLE['ふぁ'].includes('fa'), 'Missing fa');
    assert.ok(ROMAJI_TABLE['ふぃ'].includes('fi'), 'Missing fi');
    assert.ok(ROMAJI_TABLE['ふぇ'].includes('fe'), 'Missing fe');
    assert.ok(ROMAJI_TABLE['ふぉ'].includes('fo'), 'Missing fo');
  });

  const dakuon = ['が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ',
    'だ','ぢ','づ','で','ど','ば','び','ぶ','べ','ぼ'];

  it('濁音の全項目が含まれる', () => {
    for (const kana of dakuon) {
      assert.ok(ROMAJI_TABLE[kana], `Missing entry for ${kana}`);
    }
  });

  const handakuon = ['ぱ','ぴ','ぷ','ぺ','ぽ'];

  it('半濁音の全項目が含まれる', () => {
    for (const kana of handakuon) {
      assert.ok(ROMAJI_TABLE[kana], `Missing entry for ${kana}`);
    }
  });

  const youon = ['きゃ','きゅ','きょ','しゃ','しゅ','しょ',
    'ちゃ','ちゅ','ちょ','にゃ','にゅ','にょ',
    'ひゃ','ひゅ','ひょ','みゃ','みゅ','みょ',
    'りゃ','りゅ','りょ','ぎゃ','ぎゅ','ぎょ',
    'じゃ','じゅ','じょ','びゃ','びゅ','びょ',
    'ぴゃ','ぴゅ','ぴょ'];

  it('拗音の全項目が含まれる', () => {
    for (const kana of youon) {
      assert.ok(ROMAJI_TABLE[kana], `Missing entry for ${kana}`);
    }
  });

  it('促音（っ）の定義が存在する', () => {
    assert.ok(ROMAJI_TABLE['っ']);
    assert.ok(ROMAJI_TABLE['っ'].includes('xtu'));
  });

  it('小文字かな（ぁ・ぃ等）の項目が含まれる', () => {
    const komoji = ['ぁ','ぃ','ぅ','ぇ','ぉ','ゃ','ゅ','ょ'];
    for (const kana of komoji) {
      assert.ok(ROMAJI_TABLE[kana], `Missing entry for ${kana}`);
    }
  });

  it('長音符（ー）の項目が含まれる', () => {
    assert.ok(ROMAJI_TABLE['ー']);
    assert.ok(ROMAJI_TABLE['ー'].includes('-'));
  });

  it('記号・空白・数字の項目が含まれる', () => {
    const cases = {
      '！': '!',
      '＋': '+',
      '？': '?',
      '+': '+',
      '、': ',',
      '。': '.',
      '・': '/',
      '　': ' ',
      ' ': ' ',
      '０': '0',
      '１': '1',
      '２': '2',
      '３': '3',
      '４': '4',
      '５': '5',
      '６': '6',
      '７': '7',
      '８': '8',
      '９': '9'
    };

    for (const [kana, romaji] of Object.entries(cases)) {
      assert.ok(ROMAJI_TABLE[kana], `Missing entry for ${kana}`);
      assert.ok(ROMAJI_TABLE[kana].includes(romaji), `Missing ${romaji} for ${kana}`);
    }
  });

  it('ASCII英字の項目が含まれる', () => {
    assert.deepStrictEqual(ROMAJI_TABLE['a'], ['a']);
    assert.deepStrictEqual(ROMAJI_TABLE['Z'], ['Z']);
  });

  it('カタカナはProxy経由で受理される', () => {
    assert.deepStrictEqual(ROMAJI_TABLE['カ'], ['kana']);
    assert.deepStrictEqual(ROMAJI_TABLE['モンスター'], ['kana']);
    assert.equal(ROMAJI_TABLE['zzznonexistent'], undefined);
  });

  it('全エントリが空でない文字列配列である', () => {
    for (const [kana, entries] of Object.entries(ROMAJI_TABLE)) {
      assert.ok(Array.isArray(entries), `${kana}: not an array`);
      for (const entry of entries) {
        assert.equal(typeof entry, 'string', `${kana}: contains non-string`);
        assert.ok(entry.length > 0, `${kana}: contains empty string`);
      }
    }
  });
});
