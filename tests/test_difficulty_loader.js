import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const { DifficultyLoader } = await import('../src/loader/difficulty-loader.js');

describe('DifficultyLoader（難易度レジストリ読込）', () => {
  it('levels.json を正しく配列として読み込む', async () => {
    const payload = JSON.stringify([
      {
        id: 'normal',
        label: 'ふつう',
        description: '標準難易度',
        csv: 'assets/levels/normal.csv'
      },
      {
        id: 'hard',
        label: 'むずかしい',
        description: '上級者向け',
        csv: 'assets/levels/hard.csv'
      },
      {
        id: 'very_hard',
        label: 'ベリーハード',
        description: '超難関',
        csv: 'assets/levels/very_hard.csv'
      }
    ]);

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      text: async () => payload
    });

    const loader = new DifficultyLoader();
    const difficulties = await loader.loadDifficulties();

    assert.equal(difficulties.length, 3);
    assert.deepEqual(difficulties[0], {
      id: 'normal',
      label: 'ふつう',
      description: '標準難易度',
      csv: 'assets/levels/normal.csv'
    });
  });

  it('HTTP エラー時は normal 単一エントリへフォールバックする', async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 404,
      text: async () => ''
    });

    const loader = new DifficultyLoader();
    const difficulties = await loader.loadDifficulties();

    assert.equal(difficulties.length, 1);
    assert.equal(difficulties[0].id, 'normal');
    assert.equal(difficulties[0].csv, 'assets/levels/normal.csv');
  });

  it('空配列でも normal 単一エントリへフォールバックする', async () => {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      text: async () => '[]'
    });

    const loader = new DifficultyLoader();
    const difficulties = await loader.loadDifficulties();

    assert.equal(difficulties.length, 1);
    assert.equal(difficulties[0].label, 'ふつう');
  });
});
