import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime, hourWord, timeWords, handAngles, explainTime, makeOptions, levelTimes, pickTimes, LEVEL_MINUTES,
} from '../js/lib/clockLogic.js';

test('formatTime', () => {
  assert.equal(formatTime(3, 0), '3:00');
  assert.equal(formatTime(7, 30), '7:30');
  assert.equal(formatTime(12, 15), '12:15');
});

test('hourWord: 1 valanda, 2-9 valandos, 10+ valandų', () => {
  assert.equal(hourWord(1), 'valanda');
  for (let h = 2; h <= 9; h++) assert.equal(hourWord(h), 'valandos');
  for (let h = 10; h <= 12; h++) assert.equal(hourWord(h), 'valandų');
});

test('timeWords', () => {
  assert.equal(timeWords(1, 0), '1 valanda');
  assert.equal(timeWords(3, 0), '3 valandos');
  assert.equal(timeWords(10, 0), '10 valandų');
  assert.equal(timeWords(12, 0), '12 valandų');
  assert.equal(timeWords(1, 30), '1 valanda 30 minučių');
  assert.equal(timeWords(4, 15), '4 valandos 15 minučių');
  assert.equal(timeWords(11, 45), '11 valandų 45 minutės');
});

test('handAngles', () => {
  assert.deepEqual(handAngles(3, 0), { hour: 90, minute: 0 });
  assert.deepEqual(handAngles(12, 0), { hour: 0, minute: 0 });
  assert.deepEqual(handAngles(7, 30), { hour: 225, minute: 180 });
  assert.deepEqual(handAngles(6, 45), { hour: 202.5, minute: 270 });
});

test('explainTime', () => {
  assert.equal(explainTime(3, 0), 'Trumpoji rodyklė rodo 3, ilgoji rodo 12. Taigi laikas: 3 valandos.');
  assert.equal(explainTime(7, 30), 'Trumpoji rodyklė yra tarp 7 ir 8, ilgoji rodo 6. Taigi laikas: 7 valandos 30 minučių.');
  assert.equal(explainTime(12, 15), 'Trumpoji rodyklė yra tarp 12 ir 1, ilgoji rodo 3. Taigi laikas: 12 valandų 15 minučių.');
});

test('makeOptions: 4 skirtingi variantai, teisingas yra tarp jų, minutės iš to paties ar lengvesnio lygio', () => {
  for (const level of Object.keys(LEVEL_MINUTES)) {
    for (const correct of levelTimes(level)) {
      for (let t = 0; t < 5; t++) {
        const opts = makeOptions(correct, level);
        assert.equal(opts.length, 4);
        assert.equal(new Set(opts.map((o) => o.id)).size, 4);
        assert.equal(new Set(opts.map((o) => o.label)).size, 4);
        assert.equal(opts.filter((o) => o.id === formatTime(correct.h, correct.m)).length, 1);
        for (const o of opts) assert.ok(o.h >= 1 && o.h <= 12);
      }
    }
  }
});

test('pickTimes: nesikartoja, tinka lygiui', () => {
  const times = pickTimes('quarter', 3);
  assert.equal(new Set(times.map((t) => formatTime(t.h, t.m))).size, 3);
  for (const t of times) assert.ok([15, 45].includes(t.m));
});
