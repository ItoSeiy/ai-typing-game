import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../assets/config.js';

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
        csv: 'assets/levels/normal.csv',
        scoring: { pointPerChar: 20, missPoint: 0 }
      },
      {
        id: 'hard',
        label: 'むずかしい',
        description: '上級者向け',
        csv: 'assets/levels/hard.csv',
        scoring: { pointPerChar: 21, missPoint: 0 }
      },
      {
        id: 'very_hard',
        label: 'ベリーハード',
        description: '超難関',
        csv: 'assets/levels/very_hard.csv',
        scoring: { pointPerChar: 22, missPoint: 0 }
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
      csv: 'assets/levels/normal.csv',
      scoring: { pointPerChar: 20, missPoint: 0 }
    });
    assert.deepEqual(difficulties[1].scoring, { pointPerChar: 21, missPoint: 0 });
    assert.deepEqual(difficulties[2].scoring, { pointPerChar: 22, missPoint: 0 });
  });

  it('HTTP エラー時は normal 単一エントリへフォールバックする（CONFIG.scoring で scoring を補填）', async () => {
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
    assert.deepEqual(difficulties[0].scoring, {
      pointPerChar: CONFIG.scoring.pointPerChar,
      missPoint: CONFIG.scoring.missPoint
    });
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
    assert.deepEqual(difficulties[0].scoring, {
      pointPerChar: CONFIG.scoring.pointPerChar,
      missPoint: CONFIG.scoring.missPoint
    });
  });

  it('scoring 未設定のエントリは CONFIG.scoring を default として採用する', async () => {
    const payload = JSON.stringify([
      {
        id: 'nodata',
        label: 'なし',
        description: '',
        csv: 'assets/levels/normal.csv'
      }
    ]);

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      text: async () => payload
    });

    const loader = new DifficultyLoader();
    const difficulties = await loader.loadDifficulties();

    assert.equal(difficulties.length, 1);
    assert.deepEqual(difficulties[0].scoring, {
      pointPerChar: CONFIG.scoring.pointPerChar,
      missPoint: CONFIG.scoring.missPoint
    });
  });

  it('scoring 不正値（文字列）は CONFIG.scoring へフォールバックする', async () => {
    const payload = JSON.stringify([
      {
        id: 'bad',
        label: 'bad',
        description: '',
        csv: 'assets/levels/normal.csv',
        scoring: { pointPerChar: 'xxx', missPoint: 'yyy' }
      }
    ]);

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      text: async () => payload
    });

    const loader = new DifficultyLoader();
    const difficulties = await loader.loadDifficulties();

    assert.equal(difficulties.length, 1);
    assert.deepEqual(difficulties[0].scoring, {
      pointPerChar: CONFIG.scoring.pointPerChar,
      missPoint: CONFIG.scoring.missPoint
    });
  });

  it('scoring 部分欠損（pointPerChar のみ）は欠けている項目だけ fallback する', async () => {
    const payload = JSON.stringify([
      {
        id: 'partial',
        label: 'partial',
        description: '',
        csv: 'assets/levels/normal.csv',
        scoring: { pointPerChar: 25 }
      }
    ]);

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      text: async () => payload
    });

    const loader = new DifficultyLoader();
    const difficulties = await loader.loadDifficulties();

    assert.equal(difficulties[0].scoring.pointPerChar, 25);
    assert.equal(difficulties[0].scoring.missPoint, CONFIG.scoring.missPoint);
  });
});
