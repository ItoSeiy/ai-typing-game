// QuestionDeck: ゲームまたぎで cursor を保持する出題デッキ。
// 同一 csvPath 再読み込みは cursor 継続（shuffle スキップ）、
// 異なる csvPath は新 shuffle + cursor=0、
// cursor がデッキ末尾に到達した次の next() で自動 reshuffle。

export function defaultShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export class QuestionDeck {
  constructor(shuffleFn = defaultShuffle) {
    this._shuffle = shuffleFn;
    this._questions = [];
    this._cursor = 0;
    this._lastCsvPath = null;
  }

  setQuestions(questions, csvPath) {
    if (csvPath === this._lastCsvPath && this._questions.length > 0) {
      return false;
    }
    this._questions = questions.slice();
    this._shuffle(this._questions);
    this._cursor = 0;
    this._lastCsvPath = csvPath;
    return true;
  }

  next() {
    if (this._questions.length === 0) return null;
    if (this._cursor >= this._questions.length) {
      this._cursor = 0;
      this._shuffle(this._questions);
    }
    const q = this._questions[this._cursor];
    this._cursor++;
    return q;
  }

  current() {
    if (this._cursor === 0) return null;
    return this._questions[this._cursor - 1];
  }

  get cursor() {
    return this._cursor;
  }

  get size() {
    return this._questions.length;
  }

  snapshot() {
    return this._questions.slice();
  }
}
