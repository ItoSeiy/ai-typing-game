import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

// Mock fetch before importing LevelLoader
const csvContent = 'id,text_display,text_kana,image_path\n1,さくら,さくら,img/sakura.png\n2,やま,やま,img/yama.png';

globalThis.fetch = async (url) => ({
  ok: true,
  status: 200,
  text: async () => csvContent
});

const { LevelLoader, shuffleQuestions } = await import('../src/loader/level-loader.js');

describe('LevelLoader（レベル読込）', () => {
  it('loadLevelがcamelCaseキー付き質問配列を返す', async () => {
    const loader = new LevelLoader();
    const questions = await loader.loadLevel('assets/levels/test.csv');
    assert.equal(questions.length, 2);
    assert.equal(questions[0].id, 1);
    assert.equal(questions[0].textDisplay, 'さくら');
    assert.equal(questions[0].textKana, 'さくら');
    assert.equal(questions[0].imagePath, 'img/sakura.png');
    assert.deepEqual(Object.keys(questions[0]), ['id', 'textDisplay', 'textKana', 'imagePath']);
  });

  it('loadLevelが数値項目を数値型へ変換する', async () => {
    const loader = new LevelLoader();
    const questions = await loader.loadLevel('assets/levels/test.csv');
    assert.equal(typeof questions[0].id, 'number');
  });

  it('HTTPエラー時にloadLevelが例外を投げる', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    const loader = new LevelLoader();
    await assert.rejects(
      () => loader.loadLevel('bad/path.csv'),
      (err) => err.message.includes('Failed to load level CSV')
    );
    globalThis.fetch = originalFetch;
  });

  it('任意項目の欠損を空文字で補完する', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      ok: true,
      text: async () => 'id,text_display,text_kana,image_path\n1,あ,あ,'
    });
    const loader = new LevelLoader();
    const q = await loader.loadLevel('test.csv');
    assert.equal(q[0].imagePath, '');
    globalThis.fetch = originalFetch;
  });
});

describe('shuffleQuestions（シャッフル）', () => {
  it('同じ長さの配列を返す', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleQuestions(input);
    assert.equal(result.length, input.length);
  });

  it('元配列を破壊しない', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffleQuestions(input);
    assert.deepEqual(input, copy);
  });

  it('元要素をすべて含む', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleQuestions(input);
    assert.deepEqual(result.sort(), [...input].sort());
  });

  it('インスタンスメソッドがモジュール関数を委譲実行する', () => {
    const loader = new LevelLoader();
    const input = [1, 2, 3];
    const result = loader.shuffleQuestions(input);
    assert.equal(result.length, input.length);
    assert.deepEqual(result.sort(), [...input].sort());
  });
});
