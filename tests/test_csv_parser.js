import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCSV } from '../src/data/csv-parser.js';

describe('parseCSV', () => {
  it('parses basic CSV with header and rows', () => {
    const csv = 'name,age\nAlice,30\nBob,25';
    const result = parseCSV(csv);
    assert.equal(result.length, 2);
    assert.equal(result[0].name, 'Alice');
    assert.equal(result[0].age, '30');
    assert.equal(result[1].name, 'Bob');
    assert.equal(result[1].age, '25');
  });

  it('handles double-quoted fields', () => {
    const csv = 'name,desc\nAlice,"hello, world"';
    const result = parseCSV(csv);
    assert.equal(result[0].desc, 'hello, world');
  });

  it('handles escaped double quotes inside quoted fields', () => {
    const csv = 'name,desc\nAlice,"She said ""hi"""';
    const result = parseCSV(csv);
    assert.equal(result[0].desc, 'She said "hi"');
  });

  it('skips empty rows', () => {
    const csv = 'name,age\n\nAlice,30\n\nBob,25\n';
    const result = parseCSV(csv);
    assert.equal(result.length, 2);
  });

  it('handles BOM-prefixed CSV', () => {
    const csv = '\uFEFFname,age\nAlice,30';
    const result = parseCSV(csv);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Alice');
  });

  it('returns empty array for empty string', () => {
    const result = parseCSV('');
    assert.deepEqual(result, []);
  });

  it('returns empty array for non-string input', () => {
    const result = parseCSV(null);
    assert.deepEqual(result, []);
  });

  it('returns empty array for header-only CSV', () => {
    const csv = 'name,age';
    const result = parseCSV(csv);
    assert.deepEqual(result, []);
  });

  it('handles CRLF line endings', () => {
    const csv = 'name,age\r\nAlice,30\r\nBob,25';
    const result = parseCSV(csv);
    assert.equal(result.length, 2);
    assert.equal(result[0].name, 'Alice');
  });

  it('fills missing fields with empty string', () => {
    const csv = 'a,b,c\n1';
    const result = parseCSV(csv);
    assert.equal(result[0].a, '1');
    assert.equal(result[0].b, '');
    assert.equal(result[0].c, '');
  });

  it('handles newlines inside quoted fields', () => {
    const csv = 'name,desc\nAlice,"line1\nline2"';
    const result = parseCSV(csv);
    assert.equal(result[0].desc, 'line1\nline2');
  });
});
