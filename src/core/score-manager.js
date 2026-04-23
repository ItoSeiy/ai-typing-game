import { CONFIG } from '../../assets/config.js';

function resolveScoring(scoring) {
  if (
    scoring &&
    typeof scoring === 'object' &&
    Number.isFinite(scoring.pointPerChar) &&
    Number.isFinite(scoring.missPoint)
  ) {
    return { pointPerChar: scoring.pointPerChar, missPoint: scoring.missPoint };
  }
  return { pointPerChar: CONFIG.scoring.pointPerChar, missPoint: CONFIG.scoring.missPoint };
}

export class ScoreManager {
  constructor(scoring = null) {
    this.correctCount = 0;
    this.missCount = 0;
    this.score = 0;
    this._scoring = resolveScoring(scoring);
  }

  setScoring(scoring) {
    this._scoring = resolveScoring(scoring);
  }

  getScoring() {
    return { ...this._scoring };
  }

  addQuestionComplete(kanaLength = 0) {
    this.score += kanaLength * this._scoring.pointPerChar;
  }

  addMiss() {
    this.missCount++;
    this.score += this._scoring.missPoint;
  }

  addCorrect() {
    this.correctCount++;
  }

  getScore() {
    return this.score;
  }

  getAccuracy() {
    const total = this.getTotalKeystrokes();
    if (total === 0) return 100;
    return Math.round((this.correctCount / total) * 10000) / 100;
  }

  getCorrectCount() {
    return this.correctCount;
  }

  getMissCount() {
    return this.missCount;
  }

  getTotalKeystrokes() {
    return this.correctCount + this.missCount;
  }

  reset() {
    this.correctCount = 0;
    this.missCount = 0;
    this.score = 0;
  }
}
