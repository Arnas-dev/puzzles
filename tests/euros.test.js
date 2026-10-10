import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  euroWord, centWord, formatMoney, totalCents, explainMoney, makeItems, makeOptions, makeRounds, makeRound, LEVELS,
} from '../js/lib/eurosLogic.js';

const N = ' ';

test('euroWord / centWord: linksniai', () => {
  const cases = [
    [1, 'euras', 'centas'], [2, 'eurai', 'centai'], [9, 'eurai', 'centai'], [10, 'eurų', 'centų'],
    [11, 'eurų', 'centų'], [12, 'eurų', 'centų'], [19, 'eurų', 'centų'], [20, 'eurų', 'centų'],
    [21, 'euras', 'centas'], [22, 'eurai', 'centai'], [30, 'eurų', 'centų'], [101, 'euras', 'centas'],
    [111, 'eurų', 'centų'],
  ];
  for (const [n, e, c] of cases) {
    assert.equal(euroWord(n), e, `euroWord(${n})`);
    assert.equal(centWord(n), c, `centWord(${n})`);
  }
});

test('formatMoney: kablelis ir nepertraukiamas tarpas', () => {
  assert.equal(formatMoney(700), `7${N}€`);
  assert.equal(formatMoney(150), `1,50${N}€`);
  assert.equal(formatMoney(50, true), `0,50${N}€`);
  assert.equal(formatMoney(200, true), `2,00${N}€`);
  assert.equal(formatMoney(1005, true), `10,05${N}€`);
});

test('explainMoney', () => {
  const c = (cents) => ({ cents });
  assert.equal(explainMoney([c(500), c(200), c(100)], 'euros'), '5 + 2 + 1 = 8 eurai.');
  assert.equal(explainMoney([c(1000), c(1000), c(200)], 'euros'), '10 + 10 + 2 = 22 eurai.');
  assert.equal(explainMoney([c(50), c(20), c(10)], 'cents'), '50 + 20 + 10 = 80 centų.');
  assert.equal(explainMoney([c(200), c(100), c(50), c(20)], 'mixed'),
    `Eurai: 2 + 1 = 3 eurai. Centai: 50 + 20 = 70 centų. Iš viso: 3,70${N}€.`);
  assert.equal(explainMoney([c(100), c(50), c(10), c(10)], 'mixed'),
    `Eurai: 1 euras. Centai: 50 + 10 + 10 = 70 centų. Iš viso: 1,70${N}€.`);
});

test('makeItems: 3-6 monetos, tinka lygiui, centų suma < 100', () => {
  for (const level of LEVELS) {
    for (let t = 0; t < 500; t++) {
      const items = makeItems(level);
      assert.ok(items.length >= 3 && items.length <= 6);
      const total = totalCents(items);
      if (level === 'euros') assert.ok(items.every((x) => x.cents >= 100) && total % 100 === 0);
      if (level === 'cents') assert.ok(items.every((x) => x.cents < 100) && total < 100);
      if (level === 'mixed') {
        assert.ok(items.some((x) => x.cents >= 100) && items.some((x) => x.cents < 100));
        assert.ok(total % 100 !== 0 || items.filter((x) => x.cents < 100).length > 0);
        assert.ok(totalCents(items.filter((x) => x.cents < 100)) < 100);
      }
    }
  }
});

test('makeOptions: 4 skirtingi, teisingas yra, visi teigiami, skirtingos antraštės', () => {
  for (const level of LEVELS) {
    for (let t = 0; t < 500; t++) {
      const items = makeItems(level);
      const correct = totalCents(items);
      const opts = makeOptions(correct, level);
      assert.equal(opts.length, 4);
      assert.equal(new Set(opts.map((o) => o.id)).size, 4);
      assert.equal(new Set(opts.map((o) => o.label)).size, 4);
      assert.equal(opts.filter((o) => o.id === String(correct)).length, 1);
      assert.ok(opts.every((o) => o.cents > 0));
    }
  }
});

test('makeRounds: 9 užduočių, 3 + 3 + 3, atsakymai lygyje nesikartoja', () => {
  for (let t = 0; t < 50; t++) {
    const rounds = makeRounds();
    assert.equal(rounds.length, 9);
    LEVELS.forEach((level, i) => {
      const part = rounds.slice(i * 3, i * 3 + 3);
      assert.ok(part.every((r) => r.level === level));
      assert.equal(new Set(part.map((r) => r.correct)).size, 3);
    });
  }
  const r = makeRound('cents');
  assert.ok(r.explain.endsWith('centų.'));
});
