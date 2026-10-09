// Spalvų užliejimo logika.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeFlood, floodStep, floodedRegion, isWon, hintColor } from '../js/lib/floodLogic.js';

const LEVELS = [{ n: 4, k: 3 }, { n: 5, k: 3 }, { n: 6, k: 4 }];

test('flood: lentos nėra vienos spalvos ir spalvos tinkamos (300 kartų per lygį)', () => {
  for (const { n, k } of LEVELS) {
    for (let i = 0; i < 300; i++) {
      const b = makeFlood(n, k);
      assert.equal(b.length, n * n);
      assert.ok(!isWon(b));
      assert.ok(b.every((c) => Number.isInteger(c) && c >= 0 && c < k));
    }
  }
});

test('flood: kiekviena lenta išsprendžiama pagal užuominas (300 kartų per lygį)', () => {
  for (const { n, k } of LEVELS) {
    for (let i = 0; i < 300; i++) {
      let b = makeFlood(n, k);
      let steps = 0;
      while (!isWon(b)) {
        const c = hintColor(b, n, k);
        assert.notEqual(c, null);
        assert.notEqual(c, b[0], 'užuomina siūlo tą pačią spalvą');
        const size = floodedRegion(b, n).size;
        b = floodStep(b, n, c);
        assert.ok(floodedRegion(b, n).size > size, 'sritis turi augti');
        assert.ok(++steps <= n * n, 'per daug žingsnių');
      }
    }
  }
});

test('flood: žingsnis keičia spalvą ir prijungia gretimus', () => {
  // 0 0 1
  // 2 1 1
  // 2 2 1
  const b = [0, 0, 1, 2, 1, 1, 2, 2, 1];
  assert.deepEqual([...floodedRegion(b, 3)].sort(), [0, 1]);
  const after = floodStep(b, 3, 1);
  assert.deepEqual(after, [1, 1, 1, 2, 1, 1, 2, 2, 1]);
  assert.deepEqual([...floodedRegion(after, 3)].sort(), [0, 1, 2, 4, 5, 8]);
  assert.deepEqual(b, [0, 0, 1, 2, 1, 1, 2, 2, 1], 'pradinė lenta nekeičiama');
  assert.deepEqual(floodStep(b, 3, 0), b, 'ta pati spalva nieko nekeičia');
});

test('flood: pergalės nustatymas', () => {
  assert.ok(isWon([2, 2, 2, 2]));
  assert.ok(!isWon([2, 2, 2, 1]));
  assert.ok(isWon(floodStep([0, 1, 1, 1], 2, 1)));
});

test('flood: atšaukimas grąžina ankstesnę būseną', () => {
  const start = makeFlood(5, 3);
  const history = [];
  let b = start;
  for (const c of [0, 1, 2, 0, 1]) {
    if (c === b[0]) continue;
    history.push(b);
    b = floodStep(b, 5, c);
  }
  while (history.length) b = history.pop();
  assert.deepEqual(b, start);
});
