import { CONFIG } from '../../assets/config.js';

export class ScoreManager {
  constructor() {
    this.correctCount = 0;
    this.missCount = 0;
    this.score = 0;
  }

  addQuestionComplete(kanaLength = 0) {
    this.score += kanaLength * CONFIG.scoring.pointPerChar;
  }

  addMiss() {
    this.missCount++;
    this.score += CONFIG.scoring.missPoint;
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
