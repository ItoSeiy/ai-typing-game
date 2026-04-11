/**
 * Matrix Rain — Canvas背景のMatrix風デジタルレイン演出
 */
export class MatrixRain {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.animationId = null;
    this.running = false;

    // Matrix文字セット: 半角カタカナ + 数字 + 英字
    this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    this.fontSize = 16;
    this.columns = [];
    this.lastTime = 0;

    this._initColumns();
  }

  _initColumns() {
    const colCount = Math.ceil(this.canvas.width / this.fontSize);
    this.columns = [];
    for (let i = 0; i < colCount; i++) {
      this.columns.push({
        y: Math.random() * this.canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        chars: this._generateTrail(),
      });
    }
  }

  _generateTrail() {
    const len = 5 + Math.floor(Math.random() * 20);
    const trail = [];
    for (let i = 0; i < len; i++) {
      trail.push(this.chars[Math.floor(Math.random() * this.chars.length)]);
    }
    return trail;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this._animate();
  }

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this._initColumns();
  }

  _animate() {
    if (!this.running) return;

    const now = performance.now();
    const delta = (now - this.lastTime) / 16.67; // normalize to ~60fps
    this.lastTime = now;

    // Semi-transparent black overlay for trail fade effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.font = `${this.fontSize}px monospace`;

    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];
      const x = i * this.fontSize;

      // Draw each character in the trail
      for (let j = 0; j < col.chars.length; j++) {
        const charY = col.y - j * this.fontSize;
        if (charY < -this.fontSize || charY > this.canvas.height + this.fontSize) continue;

        if (j === 0) {
          // Head character: bright white
          this.ctx.fillStyle = '#ffffff';
          this.ctx.shadowColor = '#00ff41';
          this.ctx.shadowBlur = 10;
        } else {
          // Trail characters: green gradient with fade
          const alpha = Math.max(0, 1 - j / col.chars.length);
          this.ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
          this.ctx.shadowBlur = 0;
        }

        this.ctx.fillText(col.chars[j], x, charY);
      }
      this.ctx.shadowBlur = 0;

      // Move column down
      col.y += col.speed * this.fontSize * delta * 0.3;

      // Randomly change a character in the trail
      if (Math.random() < 0.02) {
        const idx = Math.floor(Math.random() * col.chars.length);
        col.chars[idx] = this.chars[Math.floor(Math.random() * this.chars.length)];
      }

      // Reset column when it goes off screen
      if (col.y - col.chars.length * this.fontSize > this.canvas.height) {
        col.y = -Math.random() * this.canvas.height * 0.5;
        col.speed = 0.5 + Math.random() * 1.5;
        col.chars = this._generateTrail();
      }
    }

    this.animationId = requestAnimationFrame(() => this._animate());
  }
}
