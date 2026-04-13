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

  it('game progression values are finite positive integers and scoring exists', () => {
    assert.equal(Number.isInteger(CONFIG.timeLimit), true, 'CONFIG.timeLimit must be an integer');
    assert.equal(CONFIG.timeLimit > 0, true, 'CONFIG.timeLimit must be positive');
    assert.equal(Number.isInteger(CONFIG.countdownDuration), true, 'CONFIG.countdownDuration must be an integer');
    assert.equal(CONFIG.countdownDuration > 0, true, 'CONFIG.countdownDuration must be positive');
    assert.equal(typeof CONFIG.scoring, 'object');
    assert.equal(CONFIG.scoring !== null, true, 'CONFIG.scoring must exist');
    assert.equal(Number.isFinite(CONFIG.scoring.pointPerChar), true, 'CONFIG.scoring.pointPerChar must be finite');
    assert.equal(Number.isFinite(CONFIG.scoring.missPoint), true, 'CONFIG.scoring.missPoint must be finite');
  });
});
