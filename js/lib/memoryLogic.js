// Atminties poros: kortų dalijimas ir poros tikrinimas (be sąsajos).
// Kiekviena pora = paveikslėlio kortelė + žodžio kortelė.

import { shuffle } from './random.js';

// Per ilgi žodžiai netelpa į kortelę siaurame telefono ekrane.
export const MAX_WORD_LENGTH = 11;

// Grąžina 2*n sumaišytų kortelių: { id, pair, kind: 'pic' | 'word', text }.
// Poros žodžiai ir paveikslėliai nesikartoja.
export function dealPairs(words, n, rnd = Math.random) {
  const usable = [];
  const seenW = new Set();
  const seenE = new Set();
  for (const x of shuffle(words, rnd)) {
    if (x.w.length > MAX_WORD_LENGTH || seenW.has(x.w) || seenE.has(x.e)) continue;
    seenW.add(x.w);
    seenE.add(x.e);
    usable.push(x);
  }
  if (usable.length < n) throw new Error('Per mažai žodžių poroms');
  const cards = [];
  usable.slice(0, n).forEach((x, i) => {
    cards.push({ id: `p${i}`, pair: x.w, kind: 'pic', text: x.e });
    cards.push({ id: `w${i}`, pair: x.w, kind: 'word', text: x.w });
  });
  return shuffle(cards, rnd);
}

export function isMatch(a, b) {
  return a.id !== b.id && a.pair === b.pair && a.kind !== b.kind;
}

// Užuomina: dviejų kortelių, kurios sudaro porą, id. Jei viena kortelė jau atversta, grąžinama jos pora.
// matched: rastų kortelių id aibė; open: šiuo metu atverstų (dar nesurastų) kortelių id.
export function hintPair(cards, matched, open = [], rnd = Math.random) {
  const free = cards.filter((c) => !matched.has(c.id));
  if (open.length === 1) {
    const first = free.find((c) => c.id === open[0]);
    const mate = first && free.find((c) => isMatch(first, c));
    if (mate) return [first.id, mate.id];
  }
  const pairs = [];
  for (const a of free) {
    if (a.kind !== 'pic') continue;
    const b = free.find((c) => isMatch(a, c));
    if (b) pairs.push([a.id, b.id]);
  }
  if (!pairs.length) return null;
  return shuffle(pairs, rnd)[0];
}

export function allMatched(cards, matched) {
  return cards.every((c) => matched.has(c.id));
}
