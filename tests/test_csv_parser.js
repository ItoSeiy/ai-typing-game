import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCSV } from '../src/loader/csv-parser.js';

describe('parseCSV（CSV解析）', () => {
  it('ヘッダ付きCSVを基本形式として解析する', () => {
    const csv = 'name,age\nAlice,30\nBob,25';
    const result = parseCSV(csv);
    assert.equal(result.length, 2);
    assert.equal(result[0].name, 'Alice');
    assert.equal(result[0].age, '30');
    assert.equal(result[1].name, 'Bob');
    assert.equal(result[1].age, '25');
  });

  it('二重引用符付きフィールドを扱える', () => {
    const csv = 'name,desc\nAlice,"hello, world"';
    const result = parseCSV(csv);
    assert.equal(result[0].desc, 'hello, world');
  });

  it('引用符内のエスケープ二重引用符を扱える', () => {
    const csv = 'name,desc\nAlice,"She said ""hi"""';
    const result = parseCSV(csv);
    assert.equal(result[0].desc, 'She said "hi"');
  });

  it('空行をスキップする', () => {
    const csv = 'name,age\n\nAlice,30\n\nBob,25\n';
    const result = parseCSV(csv);
    assert.equal(result.length, 2);
  });

  it('BOM付きCSVを扱える', () => {
    const csv = '\uFEFFname,age\nAlice,30';
    const result = parseCSV(csv);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Alice');
  });

  it('空文字列なら空配列を返す', () => {
    const result = parseCSV('');
    assert.deepEqual(result, []);
  });

  it('非文字列入力なら空配列を返す', () => {
    const result = parseCSV(null);
    assert.deepEqual(result, []);
  });

  it('ヘッダのみCSVなら空配列を返す', () => {
    const csv = 'name,age';
    const result = parseCSV(csv);
    assert.deepEqual(result, []);
  });

  it('CRLF改行を扱える', () => {
    const csv = 'name,age\r\nAlice,30\r\nBob,25';
    const result = parseCSV(csv);
    assert.equal(result.length, 2);
    assert.equal(result[0].name, 'Alice');
  });

  it('欠損フィールドを空文字で補完する', () => {
    const csv = 'a,b,c\n1';
    const result = parseCSV(csv);
    assert.equal(result[0].a, '1');
    assert.equal(result[0].b, '');
    assert.equal(result[0].c, '');
  });

  it('引用符内改行を扱える', () => {
    const csv = 'name,desc\nAlice,"line1\nline2"';
    const result = parseCSV(csv);
    assert.equal(result[0].desc, 'line1\nline2');
  });
});
