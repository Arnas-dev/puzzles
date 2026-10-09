// Lemputės (angl. „Lights Out“ / Tatham „Flip“): loginė dalis be sąsajos.
// Lenta: masyvas iš n*n loginių reikšmių (true = dega).

import { shuffle } from './random.js';

export function neighbours(n, idx) {
  const r = Math.floor(idx / n);
  const c = idx % n;
  const out = [idx];
  if (r > 0) out.push(idx - n);
  if (r < n - 1) out.push(idx + n);
  if (c > 0) out.push(idx - 1);
  if (c < n - 1) out.push(idx + 1);
  return out;
}

export function press(board, n, idx) {
  const next = board.slice();
  for (const j of neighbours(n, idx)) next[j] = !next[j];
  return next;
}

export const allOff = (board) => board.every((x) => !x);

// Lenta sudaroma iš išspręstos (viskas užgesę) atlikus `k` paspaudimų, todėl visada išsprendžiama.
// `plan` yra paspaudimų aibė, kurią reikia pakartoti (spaudimai komutuoja, tvarka nesvarbi).
export function makeLights(n, k, rnd = Math.random) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const cells = shuffle(Array.from({ length: n * n }, (_, i) => i), rnd).slice(0, k);
    let board = Array(n * n).fill(false);
    for (const idx of cells) board = press(board, n, idx);
    if (!allOff(board) && board.filter(Boolean).length >= 2) return { board, plan: new Set(cells) };
  }
  throw new Error('nepavyko sukurti lempučių');
}
