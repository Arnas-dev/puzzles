// Kiek eurų?: monetos, sumos, linksniai, atsakymų variantai (be sąsajos).
// Visi skaičiavimai atliekami sveikais centais.

import { shuffle, sample, randInt, pick } from './random.js';

const NBSP = ' ';

// kind: 'coin' arba 'note'. cents: vertė centais.
export const EURO_COINS = [
  { id: 'e1', kind: 'coin', cents: 100 },
  { id: 'e2', kind: 'coin', cents: 200 },
];
export const EURO_NOTES = [
  { id: 'n5', kind: 'note', cents: 500 },
  { id: 'n10', kind: 'note', cents: 1000 },
];
export const CENT_COINS = [
  { id: 'c10', kind: 'coin', cents: 10 },
  { id: 'c20', kind: 'coin', cents: 20 },
  { id: 'c50', kind: 'coin', cents: 50 },
];

export const LEVELS = ['euros', 'cents', 'mixed'];

// 1 euras, 2-9 eurai, 10-19 ir 20, 30... eurų. 21, 31... euras (taisyklė bendra).
function form(n, one, few, many) {
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return one;
  if (last >= 2 && last <= 9 && !(lastTwo >= 12 && lastTwo <= 19)) return few;
  return many;
}
export const euroWord = (n) => form(n, 'euras', 'eurai', 'eurų');
export const centWord = (n) => form(n, 'centas', 'centai', 'centų');

// „7 €“, „1,50 €“. Su withCents visada rodomi du skaitmenys po kablelio: „2,00 €“, „0,50 €“.
export function formatMoney(cents, withCents = false) {
  const euros = Math.floor(cents / 100);
  const rest = cents % 100;
  if (rest === 0 && !withCents) return `${euros}${NBSP}€`;
  return `${euros},${String(rest).padStart(2, '0')}${NBSP}€`;
}

export const totalCents = (items) => items.reduce((s, x) => s + x.cents, 0);

// „5 + 2 + 1 = 8 eurai“, o vienam dėmeniui tik „2 eurai“.
function sumPart(values, wordFn) {
  const sum = values.reduce((a, b) => a + b, 0);
  if (values.length === 1) return `${sum} ${wordFn(sum)}`;
  return `${values.join(' + ')} = ${sum} ${wordFn(sum)}`;
}

// Paaiškinimas žingsnis po žingsnio.
export function explainMoney(items, level) {
  const total = totalCents(items);
  const euros = items.filter((x) => x.cents >= 100).map((x) => x.cents / 100);
  const cents = items.filter((x) => x.cents < 100).map((x) => x.cents);
  if (level === 'euros') {
    return `${sumPart(euros, euroWord)}.`;
  }
  if (level === 'cents') {
    return `${sumPart(cents, centWord)}.`;
  }
  return `Eurai: ${sumPart(euros, euroWord)}. Centai: ${sumPart(cents, centWord)}. Iš viso: ${formatMoney(total, true)}.`;
}

// Monetų rinkinys lygiui. Suma lieka paprasta: be 21, 31 eurų, centų dalis mažesnė už 100.
export function makeItems(level, rnd = Math.random) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const count = randInt(3, 6, rnd);
    let items;
    if (level === 'euros') {
      const pool = [...EURO_COINS, ...EURO_NOTES];
      items = Array.from({ length: count }, () => pick(pool, rnd));
      const t = totalCents(items) / 100;
      if (t > 25 || (t % 10 === 1 && t > 1)) continue;
    } else if (level === 'cents') {
      items = Array.from({ length: count }, () => pick(CENT_COINS, rnd));
      if (totalCents(items) >= 100) continue;
    } else {
      const eCount = randInt(1, Math.min(2, count - 1), rnd);
      const euroPool = [...EURO_COINS, EURO_NOTES[0]];
      items = [
        ...Array.from({ length: eCount }, () => pick(euroPool, rnd)),
        ...Array.from({ length: count - eCount }, () => pick(CENT_COINS, rnd)),
      ];
      const centsPart = totalCents(items.filter((x) => x.cents < 100));
      const eurosPart = totalCents(items.filter((x) => x.cents >= 100)) / 100;
      if (centsPart >= 100 || eurosPart > 9) continue;
    }
    return items.sort((a, b) => b.cents - a.cents);
  }
  throw new Error('Nepavyko sudaryti monetų rinkinio');
}

const DELTAS = {
  euros: [100, 200, 500],
  cents: [10, 20, 50],
  mixed: [10, 20, 50, 100, 200],
};

// Keturi skirtingi variantai: teisingas ir trys netoli (skiriasi vienos monetos verte).
export function makeOptions(correct, level, rnd = Math.random) {
  const withCents = level !== 'euros';
  const seen = new Set([correct]);
  const cands = [];
  for (const d of DELTAS[level]) {
    for (const v of [correct - d, correct + d]) {
      if (v > 0 && !seen.has(v)) {
        seen.add(v);
        cands.push(v);
      }
    }
  }
  const wrong = sample(cands, 3, rnd);
  return shuffle([correct, ...wrong], rnd).map((v) => ({ id: String(v), label: formatMoney(v, withCents), cents: v }));
}

export function makeRound(level, rnd = Math.random) {
  const items = makeItems(level, rnd);
  const correct = totalCents(items);
  return {
    level,
    items,
    correct: String(correct),
    options: makeOptions(correct, level, rnd),
    explain: explainMoney(items, level),
  };
}

// 3 + 3 + 3 užduotys; viename lygyje to paties atsakymo nekartojame.
export function makeRounds(perLevel = 3, rnd = Math.random) {
  const rounds = [];
  for (const level of LEVELS) {
    const used = new Set();
    let guard = 0;
    while (used.size < perLevel && guard++ < 100) {
      const r = makeRound(level, rnd);
      if (used.has(r.correct)) continue;
      used.add(r.correct);
      rounds.push(r);
    }
  }
  return rounds;
}
