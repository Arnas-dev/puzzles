// Vamzdžiai: loginė dalis be sąsajos.
// Plytelė = skaičius 0..15, bitai: 1 = viršus, 2 = dešinė, 4 = apačia, 8 = kairė.
// Lenta: masyvas iš n*n plytelių, indeksas = eilutė * n + stulpelis.

import { shuffle } from './random.js';

export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;
export const DIRS = [N, E, S, W];

export const opposite = (d) => (d === N ? S : d === S ? N : d === E ? W : E);

// Pasukimas 90 laipsnių pagal laikrodžio rodyklę: viršus -> dešinė -> apačia -> kairė -> viršus.
export const rotateMask = (m) => ((m << 1) | (m >> 3)) & 15;

export function rotateTimes(m, k) {
  let r = m;
  for (let i = 0; i < ((k % 4) + 4) % 4; i++) r = rotateMask(r);
  return r;
}

export const countBits = (m) => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1);

// Kaimynas kryptimi d arba -1, jei ten siena.
export function neighbour(n, i, d) {
  const r = Math.floor(i / n);
  const c = i % n;
  if (d === N) return r > 0 ? i - n : -1;
  if (d === S) return r < n - 1 ? i + n : -1;
  if (d === W) return c > 0 ? i - 1 : -1;
  return c < n - 1 ? i + 1 : -1;
}

// Kurios plytelės pasiekiamos iš šaltinio sujungtais vamzdžiais (abu galai sutampa).
export function reachable(board, n, source) {
  const seen = new Set([source]);
  const queue = [source];
  while (queue.length) {
    const i = queue.shift();
    for (const d of DIRS) {
      if (!(board[i] & d)) continue;
      const j = neighbour(n, i, d);
      if (j === -1 || seen.has(j)) continue;
      if (board[j] & opposite(d)) {
        seen.add(j);
        queue.push(j);
      }
    }
  }
  return seen;
}

// Kiek vamzdžių galų neturi poros (siena arba kaimynas nenukreiptas atgal).
export function openEnds(board, n) {
  let open = 0;
  for (let i = 0; i < board.length; i++) {
    for (const d of DIRS) {
      if (!(board[i] & d)) continue;
      const j = neighbour(n, i, d);
      if (j === -1 || !(board[j] & opposite(d))) open++;
    }
  }
  return open;
}

// Laimėjimas pagal taisykles: visos plytelės pasiekiamos ir nėra atvirų galų.
export function isSolved(board, n, source) {
  if (board.some((m) => m === 0)) return false;
  return openEnds(board, n) === 0 && reachable(board, n, source).size === board.length;
}

// Atsitiktinis ištisinis medis (be kilpų), pradedant nuo šaltinio.
export function randomTree(n, source, rnd = Math.random) {
  const board = new Array(n * n).fill(0);
  const inTree = new Set([source]);
  let frontier = [];
  const addEdges = (i) => {
    for (const d of DIRS) {
      const j = neighbour(n, i, d);
      if (j !== -1 && !inTree.has(j)) frontier.push({ from: i, d, to: j });
    }
  };
  addEdges(source);
  while (frontier.length) {
    const k = Math.floor(rnd() * frontier.length);
    const e = frontier[k];
    frontier[k] = frontier[frontier.length - 1];
    frontier.pop();
    if (inTree.has(e.to)) continue;
    inTree.add(e.to);
    board[e.from] |= e.d;
    board[e.to] |= opposite(e.d);
    addEdges(e.to);
  }
  return board;
}

// Šaltinis kuo arčiau centro.
export function centreIndex(n, rnd = Math.random) {
  if (n % 2 === 1) return (n >> 1) * n + (n >> 1);
  const lo = n / 2 - 1;
  const hi = n / 2;
  const cells = shuffle([lo * n + lo, lo * n + hi, hi * n + lo, hi * n + hi], rnd);
  return cells[0];
}

// Sukuria užduotį: sprendinys (medis) ir atsitiktinai pasuktas pradinis variantas.
export function makePuzzle(n, rnd = Math.random) {
  const source = centreIndex(n, rnd);
  const solution = randomTree(n, source, rnd);
  for (let attempt = 0; attempt < 1000; attempt++) {
    const start = solution.map((m) => rotateTimes(m, Math.floor(rnd() * 4)));
    if (!isSolved(start, n, source)) return { n, source, solution, start };
  }
  // Beveik neįmanoma: pasukame vieną ne simetrišką plytelę.
  const start = solution.slice();
  const i = start.findIndex((m) => rotateMask(m) !== m);
  start[i] = rotateMask(start[i]);
  return { n, source, solution, start };
}

// Užuominai: plytelė, kurios kryptis skiriasi nuo sprendinio. Renkamės tą, kuriai užtenka mažiausiai spustelėjimų.
export function hintTile(board, solution, rnd = Math.random) {
  let best = [];
  let bestClicks = 5;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === solution[i]) continue;
    let clicks = 1;
    let m = rotateMask(board[i]);
    while (m !== solution[i] && clicks < 4) { m = rotateMask(m); clicks++; }
    if (clicks < bestClicks) { bestClicks = clicks; best = [i]; }
    else if (clicks === bestClicks) best.push(i);
  }
  return best.length ? best[Math.floor(rnd() * best.length)] : -1;
}
