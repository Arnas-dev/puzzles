// Plytelių logika.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  solvedBoard, isSolved, movableTiles, canMove, moveTile, makeTiles, solvePath, hintTile,
} from '../js/lib/tilesLogic.js';

const LEVELS = [{ rows: 2, cols: 3, moves: 6 }, { rows: 3, cols: 3, moves: 10 }, { rows: 3, cols: 3, moves: 25 }];

test('tiles: lentos išsprendžiamos ir nėra jau išspręstos (300 kartų per lygį)', () => {
  for (const { rows, cols, moves } of LEVELS) {
    for (let i = 0; i < 300; i++) {
      const b = makeTiles(rows, cols, moves);
      assert.ok(!isSolved(b));
      assert.deepEqual(b.slice().sort((x, y) => x - y), solvedBoard(rows, cols).slice().sort((x, y) => x - y));
    }
  }
});

test('tiles: paieška randa sprendimą, ne ilgesnį nei maišymas (30 kartų per lygį)', () => {
  for (const { rows, cols, moves } of LEVELS) {
    for (let i = 0; i < 30; i++) {
      const b = makeTiles(rows, cols, moves);
      const path = solvePath(b, rows, cols);
      assert.ok(path && path.length > 0 && path.length <= moves);
      let cur = b;
      for (const idx of path) cur = moveTile(cur, rows, cols, idx);
      assert.ok(isSolved(cur));
    }
  }
});

test('tiles: išspręstos lentos atpažinimas', () => {
  assert.ok(isSolved([1, 2, 3, 4, 5, 0]));
  assert.ok(!isSolved([1, 2, 3, 4, 0, 5]));
  assert.ok(!isSolved([0, 1, 2, 3, 4, 5]));
  assert.equal(hintTile([1, 2, 3, 4, 5, 0], 2, 3), null);
});

test('tiles: judėjimo teisėtumas', () => {
  // 1 2 3
  // 4 0 5
  // 7 8 6   (tuščia vieta viduryje)
  const b = [1, 2, 3, 4, 0, 5, 7, 8, 6];
  assert.deepEqual(movableTiles(b, 3, 3).sort(), [1, 3, 5, 7]);
  assert.ok(canMove(b, 3, 3, 1));
  assert.ok(!canMove(b, 3, 3, 0), 'įstrižai negalima');
  assert.equal(moveTile(b, 3, 3, 8), null);
  const m = moveTile(b, 3, 3, 3);
  assert.deepEqual(m, [1, 2, 3, 0, 4, 5, 7, 8, 6]);
  assert.deepEqual(b, [1, 2, 3, 4, 0, 5, 7, 8, 6], 'pradinė lenta nekeičiama');
  // kampas
  assert.deepEqual(movableTiles([0, 1, 2, 3, 4, 5], 2, 3).sort(), [1, 3]);
});

test('tiles: užuomina sumažina atstumą iki sprendimo', () => {
  for (const { rows, cols, moves } of LEVELS) {
    for (let i = 0; i < 15; i++) {
      const b = makeTiles(rows, cols, moves);
      const d = solvePath(b, rows, cols).length;
      const idx = hintTile(b, rows, cols);
      assert.ok(canMove(b, rows, cols, idx));
      const after = moveTile(b, rows, cols, idx);
      const d2 = isSolved(after) ? 0 : solvePath(after, rows, cols).length;
      assert.equal(d2, d - 1);
    }
  }
});

test('tiles: atšaukimas grąžina ankstesnę būseną', () => {
  const start = makeTiles(3, 3, 10);
  const history = [];
  let b = start;
  for (let i = 0; i < 5; i++) {
    const idx = movableTiles(b, 3, 3)[0];
    history.push(b);
    b = moveTile(b, 3, 3, idx);
  }
  while (history.length) b = history.pop();
  assert.deepEqual(b, start);
});
