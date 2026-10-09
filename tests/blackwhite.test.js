// Juodos ir baltos logika.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  EMPTY, BLACK, WHITE, tripleCells, overfullLines, isSolved, countSolutions,
  generateSolved, makePuzzle, hintCell,
} from '../js/lib/blackwhiteLogic.js';

const LEVELS = [[4, 6], [4, 9], [6, 16]];
const B = BLACK;
const W = WHITE;

test('blackwhite: kiekvienas lygis turi lygiai vieną sprendinį', () => {
  for (const [n, blanks] of LEVELS) {
    for (let k = 0; k < 300; k++) {
      const { puzzle, solution } = makePuzzle(n, blanks);
      assert.equal(puzzle.filter((v) => v === EMPTY).length, blanks);
      assert.equal(countSolutions(puzzle, n, 3), 1);
      const found = [];
      countSolutions(puzzle, n, 2, found);
      assert.deepEqual(found[0], solution);
    }
  }
});

test('blackwhite: saugomas sprendinys praeina laimėjimo patikrą, o užduotis ne', () => {
  for (const [n, blanks] of LEVELS) {
    for (let k = 0; k < 100; k++) {
      const { puzzle, solution } = makePuzzle(n, blanks);
      assert.ok(isSolved(solution, n));
      assert.ok(!isSolved(puzzle, n));
      puzzle.forEach((v, i) => { if (v !== EMPTY) assert.equal(v, solution[i]); });
    }
  }
});

test('blackwhite: sugeneruoti tinkleliai atitinka taisykles', () => {
  for (const n of [4, 6]) {
    for (let k = 0; k < 100; k++) {
      const g = generateSolved(n);
      assert.equal(tripleCells(g, n).size, 0);
      assert.equal(overfullLines(g, n).length, 0);
      assert.ok(isSolved(g, n));
    }
  }
});

test('blackwhite: randa tris vienodus iš eilės eilutėje ir stulpelyje', () => {
  const row = [B, B, B, W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  assert.deepEqual([...tripleCells(row, 4)].sort(), [0, 1, 2]);
  const col = [W, 0, 0, 0, W, 0, 0, 0, W, 0, 0, 0, 0, 0, 0, 0];
  assert.deepEqual([...tripleCells(col, 4)].sort((a, b) => a - b), [0, 4, 8]);
  const none = [B, B, W, W, W, W, B, B, 0, 0, 0, 0, 0, 0, 0, 0];
  assert.equal(tripleCells(none, 4).size, 0);
  // Tušti langeliai trejetų nesudaro.
  assert.equal(tripleCells(new Array(16).fill(0), 4).size, 0);
});

test('blackwhite: randa nesubalansuotas eilutes ir stulpelius', () => {
  const g = [B, W, B, B, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  assert.deepEqual(overfullLines(g, 4), [{ kind: 'row', index: 0 }]);
  const col = [B, 0, 0, 0, B, 0, 0, 0, B, 0, 0, 0, 0, 0, 0, 0];
  const over = overfullLines(col, 4);
  assert.ok(over.some((l) => l.kind === 'col' && l.index === 0));
  assert.deepEqual(overfullLines(new Array(16).fill(0), 4), []);
});

test('blackwhite: laimėjimo patikra atmeta nepilną ar nesubalansuotą tinklelį', () => {
  const good = [B, W, B, W, W, B, W, B, B, W, B, W, W, B, W, B];
  // Šis tinklelis turi vienodas eilutes, bet taisyklės to nedraudžia.
  assert.ok(isSolved(good, 4));
  const incomplete = good.slice();
  incomplete[5] = EMPTY;
  assert.ok(!isSolved(incomplete, 4));
  // Be trejetų, bet eilutėse po tris vienos spalvos.
  const unbalanced = [B, B, W, B, W, W, B, W, B, B, W, B, W, W, B, W];
  assert.equal(tripleCells(unbalanced, 4).size, 0);
  assert.ok(!isSolved(unbalanced, 4));
  const triple = [B, B, B, W, W, W, B, B, B, W, W, W, W, W, W, B];
  assert.ok(!isSolved(triple, 4));
  const allBlack = new Array(16).fill(B);
  assert.ok(!isSolved(allBlack, 4));
});

test('blackwhite: užuominos sutampa su sprendiniu', () => {
  for (const [n, blanks] of LEVELS) {
    for (let k = 0; k < 100; k++) {
      const { puzzle, solution } = makePuzzle(n, blanks);
      const locked = new Set(puzzle.keys());
      for (const i of [...locked]) if (puzzle[i] === EMPTY) locked.delete(i);
      const grid = puzzle.slice();
      for (let guard = 0; guard < blanks; guard++) {
        const hint = hintCell(grid, solution, locked);
        assert.ok(hint);
        assert.equal(grid[hint.index], EMPTY);
        assert.equal(hint.value, solution[hint.index]);
        grid[hint.index] = hint.value;
        locked.add(hint.index);
      }
      assert.ok(isSolved(grid, n));
      assert.equal(hintCell(grid, solution, locked), null);
    }
  }
});

test('blackwhite: užuomina taiso neteisingai užpildytą langelį, kai tuščių nėra', () => {
  const { puzzle, solution } = makePuzzle(4, 6);
  const grid = solution.slice();
  const locked = new Set();
  puzzle.forEach((v, i) => { if (v !== EMPTY) locked.add(i); });
  const wrong = [...grid.keys()].find((i) => !locked.has(i));
  grid[wrong] = grid[wrong] === B ? W : B;
  const hint = hintCell(grid, solution, locked);
  assert.equal(hint.index, wrong);
  assert.equal(hint.value, solution[wrong]);
});
