import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from '../assets/config.js';

describe('config.js integrity checks', () => {
  it('default CSV file exists', () => {
    const projectRoot = path.resolve('.');
    const csvPath = path.resolve(projectRoot, CONFIG.defaultCSVPath);
    assert.equal(fs.existsSync(csvPath), true, `missing csv at ${csvPath}`);
  });

  it('scoring.pointPerChar is a positive number', () => {
    assert.equal(typeof CONFIG.scoring.pointPerChar, 'number');
    assert.ok(CONFIG.scoring.pointPerChar > 0);
  });

  it('scoring.missPoint is a finite number', () => {
    assert.equal(typeof CONFIG.scoring.missPoint, 'number');
    assert.equal(Number.isFinite(CONFIG.scoring.missPoint), true);
  });
});
