// Tęskite seką: skaičių arba paveikslėlių eilutė, reikia pasirinkti kitą narį.

import { h } from '../ui.js';
import { runChoiceGame } from '../lib/choiceGame.js';
import { pick, randInt, shuffle } from '../lib/random.js';

const SHAPES = ['🔴', '🔵', '🟢', '🟡', '🍎', '🍌', '⭐', '❤️'];

// Skaičių sekų rūšys nuo lengvesnių iki sunkesnių (testai tikrina kiekvieną).
export const NUMBER_KINDS = [
  'add1', 'sub1', 'add2', 'add10', 'add3', 'add5', 'sub2', 'sub3', 'sub5', 'sub10',
  'repeat', 'alt12', 'double', 'half', 'triple', 'growStep', 'squares',
];
export const SHAPE_KINDS = ['AB', 'AAB', 'ABB', 'AABB', 'ABC', 'grow'];

const range5 = [0, 1, 2, 3, 4];

// Skaičių seka: start, žingsnis ar daugiklis, ilgis 4 + atsakymas.
export function makeNumberSequence(kind, rnd = Math.random) {
  let items = [];
  let rule = '';
  if (kind === 'add1') {
    const s = randInt(1, 5, rnd);
    items = range5.map((k) => s + k);
    rule = 'Kiekvieną kartą pridedame 1.';
  } else if (kind === 'add2') {
    const s = pick([1, 2, 3], rnd);
    items = range5.map((k) => s + 2 * k);
    rule = 'Kiekvieną kartą pridedame 2.';
  } else if (kind === 'add3') {
    const s = pick([1, 2, 3, 4], rnd);
    items = range5.map((k) => s + 3 * k);
    rule = 'Kiekvieną kartą pridedame 3.';
  } else if (kind === 'add5') {
    const s = pick([5, 10], rnd);
    items = range5.map((k) => s + 5 * k);
    rule = 'Kiekvieną kartą pridedame 5.';
  } else if (kind === 'add10') {
    const s = pick([10, 5, 20], rnd);
    items = range5.map((k) => s + 10 * k);
    rule = 'Kiekvieną kartą pridedame 10.';
  } else if (kind === 'sub1') {
    const s = randInt(9, 14, rnd);
    items = range5.map((k) => s - k);
    rule = 'Kiekvieną kartą atimame 1.';
  } else if (kind === 'sub2') {
    const s = pick([20, 18, 16], rnd);
    items = range5.map((k) => s - 2 * k);
    rule = 'Kiekvieną kartą atimame 2.';
  } else if (kind === 'sub3') {
    const s = pick([25, 22, 20, 18], rnd);
    items = range5.map((k) => s - 3 * k);
    rule = 'Kiekvieną kartą atimame 3.';
  } else if (kind === 'sub5') {
    const s = pick([40, 35, 30, 50], rnd);
    items = range5.map((k) => s - 5 * k);
    rule = 'Kiekvieną kartą atimame 5.';
  } else if (kind === 'sub10') {
    const s = pick([90, 80, 70, 60], rnd);
    items = range5.map((k) => s - 10 * k);
    rule = 'Skaičiuojame atgal dešimtimis: kiekvieną kartą atimame 10.';
  } else if (kind === 'double') {
    const s = pick([1, 2, 3], rnd);
    items = range5.map((k) => s * 2 ** k);
    rule = 'Kiekvieną kartą dauginame iš 2.';
  } else if (kind === 'triple') {
    items = range5.map((k) => 3 ** k);
    rule = 'Kiekvieną kartą dauginame iš 3.';
  } else if (kind === 'half') {
    const s = pick([32, 48, 64], rnd);
    items = range5.map((k) => s / 2 ** k);
    rule = 'Kiekvieną kartą dalijame iš 2.';
  } else if (kind === 'alt12') {
    const s = randInt(1, 6, rnd);
    const steps = rnd() < 0.5 ? [1, 2, 1, 2] : [2, 1, 2, 1];
    items = [s];
    for (const d of steps) items.push(items[items.length - 1] + d);
    rule = 'Pridedame pakaitomis 1 ir 2.';
  } else if (kind === 'growStep') {
    const s = randInt(1, 3, rnd);
    items = [s, s + 1, s + 3, s + 6, s + 10];
    rule = 'Pridedamas skaičius kaskart didėja: 1, 2, 3, 4.';
  } else if (kind === 'squares') {
    items = [1, 4, 9, 16, 25];
    rule = 'Kiekvienas skaičius yra skaičius, padaugintas iš savęs: 1×1, 2×2, 3×3, 4×4, 5×5.';
  } else if (kind === 'repeat') {
    const a = randInt(1, 9, rnd);
    let b = randInt(1, 9, rnd);
    if (b === a) b = a === 9 ? 8 : a + 1;
    items = range5.map((k) => (k % 2 === 0 ? a : b));
    rule = 'Du skaičiai kartojasi paeiliui.';
  } else {
    throw new Error('nežinomas sekos tipas: ' + kind);
  }
  return { shown: items.slice(0, 4), answer: items[4], rule, all: items };
}

export function numberOptions(answer, rnd = Math.random) {
  const set = new Set([answer]);
  for (const d of shuffle([-2, -1, 1, 2, 3, -3, 4], rnd)) {
    if (set.size === 4) break;
    const v = answer + d;
    if (v > 0) set.add(v);
  }
  return [...set].sort((a, b) => a - b);
}

// Paveikslėlių seka: ABAB.., AAB AAB.., ABB.., AABB.., ABC ABC.. arba augantis kiekis.
export function makeShapeSequence(kind, rnd = Math.random) {
  if (kind === 'grow') return makeGrowSequence(rnd);
  const units = {
    AB: { pattern: [0, 1], total: 5 },
    AAB: { pattern: [0, 0, 1], total: 7 },
    ABB: { pattern: [0, 1, 1], total: 8 },
    AABB: { pattern: [0, 0, 1, 1], total: 8 },
    ABC: { pattern: [0, 1, 2], total: 8 },
  };
  const spec = units[kind];
  if (!spec) throw new Error('nežinomas paveikslėlių sekos tipas: ' + kind);
  const symbols = shuffle(SHAPES, rnd);
  const used = symbols.slice(0, Math.max(...spec.pattern) + 1);
  const all = [];
  for (let i = 0; i < spec.total; i++) all.push(used[spec.pattern[i % spec.pattern.length]]);
  const answer = all[spec.total - 1];
  const shown = all.slice(0, spec.total - 1);
  const others = symbols.slice(used.length);
  const options = shuffle([...used, others[0], others[1]].slice(0, 4), rnd);
  const rule = kind === 'ABC' ? 'Trys paveikslėliai kartojasi paeiliui.' : 'Paveikslėliai kartojasi.';
  return { shown, answer, options, rule };
}

// Augantis kiekis: ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐ -> ⭐⭐⭐⭐⭐
function makeGrowSequence(rnd = Math.random) {
  const sym = pick(SHAPES, rnd);
  const row = (n) => sym.repeat(n);
  const shown = [1, 2, 3, 4].map(row);
  const answer = row(5);
  const lo = randInt(2, 5, rnd);
  const options = shuffle([0, 1, 2, 3].map((k) => row(lo + k)), rnd);
  return { shown, answer, options, rule: 'Kiekvieną kartą pridedamas vienas paveikslėlis.' };
}

// Šešių užduočių sesija: nuo lengvų prie sunkesnių, kiekvieną kartą atsitiktinė rūšis.
const ROUND_POOLS = [
  [{ type: 'num', kind: 'add1' }, { type: 'num', kind: 'sub1' }],
  [{ type: 'num', kind: 'add2' }, { type: 'num', kind: 'add10' }, { type: 'shape', kind: 'AB' }],
  [{ type: 'shape', kind: 'AB' }, { type: 'shape', kind: 'AAB' }, { type: 'shape', kind: 'ABB' }, { type: 'num', kind: 'repeat' }],
  [{ type: 'num', kind: 'add3' }, { type: 'num', kind: 'add5' }, { type: 'num', kind: 'sub2' }, { type: 'num', kind: 'sub10' }],
  [{ type: 'shape', kind: 'ABC' }, { type: 'shape', kind: 'AABB' }, { type: 'shape', kind: 'grow' },
    { type: 'num', kind: 'sub3' }, { type: 'num', kind: 'sub5' }],
  [{ type: 'num', kind: 'double' }, { type: 'num', kind: 'half' }, { type: 'num', kind: 'alt12' },
    { type: 'num', kind: 'triple' }, { type: 'num', kind: 'growStep' }, { type: 'num', kind: 'squares' }],
];

export function buildRounds(rnd = Math.random) {
  return ROUND_POOLS.map((pool) => {
    const spec = pick(pool, rnd);
    const isNum = spec.type === 'num';
    const seq = isNum ? makeNumberSequence(spec.kind, rnd) : makeShapeSequence(spec.kind, rnd);
    const answer = seq.answer;
    const optionValues = isNum ? numberOptions(seq.answer, rnd) : seq.options;
    return {
      kind: spec.kind,
      layout: isNum ? 'numbers' : 'letters',
      correct: answer,
      options: optionValues.map((v) => ({ id: v, label: String(v) })),
      explain: seq.rule,
      build() {
        const slot = h('span', { class: 'seq-box blank' }, '?');
        const boxes = seq.shown.map((v) => h('span', { class: 'seq-box' }, String(v)));
        return {
          el: h('div', { class: 'seq-row' }, boxes, slot),
          reveal() {
            slot.textContent = String(answer);
            slot.classList.remove('blank');
            slot.classList.add('filled');
          },
        };
      },
    };
  });
}

export function mount(root, ctx) {
  runChoiceGame(root, ctx, {
    title: 'Tęskite seką',
    instruction: 'Pažiūrėkite į eilutę ir pasirinkite, kas bus toliau.',
    buildRounds,
  });
}
