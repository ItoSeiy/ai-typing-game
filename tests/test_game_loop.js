import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { GameLoop } from '../src/core/game-loop.js';

describe('GameLoop（ゲームループ）', () => {
  it('コンストラクタでtimeLimitとremainingを設定する', () => {
    const gl = new GameLoop(60);
    assert.equal(gl.timeLimit, 60);
    assert.equal(gl.remaining, 60);
    assert.equal(gl.running, false);
  });

  it('getRemainingTimeが残り秒数を返す', () => {
    const gl = new GameLoop(30);
    assert.equal(gl.getRemainingTime(), 30);
  });

  it('start時にonTickをtimeLimitで即時実行する', () => {
    const gl = new GameLoop(10);
    const ticks = [];
    gl.start((t) => ticks.push(t), () => {});
    assert.equal(ticks[0], 10);
    gl.stop();
  });

  it('startでrunningがtrueになる', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    assert.equal(gl.running, true);
    gl.stop();
  });

  it('startは既に実行中なら何もしない', () => {
    const gl = new GameLoop(10);
    let callCount = 0;
    gl.start(() => callCount++, () => {});
    gl.start(() => callCount++, () => {});
    // Only first start's immediate onTick should fire
    assert.equal(callCount, 1);
    gl.stop();
  });

  it('stopでタイマーを停止しrunningをfalseにする', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    gl.stop();
    assert.equal(gl.running, false);
    assert.equal(gl.timerId, null);
  });

  it('未実行時でもstopが安全に呼べる', () => {
    const gl = new GameLoop(10);
    gl.stop();
    assert.equal(gl.running, false);
  });

  it('タイマーが1秒ごとに残り秒数を減らす', async () => {
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

  it('pauseでタイマーの進行を停止する', () => {
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

  it('pause後にresumeでタイマーが再開する', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    gl.pause();
    assert.equal(gl.paused, true);

    gl.resume();
    assert.equal(gl.paused, false);
    assert.notEqual(gl.timerId, null);
    gl.stop();
  });

  it('未実行時はpauseが無視される', () => {
    const gl = new GameLoop(10);
    gl.pause();
    assert.equal(gl.paused, false);
    assert.equal(gl.running, false);
  });

  it('pause中は再度pauseしても変化しない', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    gl.pause();
    gl.pause(); // second call should be no-op
    assert.equal(gl.paused, true);
    gl.stop();
  });

  it('未pause状態でresumeしても変化しない', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    gl.resume(); // not paused, should be no-op
    assert.equal(gl.paused, false);
    gl.stop();
  });

  it('stopでpause状態が解除される', () => {
    const gl = new GameLoop(10);
    gl.start(() => {}, () => {});
    gl.pause();
    gl.stop();
    assert.equal(gl.paused, false);
    assert.equal(gl.running, false);
  });

  it('pause中も残り時間が維持される', async () => {
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
