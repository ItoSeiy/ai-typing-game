import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { GameLoop } from '../src/core/game-loop.js';

describe('GameLoop', () => {
  it('constructor sets timeLimit and remaining', () => {
    const gl = new GameLoop(60);
    assert.equal(gl.timeLimit, 60);
    assert.equal(gl.remaining, 60);
    assert.equal(gl.running, false);
  });

  it('getRemainingTime returns remaining seconds', () => {
    const gl = new GameLoop(30);
    assert.equal(gl.getRemainingTime(), 30);
  });

  it('start calls onTick immediately with timeLimit', () => {
    const gl = new GameLoop(10);
    const ticks = [];
    gl.start((t) => ticks.push(t), () => {});
    assert.equal(ticks[0], 10);
    gl.stop();
  });

  it('start sets running to true', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    assert.equal(gl.running, true);
    gl.stop();
  });

  it('start does nothing if already running', () => {
    const gl = new GameLoop(10);
    let callCount = 0;
    gl.start(() => callCount++, () => {});
    gl.start(() => callCount++, () => {});
    // Only first start's immediate onTick should fire
    assert.equal(callCount, 1);
    gl.stop();
  });

  it('stop clears the timer and sets running to false', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    gl.stop();
    assert.equal(gl.running, false);
    assert.equal(gl.timerId, null);
  });

  it('stop is safe to call when not running', () => {
    const gl = new GameLoop(10);
    gl.stop();
    assert.equal(gl.running, false);
  });

  it('timer decrements remaining each second', async () => {
    const gl = new GameLoop(3);
    const ticks = [];
    await new Promise((resolve) => {
      gl.start(
        (t) => ticks.push(t),
        () => resolve()
      );
    });
    // Ticks: 3 (immediate), 2, 1, 0
    assert.deepEqual(ticks, [3, 2, 1, 0]);
    assert.equal(gl.running, false);
  });
});
