// Sekos ir lygtys: visos rūšys ir pilnos sesijos (daug atsitiktinių bandymų).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  makeNumberSequence, numberOptions, makeShapeSequence, buildRounds as seqRounds, NUMBER_KINDS, SHAPE_KINDS,
} from '../js/games/sequence.js';
import { makeEquation, answerOf, makeOptions, buildRounds as eqRounds } from '../js/games/equations.js';

const unique = (a) => new Set(a).size === a.length;

const RULES = {
  add1: (x, y) => y - x === 1,
  add2: (x, y) => y - x === 2,
  add3: (x, y) => y - x === 3,
  add5: (x, y) => y - x === 5,
  add10: (x, y) => y - x === 10,
  sub1: (x, y) => x - y === 1,
  sub2: (x, y) => x - y === 2,
  sub3: (x, y) => x - y === 3,
  sub5: (x, y) => x - y === 5,
  sub10: (x, y) => x - y === 10,
  double: (x, y) => y === 2 * x,
  triple: (x, y) => y === 3 * x,
  half: (x, y) => x === 2 * y,
};

test('sequences: bent 15 skaičių sekų rūšių, visos turi taisyklę', () => {
  assert.ok(NUMBER_KINDS.length + SHAPE_KINDS.length >= 15);
  for (const kind of NUMBER_KINDS) {
    for (let n = 0; n < 300; n++) {
      const s = makeNumberSequence(kind);
      assert.equal(s.all.length, 5);
      assert.deepEqual(s.shown, s.all.slice(0, 4));
      assert.equal(s.answer, s.all[4]);
      assert.ok(s.all.every((v) => Number.isInteger(v) && v > 0 && v < 100), `${kind}: ${s.all}`);
      assert.ok(s.rule.length > 0);
      for (let k = 0; k < 4; k++) {
        if (RULES[kind]) assert.ok(RULES[kind](s.all[k], s.all[k + 1]), `${kind}: ${s.all}`);
      }
      if (kind === 'repeat') {
        assert.notEqual(s.all[0], s.all[1]);
        for (let k = 2; k < 5; k++) assert.equal(s.all[k], s.all[k - 2]);
      }
      if (kind === 'alt12') {
        const d = s.all.slice(1).map((v, k) => v - s.all[k]);
        assert.ok(d.every((x) => x === 1 || x === 2));
        for (let k = 1; k < 4; k++) assert.notEqual(d[k], d[k - 1]);
      }
      if (kind === 'growStep') {
        const d = s.all.slice(1).map((v, k) => v - s.all[k]);
        assert.deepEqual(d, [1, 2, 3, 4]);
      }
      if (kind === 'squares') s.all.forEach((v, k) => assert.equal(v, (k + 1) ** 2));
    }
  }
});

test('sequences: paveikslėlių sekos kartojasi, variantai skirtingi', () => {
  const periods = { AB: 2, AAB: 3, ABB: 3, AABB: 4, ABC: 3 };
  for (const [kind, period] of Object.entries(periods)) {
    for (let n = 0; n < 300; n++) {
      const s = makeShapeSequence(kind);
      const all = [...s.shown, s.answer];
      for (let k = period; k < all.length; k++) assert.equal(all[k], all[k - period], `${kind}: ${all}`);
      assert.equal(new Set(all).size, kind === 'ABC' ? 3 : 2, `${kind}: ${all}`);
      assert.ok(unique(s.options) && s.options.length >= 3 && s.options.includes(s.answer));
    }
  }
  for (let n = 0; n < 300; n++) {
    const s = makeShapeSequence('grow');
    const all = [...s.shown, s.answer];
    const unit = [...s.answer][0] === '❤' ? '❤️' : null;
    const count = (str) => str.split(unit || [...all[0]].join('')).length - 1;
    all.forEach((v, k) => assert.equal(count(v), k + 1, `grow: ${all}`));
    assert.equal(s.options.length, 4);
    assert.ok(unique(s.options) && s.options.includes(s.answer));
  }
  assert.throws(() => makeShapeSequence('nezinomas'));
});

test('sequences: 1000 sesijų, 6 užduotys, variantai skirtingi ir su teisingu atsakymu', () => {
  const kinds = new Set();
  const firstKinds = new Set();
  for (let n = 0; n < 1000; n++) {
    const rounds = seqRounds();
    assert.equal(rounds.length, 6);
    firstKinds.add(rounds.map((r) => r.kind).join(','));
    for (const r of rounds) {
      kinds.add(r.kind);
      const ids = r.options.map((o) => o.id);
      assert.ok(unique(ids.map(String)), `kartojasi variantai: ${ids}`);
      assert.ok(ids.length >= 3 && ids.length <= 4);
      assert.ok(ids.includes(r.correct));
      for (const o of r.options) {
        assert.ok(!/NaN|undefined/.test(o.label), o.label);
        assert.ok(o.label.length > 0);
      }
      assert.ok(r.explain.length > 0);
    }
  }
  assert.ok(kinds.size >= 15, `panaudota rūšių: ${kinds.size}`);
  assert.ok(firstKinds.size > 20, 'sesijos per mažai skiriasi');
});

test('equations: papildomos pakopos teisingos', () => {
  const maxByTier = { 6: 10, 7: 20, 8: 20, 9: 30, 10: 30 };
  for (const [t, max] of Object.entries(maxByTier)) {
    const tier = Number(t);
    const seen = new Set();
    for (let n = 0; n < 500; n++) {
      const eq = makeEquation(tier);
      const { a, op, b, c } = eq;
      assert.equal(op === '+' ? a + b : a - b, c);
      assert.ok([a, b, c].every((v) => Number.isInteger(v) && v >= 1 && v <= max), `${a} ${op} ${b} = ${c}`);
      seen.add(eq.missing);
      const ans = answerOf(eq);
      const opts = makeOptions(ans, max);
      assert.equal(opts.length, 4);
      assert.ok(unique(opts) && opts.includes(ans) && opts.every((v) => Number.isInteger(v) && v >= 0));
    }
    if (tier === 6 || tier === 7) assert.deepEqual([...seen], ['a']);
    if (tier === 8 || tier === 10) assert.equal(seen.size, 3);
  }
});

test('equations: 1000 sesijų po 6 užduotis, o sesijos skiriasi', () => {
  const sigs = new Set();
  for (let n = 0; n < 1000; n++) {
    const rounds = eqRounds();
    assert.equal(rounds.length, 6);
    sigs.add(rounds.map((r) => r.explain).join('|'));
    for (const r of rounds) {
      const ids = r.options.map((o) => o.id);
      assert.equal(ids.length, 4);
      assert.ok(unique(ids) && ids.includes(r.correct));
      assert.ok(ids.every((v) => Number.isInteger(v) && v >= 0 && !Number.isNaN(v)));
    }
  }
  assert.ok(sigs.size > 500);
});
