import test from 'node:test';
import assert from 'node:assert/strict';
import { pickSession } from '../js/games/crossword.js';
import { CROSSWORDS } from '../js/data/crosswords.js';

test('crossword session has 5 distinct boards, easier first', () => {
  const size = (def) => def.length * 100 + def.reduce((s, w) => s + Array.from(w.answer).length, 0);
  for (let i = 0; i < 200; i++) {
    const s = pickSession(CROSSWORDS);
    assert.equal(s.length, 5);
    assert.equal(new Set(s).size, 5);
    for (let k = 1; k < s.length; k++) assert.ok(size(s[k - 1]) <= size(s[k]));
  }
});
