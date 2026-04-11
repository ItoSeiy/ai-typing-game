/**
 * ResultScreen — リザルト画面（スコア表示・統計）
 */
export class ResultScreen {
  constructor(containerEl) {
    this.container = containerEl;
    this._restartCallback = null;
    this._titleCallback = null;
    this._build();
  }

  _build() {
    this.container.innerHTML = '';
    this.container.className = 'screen result-screen';

    // Result title
    const heading = document.createElement('h2');
    heading.className = 'screen__title matrix-glow';
    heading.textContent = 'RESULT';
    this.container.appendChild(heading);

    // Score (animated count-up)
    this.scoreEl = document.createElement('div');
    this.scoreEl.className = 'result-screen__score matrix-glow';
    this.scoreEl.textContent = '0';
    this.container.appendChild(this.scoreEl);

    // Stats grid
    const statsGrid = document.createElement('div');
    statsGrid.className = 'result-screen__stats';

    this.statEls = {};
    const statNames = [
      { key: 'accuracy', label: 'ACCURACY' },
      { key: 'correctCount', label: 'CORRECT' },
      { key: 'missCount', label: 'MISS' },
      { key: 'totalKeystrokes', label: 'TOTAL KEYS' },
    ];

    for (const { key, label } of statNames) {
      const item = document.createElement('div');
      item.className = 'result-screen__stat';

      const lbl = document.createElement('span');
      lbl.className = 'result-screen__stat-label matrix-text';
      lbl.textContent = label;
      item.appendChild(lbl);

      const val = document.createElement('span');
      val.className = 'result-screen__stat-value matrix-glow';
      val.textContent = '-';
      item.appendChild(val);

      this.statEls[key] = val;
      statsGrid.appendChild(item);
    }

    this.container.appendChild(statsGrid);

    // Buttons
    const btnWrap = document.createElement('div');
    btnWrap.className = 'screen__buttons';

    this.retryBtn = document.createElement('button');
    this.retryBtn.className = 'screen__button matrix-btn';
    this.retryBtn.textContent = 'RETRY';
    btnWrap.appendChild(this.retryBtn);

    this.titleBtn = document.createElement('button');
    this.titleBtn.className = 'screen__button matrix-btn';
    this.titleBtn.textContent = 'TITLE';
    btnWrap.appendChild(this.titleBtn);

    this.container.appendChild(btnWrap);
  }

  show(stats) {
    this.container.style.display = 'flex';

    // Display stats
    if (stats.accuracy !== undefined) {
      this.statEls.accuracy.textContent = `${stats.accuracy}%`;
    }
    this.statEls.correctCount.textContent = stats.correctCount ?? '-';
    this.statEls.missCount.textContent = stats.missCount ?? '-';
    this.statEls.totalKeystrokes.textContent = stats.totalKeystrokes ?? '-';

    // Animated score count-up
    this._animateScore(stats.score || 0);

    // Re-bind buttons
    const newRetry = this.retryBtn.cloneNode(true);
    this.retryBtn.parentNode.replaceChild(newRetry, this.retryBtn);
    this.retryBtn = newRetry;

    const newTitle = this.titleBtn.cloneNode(true);
    this.titleBtn.parentNode.replaceChild(newTitle, this.titleBtn);
    this.titleBtn = newTitle;

    this.retryBtn.addEventListener('click', () => {
      if (this._restartCallback) this._restartCallback();
    });

    this.titleBtn.addEventListener('click', () => {
      if (this._titleCallback) this._titleCallback();
    });
  }

  hide() {
    this.container.style.display = 'none';
  }

  onRestart(callback) {
    this._restartCallback = callback;
  }

  onTitle(callback) {
    this._titleCallback = callback;
  }

  _animateScore(target) {
    const duration = 1000;
    const start = performance.now();
    const el = this.scoreEl;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(tick);
  }
}
