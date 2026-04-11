import { ROMAJI_TABLE } from './romaji-table.js';

export class TypingEngine {
  constructor() {
    this.original = '';
    this.romaji = '';
    this.currentPos = 0;
    this.table = typeof ROMAJI_TABLE === 'object' ? ROMAJI_TABLE : null;
  }

  loadQuestion(textJa, textRomaji) {
    this.original = textJa;
    this.romaji = textRomaji;
    this.currentPos = 0;
  }

  handleKeyPress(key) {
    if (this.currentPos >= this.romaji.length) {
      return { correct: false, completed: true, currentPos: this.currentPos, totalLen: this.romaji.length };
    }

    const expected = this.romaji[this.currentPos];
    const correct = key === expected;

    if (correct) {
      this.currentPos++;
    }

    const completed = this.currentPos >= this.romaji.length;

    return {
      correct,
      completed,
      currentPos: this.currentPos,
      totalLen: this.romaji.length
    };
  }

  reset() {
    this.original = '';
    this.romaji = '';
    this.currentPos = 0;
  }

  getCurrentDisplay() {
    return {
      original: this.original,
      typed: this.romaji.slice(0, this.currentPos),
      remaining: this.romaji.slice(this.currentPos)
    };
  }
}
