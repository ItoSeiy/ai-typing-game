import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from '../assets/config.js';
import { parseCSV } from '../src/loader/csv-parser.js';
import { LevelLoader } from '../src/loader/level-loader.js';
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
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const csvRows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
  const headerLine = csvText.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0];
  const headers = headerLine.split(',');

  it('default CSV parses to at least one question and LevelLoader returns questions', async () => {
    assert.equal(csvRows.length > 0, true, 'parseCSV(default CSV) returned no rows');

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      const resolved = path.resolve(projectRoot, url);
      return {
        ok: true,
        status: 200,
        text: async () => fs.readFileSync(resolved, 'utf8')
      };
    };

    try {
      const loader = new LevelLoader();
      const questions = await loader.loadLevel(CONFIG.defaultCSVPath);
      assert.equal(questions.length > 0, true, 'LevelLoader.loadLevel(default CSV) returned no questions');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('CSV header is exact, unique, and whitespace-free', () => {
    assert.deepEqual(headers, ['id', 'text_display', 'text_kana', 'image_path']);
    assert.equal(new Set(headers).size, headers.length, 'duplicate CSV headers detected');
    for (const [index, header] of headers.entries()) {
      assert.equal(header, header.trim(), `header has surrounding whitespace at column ${index + 1}: ${header}`);
    }
  });

  it('row ids are finite positive integers', () => {
    for (const [index, row] of csvRows.entries()) {
      assert.equal(
        Number.isInteger(Number(row.id)) && Number(row.id) > 0,
        true,
        `row=${index + 1}, id=${row.id} is not a finite positive integer`
      );
    }
  });

  it('image files referenced by rows exist when provided', () => {
    for (const [index, row] of csvRows.entries()) {
      const imagePath = (row.image_path ?? '').trim();

      if (imagePath === '') {
        continue;
      }

      assert.equal(
        imagePath,
        row.image_path,
        `row=${index + 1}, id=${row.id} has surrounding whitespace in image_path: ${row.image_path}`
      );
      assert.equal(
        imagePath.startsWith('assets/images/'),
        true,
        `row=${index + 1}, id=${row.id} has image_path outside assets/images: ${imagePath}`
      );
      assert.equal(
        imagePath.endsWith('.png'),
        true,
        `row=${index + 1}, id=${row.id} has non-png image_path: ${imagePath}`
      );

      const resolved = path.resolve(projectRoot, imagePath);
      assert.equal(
        fs.existsSync(resolved),
        true,
        `missing image at ${resolved} (row=${index + 1}, id=${row.id})`
      );
    }
  });

  it('all kana text fields are convertible via ROMAJI_TABLE', () => {
    for (const [index, row] of csvRows.entries()) {
      assert.equal(typeof row.text_kana, 'string');
      assert.equal(
        canConvertKanaToRomaji(row.text_kana),
        true,
        `row=${index + 1}, id=${row.id} is not convertible: ${row.text_kana}`
      );
    }
  });

  it('required fields are present and non-empty where required', () => {
    for (const [index, row] of csvRows.entries()) {
      assert.equal(Object.hasOwn(row, 'id'), true, `row=${index + 1} is missing id`);
      assert.equal(Object.hasOwn(row, 'text_display'), true, `row=${index + 1}, id=${row.id} is missing text_display`);
      assert.equal(Object.hasOwn(row, 'text_kana'), true, `row=${index + 1}, id=${row.id} is missing text_kana`);
      assert.equal(Object.hasOwn(row, 'image_path'), true, `row=${index + 1}, id=${row.id} is missing image_path`);
      assert.equal(typeof row.id, 'string');
      assert.equal(typeof row.text_display, 'string');
      assert.equal(typeof row.text_kana, 'string');
      assert.equal(typeof row.image_path, 'string');
      assert.equal(row.id.length > 0, true, `row=${index + 1}, id=${row.id} has empty id`);
      assert.equal(row.text_display.length > 0, true, `row=${index + 1}, id=${row.id} has empty text_display`);
      assert.equal(row.text_kana.length > 0, true, `row=${index + 1}, id=${row.id} has empty text_kana`);
      assert.equal(row.text_display, row.text_display.trim(), `row=${index + 1}, id=${row.id} has surrounding whitespace in text_display: ${row.text_display}`);
      assert.equal(row.text_kana, row.text_kana.trim(), `row=${index + 1}, id=${row.id} has surrounding whitespace in text_kana: ${row.text_kana}`);
      assert.equal(row.image_path, row.image_path.trim(), `row=${index + 1}, id=${row.id} has surrounding whitespace in image_path: ${row.image_path}`);
    }
  });

  it('IDs are unique within CSV', () => {
    const ids = csvRows.map((row) => row.id);
    const uniq = new Set(ids);
    assert.equal(uniq.size, ids.length);
  });
});
