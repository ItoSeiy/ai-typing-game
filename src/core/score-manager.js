export class ScoreManager {
  constructor() {
    this.correctCount = 0;
    this.missCount = 0;
    this.score = 0;
    this.correctPoint = 10;
    this.missPoint = 0;
    this.completionBonus = 50;
  }

  addCorrect() {
    this.correctCount++;
    this.score += this.correctPoint;
  }

  addMiss() {
    this.missCount++;
    this.score += this.missPoint;
  }

  addCompletionBonus() {
    this.score += this.completionBonus;
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
