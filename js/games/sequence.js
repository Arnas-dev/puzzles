// Tęskite seką: skaičių arba paveikslėlių eilutė, reikia pasirinkti kitą narį.

import { h } from '../ui.js';
import { runChoiceGame } from '../lib/choiceGame.js';
import { pick, randInt, shuffle } from '../lib/random.js';

const SHAPES = ['🔴', '🔵', '🟢', '🟡', '🍎', '🍌', '⭐', '❤️'];

// Skaičių seka: start, žingsnis ar daugiklis, ilgis 4 + atsakymas.
export function makeNumberSequence(kind, rnd = Math.random) {
  let items = [];
  let rule = '';
  if (kind === 'add1') {
    const s = randInt(1, 5, rnd);
    items = [0, 1, 2, 3, 4].map((k) => s + k);
    rule = 'Kiekvieną kartą pridedame 1.';
  } else if (kind === 'add2') {
    const s = pick([1, 2, 3], rnd);
    items = [0, 1, 2, 3, 4].map((k) => s + 2 * k);
    rule = 'Kiekvieną kartą pridedame 2.';
  } else if (kind === 'add5') {
    const s = pick([5, 10], rnd);
    items = [0, 1, 2, 3, 4].map((k) => s + 5 * k);
    rule = 'Kiekvieną kartą pridedame 5.';
  } else if (kind === 'add10') {
    const s = pick([10, 5, 20], rnd);
    items = [0, 1, 2, 3, 4].map((k) => s + 10 * k);
    rule = 'Kiekvieną kartą pridedame 10.';
  } else if (kind === 'sub1') {
    const s = randInt(9, 14, rnd);
    items = [0, 1, 2, 3, 4].map((k) => s - k);
    rule = 'Kiekvieną kartą atimame 1.';
  } else if (kind === 'sub2') {
    const s = pick([20, 18, 16], rnd);
    items = [0, 1, 2, 3, 4].map((k) => s - 2 * k);
    rule = 'Kiekvieną kartą atimame 2.';
  } else if (kind === 'double') {
    const s = pick([1, 2, 3], rnd);
    items = [0, 1, 2, 3, 4].map((k) => s * 2 ** k);
    rule = 'Kiekvieną kartą dauginame iš 2.';
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

// Paveikslėlių seka: ABAB.. arba AAB AAB..
export function makeShapeSequence(kind, rnd = Math.random) {
  const [a, b] = shuffle(SHAPES, rnd).slice(0, 2);
  const unit = kind === 'AAB' ? [a, a, b] : [a, b];
  const all = [];
  const total = kind === 'AAB' ? 7 : 5;
  for (let i = 0; i < total; i++) all.push(unit[i % unit.length]);
  const answer = all[total - 1];
  const shown = all.slice(0, total - 1);
  const others = shuffle(SHAPES.filter((s) => s !== a && s !== b), rnd);
  const options = shuffle([a, b, others[0], others[1]].filter((s, i, arr) => arr.indexOf(s) === i), rnd);
  return { shown, answer, options, rule: 'Paveikslėliai kartojasi.' };
}

export function buildRounds() {
  const specs = [
    () => ({ type: 'num', ...makeNumberSequence('add1') }),
    () => ({ type: 'num', ...makeNumberSequence('add2') }),
    () => ({ type: 'shape', ...makeShapeSequence('AB') }),
    () => ({ type: 'num', ...makeNumberSequence(pick(['add5', 'add10'])) }),
    () => ({ type: 'num', ...makeNumberSequence(pick(['sub1', 'sub2'])) }),
    () => (Math.random() < 0.5
      ? { type: 'shape', ...makeShapeSequence('AAB') }
      : { type: 'num', ...makeNumberSequence('double') }),
  ];
  return specs.map((make) => {
    const seq = make();
    const isNum = seq.type === 'num';
    const answer = isNum ? seq.answer : seq.answer;
    const optionValues = isNum ? numberOptions(seq.answer) : seq.options;
    return {
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
