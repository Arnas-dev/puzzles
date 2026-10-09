// Juoda ir balta: loginė dalis be sąsajos.
// Tinklelis: masyvas iš n*n skaičių, 0 = tuščia, 1 = juoda, 2 = balta.
// Taisyklės: (1) eilutėje ar stulpelyje negali būti trijų vienodų iš eilės;
// (2) kiekvienoje eilutėje ir stulpelyje juodų ir baltų langelių po lygiai.

import { shuffle } from './random.js';

export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

// Visos eilutės ir stulpeliai kaip langelių indeksų sąrašai.
export function lines(n) {
  const out = [];
  for (let r = 0; r < n; r++) out.push({ kind: 'row', index: r, cells: Array.from({ length: n }, (_, c) => r * n + c) });
  for (let c = 0; c < n; c++) out.push({ kind: 'col', index: c, cells: Array.from({ length: n }, (_, r) => r * n + c) });
  return out;
}

// Langeliai, kurie sudaro tris vienodus iš eilės (kad juos būtų galima paryškinti).
export function tripleCells(grid, n) {
  const hit = new Set();
  for (const line of lines(n)) {
    for (let k = 0; k + 2 < n; k++) {
      const [a, b, c] = [line.cells[k], line.cells[k + 1], line.cells[k + 2]];
      if (grid[a] !== EMPTY && grid[a] === grid[b] && grid[b] === grid[c]) {
        hit.add(a); hit.add(b); hit.add(c);
      }
    }
  }
  return hit;
}

// Eilutės ir stulpeliai, kuriuose vienos spalvos yra daugiau nei pusė.
export function overfullLines(grid, n) {
  const half = n / 2;
  const out = [];
  for (const line of lines(n)) {
    const black = line.cells.filter((i) => grid[i] === BLACK).length;
    const white = line.cells.filter((i) => grid[i] === WHITE).length;
    if (black > half || white > half) out.push({ kind: line.kind, index: line.index });
  }
  return out;
}

// Laimėjimas pagal taisykles: viskas užpildyta, nėra trejetų, visur po lygiai.
export function isSolved(grid, n) {
  if (grid.length !== n * n || grid.some((v) => v === EMPTY)) return false;
  if (tripleCells(grid, n).size > 0) return false;
  return lines(n).every((line) => {
    const black = line.cells.filter((i) => grid[i] === BLACK).length;
    return black === n / 2;
  });
}

// Ar dedant `v` į langelį `i` nepažeidžiamos taisyklės (naudojama sprendiklyje).
function canPlace(g, n, i, v) {
  const r = Math.floor(i / n);
  const c = i % n;
  const half = n / 2;
  g[i] = v;
  let ok = true;
  // Trejetai, kuriuose dalyvauja šis langelis.
  const same = (a, b) => g[a] === v && g[b] === v;
  if (c >= 2 && same(i - 1, i - 2)) ok = false;
  if (c >= 1 && c <= n - 2 && same(i - 1, i + 1)) ok = false;
  if (c <= n - 3 && same(i + 1, i + 2)) ok = false;
  if (r >= 2 && same(i - n, i - 2 * n)) ok = false;
  if (r >= 1 && r <= n - 2 && same(i - n, i + n)) ok = false;
  if (r <= n - 3 && same(i + n, i + 2 * n)) ok = false;
  if (ok) {
    let inRow = 0;
    let inCol = 0;
    for (let k = 0; k < n; k++) {
      if (g[r * n + k] === v) inRow++;
      if (g[k * n + c] === v) inCol++;
    }
    if (inRow > half || inCol > half) ok = false;
  }
  g[i] = EMPTY;
  return ok;
}

// Skaičiuoja sprendinius iki `limit`. Jei `collect` perduotas, įrašo pirmą rastą sprendinį.
export function countSolutions(grid, n, limit = 2, collect = null) {
  const g = grid.slice();
  let count = 0;
  function solve(from) {
    if (count >= limit) return;
    let i = from;
    while (i < g.length && g[i] !== EMPTY) i++;
    if (i === g.length) {
      if (isSolved(g, n)) {
        if (count === 0 && collect) collect.push(g.slice());
        count++;
      }
      return;
    }
    for (const v of [BLACK, WHITE]) {
      if (!canPlace(g, n, i, v)) continue;
      g[i] = v;
      solve(i + 1);
      g[i] = EMPTY;
      if (count >= limit) return;
    }
  }
  solve(0);
  return count;
}

// Atsitiktinis pilnas teisingas tinklelis.
export function generateSolved(n, rnd = Math.random) {
  const g = new Array(n * n).fill(EMPTY);
  function fill(i) {
    if (i === g.length) return isSolved(g, n);
    for (const v of shuffle([BLACK, WHITE], rnd)) {
      if (!canPlace(g, n, i, v)) continue;
      g[i] = v;
      if (fill(i + 1)) return true;
      g[i] = EMPTY;
    }
    return false;
  }
  if (!fill(0)) throw new Error('nepavyko sukurti tinklelio');
  return g;
}

// Užduotis su `blanks` tuščių langelių ir vieninteliu sprendiniu.
export function makePuzzle(n, blanks, rnd = Math.random) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const solution = generateSolved(n, rnd);
    const puzzle = solution.slice();
    let removed = 0;
    for (const i of shuffle([...puzzle.keys()], rnd)) {
      if (removed >= blanks) break;
      const keep = puzzle[i];
      puzzle[i] = EMPTY;
      if (countSolutions(puzzle, n) === 1) removed++;
      else puzzle[i] = keep;
    }
    if (removed === blanks) return { n, puzzle, solution };
  }
  throw new Error('nepavyko sukurti užduoties');
}

// Užuomina: tuščias langelis (arba, jei tokių nėra, neteisingai užpildytas) su teisinga spalva.
export function hintCell(grid, solution, locked, rnd = Math.random) {
  const free = [...grid.keys()].filter((i) => !locked.has(i));
  const empty = free.filter((i) => grid[i] === EMPTY);
  const pool = empty.length ? empty : free.filter((i) => grid[i] !== solution[i]);
  if (!pool.length) return null;
  const i = pool[Math.floor(rnd() * pool.length)];
  return { index: i, value: solution[i] };
}
