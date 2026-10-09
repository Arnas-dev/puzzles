// Žaidimų logika: lygtys, sekos, lemputės, sudoku.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeEquation, answerOf, makeOptions } from '../js/games/equations.js';
import { makeNumberSequence, numberOptions, makeShapeSequence } from '../js/games/sequence.js';
import { makeLights, press, allOff } from '../js/lib/lightsLogic.js';
import { makePuzzle, generateSolved, countSolutions, isSolved } from '../js/lib/sudokuLogic.js';

const unique = (a) => new Set(a).size === a.length;

test('equations: aritmetika teisinga visose pakopose', () => {
  const maxByTier = [10, 10, 10, 10, 20, 20];
  for (let tier = 0; tier < 6; tier++) {
    for (let n = 0; n < 500; n++) {
      const eq = makeEquation(tier);
      const { a, op, b, c } = eq;
      assert.ok(op === '+' || op === '−', `ženklas ${op}`);
      assert.equal(op === '+' ? a + b : a - b, c, `${a} ${op} ${b} != ${c}`);
      for (const v of [a, b, c]) assert.ok(Number.isInteger(v) && v >= 0, `neigiamas/neceilas: ${v}`);
      assert.ok(['a', 'b', 'c'].includes(eq.missing));
      const ans = answerOf(eq);
      assert.ok(Number.isInteger(ans) && ans >= 0);
      assert.ok(Math.max(a, b, c) <= maxByTier[tier], `per didelis skaičius pakopoje ${tier}`);
      const opts = makeOptions(ans, maxByTier[tier]);
      assert.equal(opts.length, 4);
      assert.ok(unique(opts));
      assert.ok(opts.every((v) => Number.isInteger(v) && v >= 0));
      assert.ok(opts.includes(ans));
    }
  }
});

test('sequences: skaičių sekos taisyklė galioja visiems 5 nariams', () => {
  const rules = {
    add1: (x, y) => y - x === 1,
    add2: (x, y) => y - x === 2,
    add5: (x, y) => y - x === 5,
    add10: (x, y) => y - x === 10,
    sub1: (x, y) => x - y === 1,
    sub2: (x, y) => x - y === 2,
    double: (x, y) => y === 2 * x,
  };
  for (const [kind, ok] of Object.entries(rules)) {
    for (let n = 0; n < 300; n++) {
      const s = makeNumberSequence(kind);
      assert.equal(s.all.length, 5);
      assert.deepEqual(s.shown, s.all.slice(0, 4));
      assert.equal(s.answer, s.all[4]);
      for (let k = 0; k < 4; k++) assert.ok(ok(s.all[k], s.all[k + 1]), `${kind}: ${s.all}`);
      assert.ok(s.all.every((v) => Number.isInteger(v) && v > 0), `${kind}: ${s.all}`);
      assert.ok(s.rule && s.rule.length > 0);
      const opts = numberOptions(s.answer);
      assert.equal(opts.length, 4);
      assert.ok(unique(opts));
      assert.ok(opts.every((v) => Number.isInteger(v) && v > 0));
      assert.ok(opts.includes(s.answer));
    }
  }
  assert.throws(() => makeNumberSequence('nezinomas'));
});

test('sequences: paveikslėlių sekos kartojasi, atsakymas atitinka', () => {
  for (const kind of ['AB', 'AAB']) {
    const period = kind === 'AB' ? 2 : 3;
    for (let n = 0; n < 300; n++) {
      const s = makeShapeSequence(kind);
      const all = [...s.shown, s.answer];
      assert.equal(all.length, kind === 'AB' ? 5 : 7);
      for (let k = period; k < all.length; k++) assert.equal(all[k], all[k - period], `${kind}: ${all}`);
      const symbols = new Set(all);
      assert.equal(symbols.size, 2);
      if (kind === 'AAB') assert.equal(all[0], all[1]);
      assert.ok(unique(s.options));
      assert.ok(s.options.length >= 3);
      assert.ok(s.options.includes(s.answer));
    }
  }
});

test('lights: lenta išsprendžiama, planas ją išjungia', () => {
  for (const [n, k] of [[3, 2], [3, 3], [4, 3]]) {
    for (let t = 0; t < 300; t++) {
      const { board, plan } = makeLights(n, k);
      assert.equal(board.length, n * n);
      assert.ok(!allOff(board), 'lenta jau užgesusi');
      assert.ok(plan.size > 0 && plan.size <= k);
      let b = board;
      for (const idx of plan) b = press(b, n, idx);
      assert.ok(allOff(b), `planas neišsprendžia (n=${n}, k=${k})`);
    }
  }
});

test('lights: du paspaudimai ant to paties langelio grąžina lentą', () => {
  for (const n of [3, 4]) {
    const board = Array.from({ length: n * n }, (_, i) => i % 3 === 0);
    for (let i = 0; i < n * n; i++) {
      assert.deepEqual(press(press(board, n, i), n, i), board);
      assert.notDeepEqual(press(board, n, i), board);
    }
  }
});

test('sudoku: generateSolved visada išspręstas', () => {
  for (let t = 0; t < 300; t++) {
    const g = generateSolved();
    assert.equal(g.length, 16);
    assert.ok(isSolved(g), `blogas tinklelis: ${g}`);
  }
});

test('sudoku: isSolved atmeta blogus tinklelius', () => {
  const g = generateSolved();
  assert.ok(!isSolved(g.map((v, i) => (i === 0 ? 0 : v))));
  const bad = g.slice();
  bad[0] = bad[1];
  assert.ok(!isSolved(bad));
});

test('sudoku: makePuzzle turi tiek tuščių, kiek prašoma, ir vienintelį sprendinį', () => {
  for (const blanks of [5, 7, 9]) {
    for (let t = 0; t < 100; t++) {
      const { puzzle, solution } = makePuzzle(blanks);
      assert.equal(puzzle.filter((v) => v === 0).length, blanks);
      assert.equal(countSolutions(puzzle), 1, `ne vienintelis sprendinys: ${puzzle}`);
      assert.ok(isSolved(solution), 'sprendinys netinkamas');
      puzzle.forEach((v, i) => { if (v !== 0) assert.equal(v, solution[i], `given nesutampa ${i}`); });
    }
  }
});
