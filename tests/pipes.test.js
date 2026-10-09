// Vamzdžių logika.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  N, E, S, W, rotateMask, rotateTimes, countBits, neighbour, reachable, openEnds,
  isSolved, randomTree, makePuzzle, hintTile,
} from '../js/lib/pipesLogic.js';

const SIZES = [3, 3, 4];

test('pipes: pasukimas keturis kartus grąžina plytelę', () => {
  for (let m = 0; m < 16; m++) {
    let r = m;
    for (let i = 0; i < 4; i++) r = rotateMask(r);
    assert.equal(r, m);
    assert.equal(countBits(rotateMask(m)), countBits(m));
  }
  assert.equal(rotateMask(N), E);
  assert.equal(rotateMask(E), S);
  assert.equal(rotateMask(S), W);
  assert.equal(rotateMask(W), N);
  assert.equal(rotateTimes(N, 3), W);
});

test('pipes: sprendinys yra jungus medis, praeinantis laimėjimo patikrą', () => {
  for (const n of SIZES) {
    for (let k = 0; k < 300; k++) {
      const p = makePuzzle(n);
      assert.equal(p.solution.length, n * n);
      assert.ok(isSolved(p.solution, n, p.source), 'sprendinys turi laimėti');
      assert.equal(reachable(p.solution, n, p.source).size, n * n);
      // Medis: briaunų skaičius = plytelių skaičius - 1.
      const ends = p.solution.reduce((a, m) => a + countBits(m), 0);
      assert.equal(ends / 2, n * n - 1);
      // Šaltinis arti centro.
      const r = Math.floor(p.source / n);
      const c = p.source % n;
      assert.ok(Math.abs(r - (n - 1) / 2) <= 0.5 && Math.abs(c - (n - 1) / 2) <= 0.5);
    }
  }
});

test('pipes: pradinė lenta niekada nėra išspręsta ir yra sprendinio pasukimai', () => {
  for (const n of SIZES) {
    for (let k = 0; k < 500; k++) {
      const p = makePuzzle(n);
      assert.ok(!isSolved(p.start, n, p.source));
      p.start.forEach((m, i) => {
        assert.ok([0, 1, 2, 3].some((t) => rotateTimes(p.solution[i], t) === m));
      });
    }
  }
});

test('pipes: išsprendžiama pasukant plyteles', () => {
  const p = makePuzzle(4);
  const board = p.start.slice();
  for (let i = 0; i < board.length; i++) {
    while (board[i] !== p.solution[i]) board[i] = rotateMask(board[i]);
  }
  assert.ok(isSolved(board, 4, p.source));
});

test('pipes: laimėjimo patikra atmeta atvirus galus', () => {
  // Dvi plytelės 1x2 netelpa į kvadratą, todėl naudojame 2x2 su žiedu ir vienu atviru galu.
  const n = 2;
  const ring = [E | S, W | S, N | E, N | W];
  assert.ok(isSolved(ring, n, 0));
  const open = ring.slice();
  open[3] = N | W | S; // apačia nukreipta į sieną
  assert.ok(openEnds(open, n) > 0);
  assert.ok(!isSolved(open, n, 0));
  const wall = ring.slice();
  wall[0] = E | S | N; // viršus į sieną
  assert.ok(!isSolved(wall, n, 0));
});

test('pipes: laimėjimo patikra atmeta neprijungtas plytelės', () => {
  // 2x2: dvi atskiros poros, kiekviena be atvirų galų, bet viena neprijungta prie šaltinio.
  const n = 2;
  const split = [E | S, W | S, N | E, N | W];
  assert.ok(isSolved(split, n, 0));
  const pairs = [S, S, N, N]; // dvi vertikalios poros
  assert.equal(openEnds(pairs, n), 0);
  assert.equal(reachable(pairs, n, 0).size, 2);
  assert.ok(!isSolved(pairs, n, 0));
  // Plytelė be vamzdžių.
  assert.ok(!isSolved([E, W, 0, 0], n, 0));
});

test('pipes: kaimynas nukreiptas ne atgal yra atviras galas', () => {
  const n = 2;
  const board = [E, E, 0, 0];
  assert.equal(openEnds(board, n), 2);
  assert.equal(neighbour(n, 0, W), -1);
  assert.equal(neighbour(n, 0, E), 1);
});

test('pipes: atsitiktinis medis jungus ir be kilpų', () => {
  for (let k = 0; k < 200; k++) {
    const board = randomTree(4, 5);
    assert.equal(reachable(board, 4, 5).size, 16);
    assert.equal(board.reduce((a, m) => a + countBits(m), 0) / 2, 15);
  }
});

test('pipes: užuomina rodo plytelę, kuri skiriasi nuo sprendinio', () => {
  for (let k = 0; k < 200; k++) {
    const p = makePuzzle(4);
    const i = hintTile(p.start, p.solution);
    assert.ok(i >= 0);
    assert.notEqual(p.start[i], p.solution[i]);
    // Pagal visus spustelėjimus užuomina galiausiai baigiasi.
    const board = p.start.slice();
    for (let guard = 0; guard < 100; guard++) {
      const j = hintTile(board, p.solution);
      if (j === -1) break;
      board[j] = rotateMask(board[j]);
    }
    assert.deepEqual(board, p.solution);
  }
  assert.equal(hintTile([1, 2], [1, 2]), -1);
});
