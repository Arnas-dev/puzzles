import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORD_ORDER } from '../js/data/wordOrder.js';
import {
  makeTiles, textsOf, isCorrect, positionCorrect, place, remove, undo, keepCorrect, nextHint, applyHint, display, orders,
} from '../js/lib/wordOrderLogic.js';
import { pickSentences } from '../js/games/wordOrder.js';

const ALL = [...WORD_ORDER.easy, ...WORD_ORDER.medium, ...WORD_ORDER.hard];
const S = { words: ['katė', 'geria', 'pieną'], alts: [['pieną', 'geria', 'katė']] };

// Padeda visas plyteles ta tvarka, kokia nurodyta (pagal tekstus).
function fill(sentence, tiles, order) {
  let slots = new Array(tiles.length).fill(null);
  for (const w of order) {
    const t = tiles.find((x) => x.text === w && !slots.includes(x.id));
    slots = place(slots, t.id);
  }
  return slots;
}

test('makeTiles: niekada neatiduoda teisingos ar leistinos eilės', () => {
  for (const s of ALL) {
    for (let k = 0; k < 40; k++) {
      const tiles = makeTiles(s);
      assert.deepEqual(tiles.map((t) => t.text).sort(), s.words.slice().sort());
      const texts = tiles.map((t) => t.text);
      for (const o of orders(s)) assert.notDeepEqual(texts, o);
    }
  }
});

test('makeTiles: dviejų žodžių sakinys vis tiek sumaišomas', () => {
  const s = { words: ['aš', 'einu'], alts: [] };
  for (let k = 0; k < 20; k++) assert.deepEqual(makeTiles(s).map((t) => t.text), ['einu', 'aš']);
});

test('visi sakiniai išsprendžiami: sumaišyti, paskui sudėti teisingai', () => {
  for (const s of ALL) {
    const tiles = makeTiles(s);
    let slots = fill(s, tiles, s.words);
    assert.ok(isCorrect(textsOf(slots, tiles), s), s.words.join(' '));
    for (const alt of s.alts) {
      slots = fill(s, tiles, alt);
      assert.ok(isCorrect(textsOf(slots, tiles), s), alt.join(' '));
    }
  }
});

test('isCorrect: netinkama eilė ir neužpildyta eilė netinka', () => {
  assert.ok(isCorrect(['katė', 'geria', 'pieną'], S));
  assert.ok(isCorrect(['pieną', 'geria', 'katė'], S));
  assert.ok(!isCorrect(['geria', 'katė', 'pieną'], S));
  assert.ok(!isCorrect(['katė', null, 'pieną'], S));
});

test('positionCorrect: žymi teisingas vietas', () => {
  assert.deepEqual(positionCorrect(['katė', 'pieną', 'geria'], S), [true, false, false]);
  assert.deepEqual(positionCorrect(['pieną', 'katė', null], S), [true, false, false]);
  assert.deepEqual(positionCorrect([null, null, null], S), [false, false, false]);
});

test('place / remove / undo', () => {
  let slots = [null, null, null];
  slots = place(slots, 2);
  slots = place(slots, 0);
  assert.deepEqual(slots, [2, 0, null]);
  assert.equal(place(slots, 2), null, 'jau padėta');
  assert.deepEqual(remove(slots, 2), [null, 0, null]);
  assert.equal(remove(slots, 1), null);
  assert.equal(place([1, 2, 3], 0), null, 'nėra vietos');
  const r = undo(slots, [2, 0]);
  assert.deepEqual(r.slots, [2, null, null]);
  assert.deepEqual(r.history, [2]);
  assert.equal(undo([null, null, null], []), null);
  // užrakinta vieta neatšaukiama
  const r2 = undo([2, 0, null], [2, 0], new Set([1]));
  assert.deepEqual(r2.slots, [null, 0, null]);
});

test('keepCorrect: teisingos vietos lieka, kitos grįžta', () => {
  const tiles = [{ id: 0, text: 'katė' }, { id: 1, text: 'pieną' }, { id: 2, text: 'geria' }];
  const r = keepCorrect([0, 1, 2], tiles, S);
  assert.deepEqual(r.slots, [0, null, null]);
  assert.deepEqual([...r.kept], [0]);
  assert.deepEqual(r.returned.sort(), [1, 2]);
});

test('nextHint ir applyHint veda iki teisingo sakinio', () => {
  for (const s of ALL) {
    const tiles = makeTiles(s);
    let slots = new Array(tiles.length).fill(null);
    for (let k = 0; k < tiles.length + 1; k++) {
      const hint = nextHint(slots, tiles, s);
      if (!hint) break;
      slots = applyHint(slots, hint);
    }
    assert.ok(isCorrect(textsOf(slots, tiles), s), s.words.join(' '));
  }
});

test('nextHint: ištaiso neteisingai padėtą žodį', () => {
  const tiles = [{ id: 0, text: 'pieną' }, { id: 1, text: 'katė' }, { id: 2, text: 'geria' }];
  const slots = [2, 1, 0];
  const hint = nextHint(slots, tiles, { words: ['katė', 'geria', 'pieną'], alts: [] });
  assert.deepEqual(hint, { index: 0, id: 1, text: 'katė' });
  assert.equal(nextHint([1, 2, 0], tiles, { words: ['katė', 'geria', 'pieną'], alts: [] }), null);
});

test('display: didžioji raidė ir taškas', () => {
  assert.equal(display(['šuo', 'loja']), 'Šuo loja.');
});

test('pickSentences: 6 sakiniai, žodžių skaičius auga', () => {
  for (let k = 0; k < 30; k++) {
    const p = pickSentences();
    assert.equal(p.length, 6);
    assert.equal(new Set(p.map((s) => s.words.join(' '))).size, 6);
    assert.ok(p.slice(0, 2).every((s) => s.words.length === 3));
    assert.ok(p.slice(2, 4).every((s) => s.words.length === 4));
    assert.ok(p.slice(4).every((s) => s.words.length >= 5 && s.words.length <= 6));
  }
});
