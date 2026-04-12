export class GameLoop {
  constructor(timeLimit) {
    this.timeLimit = timeLimit;
    this.remaining = timeLimit;
    this.timerId = null;
    this.running = false;
    this.paused = false;
    this._onTick = null;
    this._onEnd = null;
  }

  start(onTick, onEnd) {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.remaining = this.timeLimit;
    this._onTick = onTick;
    this._onEnd = onEnd;

    onTick(this.remaining);

    this._startInterval();
  }

  _startInterval() {
    this.timerId = setInterval(() => {
      this.remaining--;
      this._onTick(this.remaining);

      if (this.remaining <= 0) {
        this.stop();
        this._onEnd();
      }
    }, 1000);
  }

  pause() {
    if (!this.running || this.paused) return;
    this.paused = true;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this._startInterval();
  }

  stop() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.running = false;
    this.paused = false;
  }

  getRemainingTime() {
    return this.remaining;
  }
}
