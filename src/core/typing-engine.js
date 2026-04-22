import { ROMAJI_TABLE } from './romaji-table.js';

/**
 * カタカナをひらがなに変換（U+30A1-U+30F6 → U+3041-U+3096）
 * 漢字・記号・長音符(ー)等はそのまま通過する。
 */
function katakanaToHiragana(str) {
  return str.replace(/[\u30A1-\u30F6]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * TypingEngine — 複数ローマ字パターン対応ステートマシン
 *
 * 日本語テキストをチャンク（拗音・促音考慮）に分割し、
 * 各チャンクに対して ROMAJI_TABLE の全パターンを受理する。
 */
export class TypingEngine {
  constructor() {
    /** @type {{ kana: string, patterns: string[] }[]} */
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.buffer = '';
    this.original = '';
    this.completedRomaji = '';
  }

  /**
   * 問題をロードしてチャンク分割する。
   * @param {string} textDisplay  画面表示用テキスト（漢字・カタカナ・ひらがな）
   * @param {string} textKana  ひらがな読み（typing-engineへの入力ソース）
   */
  loadQuestion(textDisplay, textKana) {
    this.original = textDisplay;
    const normalized = katakanaToHiragana(textKana).replace(/[A-Z]/g, ch =>
      ch.toLowerCase()
    );
    this.chunks = this._parseText(normalized);
    this.currentChunkIndex = 0;
    this.buffer = '';
    this.completedRomaji = '';
  }

  /**
   * ひらがなテキストをチャンク配列に分割する。
   * 優先順: 促音(っ)+次 → 拗音(2文字) → 1文字
   */
  _parseText(text) {
    const chunks = [];
    let i = 0;

    while (i < text.length) {
      // ── 促音 (っ) + 次の文字を結合 ──
      if (text[i] === 'っ' && i + 1 < text.length) {
        let nextKana = null;
        let nextLen = 0;

        // 拗音が続く場合（っしゃ 等）
        if (i + 2 < text.length && ROMAJI_TABLE[text[i + 1] + text[i + 2]]) {
          nextKana = text[i + 1] + text[i + 2];
          nextLen = 2;
        } else if (ROMAJI_TABLE[text[i + 1]]) {
          nextKana = text[i + 1];
          nextLen = 1;
        }

        if (nextKana) {
          const nextPatterns = ROMAJI_TABLE[nextKana];
          const combined = [];

          // 子音を重ねるパターン（kka, cchi 等）
          for (const p of nextPatterns) {
            combined.push(p[0] + p);
          }

          // っ単体入力 + 次文字パターン（xtuka, ltuka 等）
          const tsuStandalone = ROMAJI_TABLE['っ'] || [];
          for (const tp of tsuStandalone) {
            for (const np of nextPatterns) {
              combined.push(tp + np);
            }
          }

          chunks.push({ kana: 'っ' + nextKana, patterns: combined });
          i += 1 + nextLen;
          continue;
        }
        // 次の文字がテーブルにない場合 → っ単体として扱う（下のsingle charへ）
      }

      // ── 拗音 (2文字マッチ) ──
      if (i + 1 < text.length && text[i] !== 'っ') {
        const twoChar = text[i] + text[i + 1];
        if (ROMAJI_TABLE[twoChar]) {
          chunks.push({ kana: twoChar, patterns: [...ROMAJI_TABLE[twoChar]] });
          i += 2;
          continue;
        }
      }

      // ── 1文字 ──
      if (ROMAJI_TABLE[text[i]]) {
        chunks.push({ kana: text[i], patterns: [...ROMAJI_TABLE[text[i]]] });
      } else {
        // テーブルにない文字（記号・ASCII等）はそのまま通す
        chunks.push({ kana: text[i], patterns: [text[i]] });
      }
      i += 1;
    }

    // ん のパターンを文脈に応じて調整
    this._adjustNPatterns(chunks);

    return chunks;
  }

  /**
   * ん の有効パターンを次のチャンクに応じて決定する。
   * 次が母音/y/n で始まる場合 → 'n' 単打を除外（nn, xn のみ）
   * それ以外（子音/末尾） → 'n' 単打も許可
   */
  _adjustNPatterns(chunks) {
    const ambiguousStarts = new Set(['a', 'i', 'u', 'e', 'o', 'y', 'n']);

    for (let j = 0; j < chunks.length; j++) {
      if (chunks[j].kana !== 'ん') continue;

      if (j + 1 < chunks.length) {
        const nextFirstChars = new Set(
          chunks[j + 1].patterns.map(p => p[0])
        );
        const needsDouble = [...nextFirstChars].some(c => ambiguousStarts.has(c));

        if (needsDouble) {
          chunks[j].patterns = chunks[j].patterns.filter(p => p !== 'n');
          continue;
        }
      }
      // 末尾 or 子音の前: 全パターン維持（n, nn, xn）
    }
  }

  /**
   * キー入力を処理する。
   * @param {string} key  押されたキー（1文字）
   * @returns {{ correct: boolean, completed: boolean, currentPos: number, totalLen: number }}
   */
  handleKeyPress(key) {
    if (this.currentChunkIndex >= this.chunks.length) {
      return {
        correct: false,
        completed: true,
        currentPos: this._getTypedLength(),
        totalLen: this._getTotalLength()
      };
    }

    const chunk = this.chunks[this.currentChunkIndex];
    const testBuffer = this.buffer + key;

    // testBuffer がいずれかのパターンのプレフィックスにマッチするか
    const matching = chunk.patterns.filter(p => p.startsWith(testBuffer));

    if (matching.length > 0) {
      this.buffer = testBuffer;

      const exact = matching.find(p => p === testBuffer);
      if (exact) {
        // 完全一致あり: 他に長いパターンがない OR 最後のチャンク → 即確定
        if (matching.length === 1 || this.currentChunkIndex >= this.chunks.length - 1) {
          this._commitChunk(exact);
        }
        // else: 遅延確定（ん の "n"/"nn" 曖昧性対応）— 次のキーで判断
      }

      return {
        correct: true,
        completed: this.currentChunkIndex >= this.chunks.length,
        currentPos: this._getTypedLength(),
        totalLen: this._getTotalLength()
      };
    }

    // ── testBuffer はどのパターンにもマッチしない ──
    // 遅延確定チェック: 現在の buffer が完全一致なら確定して、key を次チャンクで再試行
    if (this.buffer.length > 0) {
      const deferredExact = chunk.patterns.find(p => p === this.buffer);
      if (deferredExact) {
        this._commitChunk(deferredExact);
        if (this.currentChunkIndex < this.chunks.length) {
          return this.handleKeyPress(key);
        }
      }
    }

    // ミス
    return {
      correct: false,
      completed: this.currentChunkIndex >= this.chunks.length,
      currentPos: this._getTypedLength(),
      totalLen: this._getTotalLength()
    };
  }

  /** チャンクを確定して次へ進む */
  _commitChunk(pattern) {
    this.completedRomaji += pattern;
    this.buffer = '';
    this.currentChunkIndex++;
  }

  /** 入力済み文字数（確定分 + バッファ） */
  _getTypedLength() {
    return this.completedRomaji.length + this.buffer.length;
  }

  /** 全体の文字数（確定 + 現チャンク + 残りチャンクの最短パターン） */
  _getTotalLength() {
    let total = this.completedRomaji.length;

    if (this.currentChunkIndex < this.chunks.length) {
      const bestRemaining = this._getBestRemaining();
      total += this.buffer.length + bestRemaining.length;

      for (let i = this.currentChunkIndex + 1; i < this.chunks.length; i++) {
        total += this._shortest(this.chunks[i].patterns).length;
      }
    }

    return total;
  }

  /** 現チャンクの最適パターンの残り部分を返す */
  _getBestRemaining() {
    if (this.currentChunkIndex >= this.chunks.length) return '';
    const chunk = this.chunks[this.currentChunkIndex];

    if (this.buffer.length === 0) {
      return this._shortest(chunk.patterns);
    }

    const matching = chunk.patterns.filter(p => p.startsWith(this.buffer));
    if (matching.length === 0) return '';
    return this._shortest(matching).slice(this.buffer.length);
  }

  /** 配列中の最短文字列を返す */
  _shortest(arr) {
    return arr.reduce((a, b) => (a.length <= b.length ? a : b));
  }

  /** 状態をリセットする */
  reset() {
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.buffer = '';
    this.original = '';
    this.completedRomaji = '';
  }

  /**
   * 表示用データを返す。
   * @returns {{ original: string, typed: string, remaining: string }}
   */
  getCurrentDisplay() {
    const typed = this.completedRomaji + this.buffer;
    let remaining = '';

    if (this.currentChunkIndex < this.chunks.length) {
      remaining = this._getBestRemaining();
      for (let i = this.currentChunkIndex + 1; i < this.chunks.length; i++) {
        remaining += this._shortest(this.chunks[i].patterns);
      }
    }

    return { original: this.original, typed, remaining };
  }
}
