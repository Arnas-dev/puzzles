// Duomenų taisyklės: žodžiai, sakiniai, kategorijos, kryžiažodžiai.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { WORDS, WORD_BY_TEXT, ALPHABET, familyOf } from '../js/data/words.js';
import { COMPLETE_WORDS } from '../js/data/completeWords.js';
import { SENTENCES } from '../js/data/sentences.js';
import { CATEGORIES, AVOID_PAIRS } from '../js/data/categories.js';
import { CROSSWORDS, describeWord } from '../js/data/crosswords.js';
import { validateLayout } from '../js/lib/crosswordCheck.js';
import { fullSentence } from '../js/games/sentence.js';
import { makeRound } from '../js/games/oddOneOut.js';

test('WORDS: žodžiai nesikartoja, kiekvienas turi paveikslėlį', () => {
  assert.equal(new Set(WORDS.map((x) => x.w)).size, WORDS.length);
  for (const x of WORDS) assert.ok(x.e && x.g, `trūksta e/g: ${x.w}`);
});

test('completeWords: žodis yra WORDS, indeksas ribose', () => {
  for (const x of COMPLETE_WORDS) {
    const word = WORD_BY_TEXT.get(x.w);
    assert.ok(word, `nėra WORDS: ${x.w}`);
    assert.ok(word.e, `nėra paveikslėlio: ${x.w}`);
    assert.ok(Number.isInteger(x.i) && x.i >= 0 && x.i < Array.from(x.w).length, `indeksas: ${x.w}`);
  }
  assert.equal(new Set(COMPLETE_WORDS.map((x) => x.w)).size, COMPLETE_WORDS.length, 'kartojasi žodis');
});

test('completeWords: klaidingos raidės tinkamos', () => {
  const real = new Set([...WORD_BY_TEXT.keys(), ...SENTENCES.map((s) => s.answer)]);
  for (const x of COMPLETE_WORDS) {
    const chars = Array.from(x.w);
    const right = chars[x.i];
    assert.equal(x.wrong.length, 3, `${x.w}: turi būti 3 klaidingos`);
    assert.equal(new Set(x.wrong).size, 3, `${x.w}: klaidingos nesikartoja`);
    for (const l of x.wrong) {
      assert.equal(Array.from(l).length, 1, `${x.w}: ne viena raidė: ${l}`);
      assert.ok(ALPHABET.includes(l), `${x.w}: ne lietuviška raidė: ${l}`);
      assert.notEqual(l, right, `${x.w}: klaidinga raidė sutampa su teisinga`);
      assert.notEqual(familyOf(l), familyOf(right), `${x.w}: ${l} yra tos pačios šeimos kaip ${right}`);
      const swapped = chars.map((c, k) => (k === x.i ? l : c)).join('');
      assert.ok(!real.has(swapped), `${x.w}: pakeitus į ${l} gaunamas tikras žodis ${swapped}`);
    }
  }
});

test('sentences: teisingas atsakymas ir 2 klaidingi, be tuščių', () => {
  for (const s of SENTENCES) {
    const label = `${s.before} ... ${s.after}`;
    const options = [s.answer, ...s.wrong];
    assert.equal(s.wrong.length, 2, label);
    assert.equal(options.length, 3, label);
    assert.equal(new Set(options).size, 3, `${label}: variantai nesikartoja`);
    assert.ok(!s.wrong.includes(s.answer), label);
    for (const o of options) assert.ok(o.trim().length > 0 && o === o.trim(), `${label}: tuščias ar su tarpais`);
    assert.ok(s.before.trim().length > 0, label);
    assert.ok(s.after.trim().length > 0, label);
  }
});

test('sentences: fullSentence tarpai ir kabutės', () => {
  for (const s of SENTENCES) {
    const t = fullSentence(s);
    assert.ok(!/ {2}/.test(t), `dvigubas tarpas: ${t}`);
    assert.ok(!/ [.,!?“”]/.test(t), `tarpas prieš skyrybos ženklą: ${t}`);
    assert.ok(!/„ /.test(t), `tarpas po „: ${t}`);
    assert.ok(!/^ | $/.test(t), `tarpas pradžioje ar gale: ${t}`);
    assert.ok(/[.!?“”]$/.test(t), `nesibaigia skyrybos ženklu: ${t}`);
    const open = (t.match(/„/g) || []).length;
    const close = (t.match(/“/g) || []).length;
    assert.equal(open, close, `kabutės nesubalansuotos: ${t}`);
  }
  assert.equal(
    fullSentence({ before: 'Kai norime padėkoti, sakome „', answer: 'ačiū', after: '“.' }),
    'Kai norime padėkoti, sakome „ačiū“.',
  );
  assert.equal(fullSentence({ before: 'Šuo', answer: 'loja', after: 'kieme.' }), 'Šuo loja kieme.');
  assert.equal(fullSentence({ before: 'Aš skaitau', answer: 'knygą', after: '.' }), 'Aš skaitau knygą.');
});

test('categories: žodžiai yra WORDS, nesikartoja tarp kategorijų, bent 3 kiekvienoje', () => {
  const seen = new Map();
  for (const c of CATEGORIES) {
    assert.ok(c.words.length >= 3, `${c.name}: per mažai žodžių`);
    assert.equal(new Set(c.words).size, c.words.length, `${c.name}: žodis kartojasi`);
    for (const w of c.words) {
      assert.ok(WORD_BY_TEXT.has(w), `${c.name}: nėra WORDS: ${w}`);
      assert.ok(!seen.has(w), `${w} yra ir „${seen.get(w)}“, ir „${c.name}“`);
      seen.set(w, c.name);
    }
  }
  const names = CATEGORIES.map((c) => c.name);
  for (const [a, b] of AVOID_PAIRS) {
    assert.ok(names.includes(a) && names.includes(b), `AVOID_PAIRS nežinoma kategorija: ${a}, ${b}`);
  }
});

test('oddOneOut: makeRound 500 kartų', () => {
  const catOf = (w) => CATEGORIES.find((c) => c.words.includes(w))?.name;
  const avoided = (a, b) => AVOID_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  for (let n = 0; n < 500; n++) {
    const r = makeRound();
    assert.equal(r.three.length, 3);
    assert.equal(new Set(r.three).size, 3);
    for (const w of r.three) assert.equal(catOf(w), r.category);
    const oddCat = catOf(r.odd);
    assert.ok(oddCat, `nežinomas netinkamas žodis ${r.odd}`);
    assert.notEqual(oddCat, r.category);
    assert.ok(!avoided(oddCat, r.category), `vengiama pora: ${oddCat} / ${r.category}`);
    assert.ok(!r.three.includes(r.odd));
  }
});

test('crosswords: išdėstymai tinkami', () => {
  assert.ok(CROSSWORDS.length > 0);
  CROSSWORDS.forEach((cw, i) => {
    const res = validateLayout(cw);
    assert.ok(res.ok, `kryžiažodis ${i}: ${res.errors.join('; ')}`);
    const answers = cw.map((w) => w.answer);
    assert.equal(new Set(answers).size, answers.length, `kryžiažodis ${i}: kartojasi atsakymas`);
    for (const a of answers) {
      const d = describeWord(a);
      assert.ok(d.clue && d.clue.trim().length > 0, `nėra užuominos: ${a}`);
      assert.ok(d.emoji && d.emoji.length > 0, `nėra paveikslėlio: ${a}`);
    }
  });
});

test('crosswords: validateLayout pagauna blogą išdėstymą', () => {
  assert.equal(validateLayout([]).ok, false);
  const bad = validateLayout([
    { answer: 'namas', row: 0, col: 0, dir: 'A' },
    { answer: 'katė', row: 0, col: 1, dir: 'D' },
  ]);
  assert.equal(bad.ok, false);
});
