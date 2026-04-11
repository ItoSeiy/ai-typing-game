export class GameLoop {
  constructor(timeLimit) {
    this.timeLimit = timeLimit;
    this.remaining = timeLimit;
    this.timerId = null;
    this.running = false;
  }

  start(onTick, onEnd) {
    if (this.running) return;
    this.running = true;
    this.remaining = this.timeLimit;

    onTick(this.remaining);

    this.timerId = setInterval(() => {
      this.remaining--;
      onTick(this.remaining);

      if (this.remaining <= 0) {
        this.stop();
        onEnd();
      }
    }, 1000);
  }

  stop() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.running = false;
  }

  getRemainingTime() {
    return this.remaining;
  }
}
