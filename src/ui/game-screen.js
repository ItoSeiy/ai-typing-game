/**
 * GameScreen — ゲームプレイ画面
 */
export class GameScreen {
  constructor(containerEl) {
    this.container = containerEl;
    this.imagePreloader = null;
    this._build();
  }

  setImagePreloader(imagePreloader) {
    this.imagePreloader = imagePreloader;
  }

  _build() {
    this.container.innerHTML = '';
    this.container.className = 'screen game-screen';

    // Top bar: timer + score
    const topBar = document.createElement('div');
    topBar.className = 'game-screen__top';

    // Timer section
    const timerWrap = document.createElement('div');
    timerWrap.className = 'game-screen__timer-wrap';

    this.timerLabel = document.createElement('span');
    this.timerLabel.className = 'game-screen__timer-label matrix-text';
    this.timerLabel.textContent = 'TIME';
    timerWrap.appendChild(this.timerLabel);

    const barOuter = document.createElement('div');
    barOuter.className = 'game-screen__timer-bar-outer';

    this.timerBar = document.createElement('div');
    this.timerBar.className = 'game-screen__timer-bar';
    this.timerBar.style.width = '100%';
    barOuter.appendChild(this.timerBar);
    timerWrap.appendChild(barOuter);

    this.timerText = document.createElement('span');
    this.timerText.className = 'game-screen__timer-text matrix-text';
    this.timerText.textContent = '60';
    timerWrap.appendChild(this.timerText);

    topBar.appendChild(timerWrap);

    // Score
    this.scoreEl = document.createElement('div');
    this.scoreEl.className = 'game-screen__score matrix-glow';
    this.scoreEl.textContent = 'SCORE: 0';
    topBar.appendChild(this.scoreEl);

    this.container.appendChild(topBar);

    // Question area
    const questionArea = document.createElement('div');
    questionArea.className = 'game-screen__question';

    this.questionImage = document.createElement('img');
    this.questionImage.className = 'game-screen__question-image';
    this.questionImage.style.display = 'none';
    this.questionImage.addEventListener('error', () => {
      this.questionImage.style.display = 'none';
      this.questionImage.src = '';
    });
    questionArea.appendChild(this.questionImage);

    this.questionText = document.createElement('div');
    this.questionText.className = 'game-screen__question-text matrix-text';
    this.questionText.textContent = '';
    questionArea.appendChild(this.questionText);

    this.container.appendChild(questionArea);

    // Typing area
    const typingArea = document.createElement('div');
    typingArea.className = 'game-screen__typing';

    this.typedSpan = document.createElement('span');
    this.typedSpan.className = 'game-screen__typed';
    typingArea.appendChild(this.typedSpan);

    this.remainingSpan = document.createElement('span');
    this.remainingSpan.className = 'game-screen__remaining';
    typingArea.appendChild(this.remainingSpan);

    this.container.appendChild(typingArea);

    // Countdown overlay
    this.countdownEl = document.createElement('div');
    this.countdownEl.className = 'game-screen__countdown matrix-glow';
    this.countdownEl.style.display = 'none';
    this.container.appendChild(this.countdownEl);

    // Initial timer max (for bar calculation)
    this._maxTime = 60;
  }

  show() {
    this.container.style.display = 'flex';
    document.body.classList.add('game-active');
  }

  hide() {
    this.container.style.display = 'none';
    document.body.classList.remove('game-active');
  }

  updateQuestion(textDisplay, imagePath) {
    this.questionText.textContent = textDisplay || '';

    if (imagePath) {
      const preloadedImage = this.imagePreloader?.get(imagePath);
      this.questionImage.src = preloadedImage?.src || imagePath;
      this.questionImage.style.display = 'block';
    } else {
      this.questionImage.style.display = 'none';
      this.questionImage.src = '';
    }
  }

  updateTyping(typed, remaining) {
    this.typedSpan.textContent = typed || '';
    this.remainingSpan.textContent = remaining || '';
  }

  updateTimer(seconds) {
    // First call sets max time for bar width calculation
    if (this._firstTimerCall === undefined) {
      this._maxTime = seconds;
      this._firstTimerCall = true;
    }

    this.timerText.textContent = String(Math.ceil(seconds));
    const pct = Math.max(0, (seconds / this._maxTime) * 100);
    this.timerBar.style.width = `${pct}%`;

    // Color warning
    if (seconds <= 10) {
      this.timerBar.classList.add('game-screen__timer-bar--danger');
    } else {
      this.timerBar.classList.remove('game-screen__timer-bar--danger');
    }
  }

  updateScore(score) {
    this.scoreEl.textContent = `SCORE: ${score}`;
  }

  showCountdown(num) {
    this.countdownEl.textContent = num;
    this.countdownEl.style.display = 'flex';
  }

  hideCountdown() {
    this.countdownEl.style.display = 'none';
    this._firstTimerCall = undefined;
  }
}
