import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from '../assets/config.js';
import { parseCSV } from '../src/loader/csv-parser.js';
import { ROMAJI_TABLE } from '../src/core/romaji-table.js';

function canConvertKanaToRomaji(kana) {
  let i = 0;

  while (i < kana.length) {
    const current = kana[i];

    if (current === 'っ' && i + 1 < kana.length) {
      const candidateDigraph = kana.slice(i + 1, i + 3);
      if (candidateDigraph.length === 2 && ROMAJI_TABLE[candidateDigraph]) {
        if (!ROMAJI_TABLE['っ'] || ROMAJI_TABLE['っ'].length === 0) {
          return false;
        }
        if (!ROMAJI_TABLE[candidateDigraph] || ROMAJI_TABLE[candidateDigraph].length === 0) {
          return false;
        }
        i += 3;
        continue;
      }

      const nextSingle = kana[i + 1];
      if (ROMAJI_TABLE[nextSingle] && ROMAJI_TABLE['っ']) {
        if (!ROMAJI_TABLE[nextSingle].length || ROMAJI_TABLE['っ'].length === 0) {
          return false;
        }
        i += 2;
        continue;
      }
    }

    const digraph = kana.slice(i, i + 2);
    if (ROMAJI_TABLE[digraph]) {
      i += 2;
      continue;
    }

    if (ROMAJI_TABLE[current]) {
      i += 1;
      continue;
    }

    return false;
  }

  return true;
}

describe('CSV integrity checks', () => {
  const projectRoot = path.resolve('.');
  const csvPath = path.resolve(projectRoot, CONFIG.defaultCSVPath);
  const csvRows = parseCSV(fs.readFileSync(csvPath, 'utf8'));

  it('image files referenced by rows exist when provided', () => {
    for (const [index, row] of csvRows.entries()) {
      const imagePath = (row.image_path ?? '').trim();

      if (imagePath === '') {
        continue;
      }

      const resolved = path.resolve(projectRoot, imagePath);
      assert.equal(
        fs.existsSync(resolved),
        true,
        `missing image at ${resolved} (row=${index + 1})`
      );
    }
  });

  it('all kana text fields are convertible via ROMAJI_TABLE', () => {
    for (const row of csvRows) {
      assert.equal(typeof row.text_kana, 'string');
      assert.equal(canConvertKanaToRomaji(row.text_kana), true, `not convertible: ${row.text_kana}`);
    }
  });

  it('required fields are present and non-empty where required', () => {
    for (const row of csvRows) {
      assert.equal(typeof row.id, 'string');
      assert.equal(typeof row.text_display, 'string');
      assert.equal(typeof row.text_kana, 'string');
      assert.equal(row.id.length > 0, true);
      assert.equal(row.text_display.length > 0, true);
      assert.equal(row.text_kana.length > 0, true);
    }
  });

  it('IDs are unique within CSV', () => {
    const ids = csvRows.map((row) => row.id);
    const uniq = new Set(ids);
    assert.equal(uniq.size, ids.length);
  });
});
