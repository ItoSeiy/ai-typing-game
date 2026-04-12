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

describe('LevelLoader', () => {
  it('loadLevel returns parsed questions with camelCase keys', async () => {
    const loader = new LevelLoader();
    const questions = await loader.loadLevel('assets/levels/test.csv');
    assert.equal(questions.length, 2);
    assert.equal(questions[0].id, 1);
    assert.equal(questions[0].textDisplay, 'さくら');
    assert.equal(questions[0].textKana, 'さくら');
    assert.equal(questions[0].imagePath, 'img/sakura.png');
    assert.deepEqual(Object.keys(questions[0]), ['id', 'textDisplay', 'textKana', 'imagePath']);
  });

  it('loadLevel converts numeric fields to numbers', async () => {
    const loader = new LevelLoader();
    const questions = await loader.loadLevel('assets/levels/test.csv');
    assert.equal(typeof questions[0].id, 'number');
  });

  it('loadLevel throws on HTTP error', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    const loader = new LevelLoader();
    await assert.rejects(
      () => loader.loadLevel('bad/path.csv'),
      (err) => err.message.includes('Failed to load level CSV')
    );
    globalThis.fetch = originalFetch;
  });

  it('loadLevel fills missing optional fields with empty string', async () => {
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

describe('shuffleQuestions', () => {
  it('returns an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleQuestions(input);
    assert.equal(result.length, input.length);
  });

  it('does not modify the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffleQuestions(input);
    assert.deepEqual(input, copy);
  });

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleQuestions(input);
    assert.deepEqual(result.sort(), [...input].sort());
  });

  it('instance method delegates to module function', () => {
    const loader = new LevelLoader();
    const input = [1, 2, 3];
    const result = loader.shuffleQuestions(input);
    assert.equal(result.length, input.length);
    assert.deepEqual(result.sort(), [...input].sort());
  });
});
