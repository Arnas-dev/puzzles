// Mažasis sudoku 4×4 (kvadratai 2×2): loginė dalis be sąsajos.
// Tinklelis: masyvas iš 16 skaičių, 0 = tuščia.

import { shuffle } from './random.js';

const SIZE = 4;
const BOX = 2;

export const rowOf = (i) => Math.floor(i / SIZE);
export const colOf = (i) => i % SIZE;
export const boxOf = (i) => Math.floor(rowOf(i) / BOX) * BOX + Math.floor(colOf(i) / BOX);

function peers(i) {
  const out = { row: [], col: [], box: [] };
  for (let j = 0; j < SIZE * SIZE; j++) {
    if (j === i) continue;
    if (rowOf(j) === rowOf(i)) out.row.push(j);
    if (colOf(j) === colOf(i)) out.col.push(j);
    if (boxOf(j) === boxOf(i)) out.box.push(j);
  }
  return out;
}

// Kur tame pačiame stulpelyje / eilutėje / kvadrate jau yra toks skaičius.
export function conflicts(grid, i, val) {
  const p = peers(i);
  const hit = (list) => list.filter((j) => grid[j] === val);
  return { row: hit(p.row), col: hit(p.col), box: hit(p.box) };
}

export function isSolved(grid) {
  if (grid.some((v) => v === 0)) return false;
  const groups = [];
  for (let k = 0; k < SIZE; k++) {
    groups.push(grid.filter((_, i) => rowOf(i) === k));
    groups.push(grid.filter((_, i) => colOf(i) === k));
    groups.push(grid.filter((_, i) => boxOf(i) === k));
  }
  return groups.every((g) => new Set(g).size === SIZE);
}

export function generateSolved(rnd = Math.random) {
  const base = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) base.push(((r * BOX + Math.floor(r / BOX) + c) % SIZE) + 1);
  }
  const digits = shuffle([1, 2, 3, 4], rnd);
  const rowOrder = [...shuffle([0, 1], rnd), ...shuffle([2, 3], rnd)];
  const colOrder = [...shuffle([0, 1], rnd), ...shuffle([2, 3], rnd)];
  // Perstatome kvadratų juostas.
  const bandSwap = rnd() < 0.5;
  const stackSwap = rnd() < 0.5;
  const mapRow = (r) => (bandSwap ? (rowOrder[r] + 2) % 4 : rowOrder[r]);
  const mapCol = (c) => (stackSwap ? (colOrder[c] + 2) % 4 : colOrder[c]);
  const out = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) out.push(digits[base[mapRow(r) * SIZE + mapCol(c)] - 1]);
  }
  return out;
}

// Skaičiuoja sprendinius iki `limit` (pakanka žinoti, ar jų lygiai vienas).
export function countSolutions(grid, limit = 2) {
  const g = grid.slice();
  let count = 0;
  function solve() {
    if (count >= limit) return;
    const i = g.indexOf(0);
    if (i === -1) { count++; return; }
    for (let v = 1; v <= SIZE; v++) {
      const c = conflicts(g, i, v);
      if (c.row.length || c.col.length || c.box.length) continue;
      g[i] = v;
      solve();
      g[i] = 0;
      if (count >= limit) return;
    }
  }
  solve();
  return count;
}

// Sukuria užduotį su `blanks` tuščių langelių (pagal galimybes) ir vieninteliu sprendiniu.
export function makePuzzle(blanks, rnd = Math.random) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const solution = generateSolved(rnd);
    const puzzle = solution.slice();
    let removed = 0;
    for (const i of shuffle([...puzzle.keys()], rnd)) {
      if (removed >= blanks) break;
      const keep = puzzle[i];
      puzzle[i] = 0;
      if (countSolutions(puzzle) === 1) removed++;
      else puzzle[i] = keep;
    }
    if (removed === blanks) return { puzzle, solution };
  }
  throw new Error('nepavyko sukurti sudoku');
}
