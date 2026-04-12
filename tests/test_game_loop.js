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

  it('pause stops the timer interval', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    assert.equal(gl.running, true);
    assert.equal(gl.paused, false);

    gl.pause();
    assert.equal(gl.running, true);
    assert.equal(gl.paused, true);
    assert.equal(gl.timerId, null);
    gl.stop();
  });

  it('resume restarts the timer interval after pause', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    gl.pause();
    assert.equal(gl.paused, true);

    gl.resume();
    assert.equal(gl.paused, false);
    assert.notEqual(gl.timerId, null);
    gl.stop();
  });

  it('pause does nothing if not running', () => {
    const gl = new GameLoop(10);
    gl.pause();
    assert.equal(gl.paused, false);
    assert.equal(gl.running, false);
  });

  it('pause does nothing if already paused', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    gl.pause();
    gl.pause(); // second call should be no-op
    assert.equal(gl.paused, true);
    gl.stop();
  });

  it('resume does nothing if not paused', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    gl.resume(); // not paused, should be no-op
    assert.equal(gl.paused, false);
    gl.stop();
  });

  it('stop resets paused state', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    gl.pause();
    gl.stop();
    assert.equal(gl.paused, false);
    assert.equal(gl.running, false);
  });

  it('pause preserves remaining time during pause', async () => {
    const gl = new GameLoop(5);
    const ticks = [];

    await new Promise((resolve) => {
      gl.start(
        (t) => {
          ticks.push(t);
          // Pause after remaining = 3
          if (t === 3) {
            gl.pause();
            // Wait 2 seconds while paused, then resume
            setTimeout(() => {
              assert.equal(gl.getRemainingTime(), 3);
              gl.resume();
            }, 2000);
          }
        },
        () => resolve()
      );
    });

    // Should have: 5, 4, 3 (pause), then resume from 3: 2, 1, 0
    assert.deepEqual(ticks, [5, 4, 3, 2, 1, 0]);
  });
});
