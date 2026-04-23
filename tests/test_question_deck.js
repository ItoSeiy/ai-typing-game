import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { QuestionDeck } from '../src/core/question-deck.js';

const makeQuestions = (labels) =>
  labels.map((label) => ({ display: label, kana: label, imagePath: '' }));

describe('QuestionDeck（デッキ cursor 保持）', () => {
  it('同一csvPath再呼出しで cursor 継続 + shuffle スキップ', () => {
    let shuffleCount = 0;
    const countingShuffle = () => { shuffleCount++; };
    const deck = new QuestionDeck(countingShuffle);
    const qs = makeQuestions(['a', 'b', 'c', 'd']);

    assert.equal(deck.setQuestions(qs, 'easy.csv'), true);
    assert.equal(shuffleCount, 1);
    assert.equal(deck.cursor, 0);

    deck.next();
    deck.next();
    assert.equal(deck.cursor, 2);

    const changed = deck.setQuestions(qs, 'easy.csv');
    assert.equal(changed, false);
    assert.equal(shuffleCount, 1);
    assert.equal(deck.cursor, 2);

    const q = deck.next();
    assert.equal(deck.cursor, 3);
    assert.equal(q.display, 'c');
  });

  it('デッキ枯渇時に cursor=0 + 自動 reshuffle', () => {
    let shuffleCount = 0;
    const countingShuffle = () => { shuffleCount++; };
    const deck = new QuestionDeck(countingShuffle);
    deck.setQuestions(makeQuestions(['a', 'b']), 'easy.csv');
    assert.equal(shuffleCount, 1);

    deck.next();
    deck.next();
    assert.equal(deck.cursor, 2);
    assert.equal(deck.size, 2);

    deck.next();
    assert.equal(shuffleCount, 2);
    assert.equal(deck.cursor, 1);
  });

  it('csvPath 切替時は新 shuffle + cursor=0', () => {
    let shuffleCount = 0;
    const countingShuffle = () => { shuffleCount++; };
    const deck = new QuestionDeck(countingShuffle);
    deck.setQuestions(makeQuestions(['a', 'b', 'c']), 'easy.csv');
    deck.next();
    assert.equal(deck.cursor, 1);
    assert.equal(shuffleCount, 1);

    const changed = deck.setQuestions(makeQuestions(['x', 'y', 'z']), 'hard.csv');
    assert.equal(changed, true);
    assert.equal(shuffleCount, 2);
    assert.equal(deck.cursor, 0);

    const q = deck.next();
    assert.equal(q.display, 'x');
    assert.equal(deck.cursor, 1);
  });

});
