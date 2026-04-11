import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ROMAJI_TABLE } from '../src/core/romaji-table.js';

describe('ROMAJI_TABLE', () => {
  it('is a non-null object', () => {
    assert.equal(typeof ROMAJI_TABLE, 'object');
    assert.notEqual(ROMAJI_TABLE, null);
  });

  const seion = ['あ','い','う','え','お','か','き','く','け','こ',
    'さ','し','す','せ','そ','た','ち','つ','て','と',
    'な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ',
    'ま','み','む','め','も','や','ゆ','よ',
    'ら','り','る','れ','ろ','わ','を','ん'];

  it('contains all seion (清音) entries', () => {
    for (const kana of seion) {
      assert.ok(ROMAJI_TABLE[kana], `Missing entry for ${kana}`);
      assert.ok(Array.isArray(ROMAJI_TABLE[kana]), `Entry for ${kana} is not an array`);
      assert.ok(ROMAJI_TABLE[kana].length > 0, `Entry for ${kana} is empty`);
    }
  });

  it('し has multiple input methods (shi/si)', () => {
    const entries = ROMAJI_TABLE['し'];
    assert.ok(entries.includes('si'), 'Missing si');
    assert.ok(entries.includes('shi'), 'Missing shi');
  });

  it('ち has multiple input methods (chi/ti)', () => {
    const entries = ROMAJI_TABLE['ち'];
    assert.ok(entries.includes('ti'), 'Missing ti');
    assert.ok(entries.includes('chi'), 'Missing chi');
  });

  it('つ has multiple input methods (tsu/tu)', () => {
    const entries = ROMAJI_TABLE['つ'];
    assert.ok(entries.includes('tu'), 'Missing tu');
    assert.ok(entries.includes('tsu'), 'Missing tsu');
  });

  it('ふ has multiple input methods (fu/hu)', () => {
    const entries = ROMAJI_TABLE['ふ'];
    assert.ok(entries.includes('hu'), 'Missing hu');
    assert.ok(entries.includes('fu'), 'Missing fu');
  });

  const dakuon = ['が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ',
    'だ','ぢ','づ','で','ど','ば','び','ぶ','べ','ぼ'];

  it('contains all dakuon (濁音) entries', () => {
    for (const kana of dakuon) {
      assert.ok(ROMAJI_TABLE[kana], `Missing entry for ${kana}`);
    }
  });

  const handakuon = ['ぱ','ぴ','ぷ','ぺ','ぽ'];

  it('contains all handakuon (半濁音) entries', () => {
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

  it('contains all youon (拗音) entries', () => {
    for (const kana of youon) {
      assert.ok(ROMAJI_TABLE[kana], `Missing entry for ${kana}`);
    }
  });

  it('contains sokuon (っ) entry', () => {
    assert.ok(ROMAJI_TABLE['っ']);
    assert.ok(ROMAJI_TABLE['っ'].includes('xtu'));
  });

  it('contains komoji (小文字) entries', () => {
    const komoji = ['ぁ','ぃ','ぅ','ぇ','ぉ','ゃ','ゅ','ょ'];
    for (const kana of komoji) {
      assert.ok(ROMAJI_TABLE[kana], `Missing entry for ${kana}`);
    }
  });

  it('contains chouon (ー) entry', () => {
    assert.ok(ROMAJI_TABLE['ー']);
    assert.ok(ROMAJI_TABLE['ー'].includes('-'));
  });

  it('all entries are arrays of non-empty strings', () => {
    for (const [kana, entries] of Object.entries(ROMAJI_TABLE)) {
      assert.ok(Array.isArray(entries), `${kana}: not an array`);
      for (const entry of entries) {
        assert.equal(typeof entry, 'string', `${kana}: contains non-string`);
        assert.ok(entry.length > 0, `${kana}: contains empty string`);
      }
    }
  });
});
