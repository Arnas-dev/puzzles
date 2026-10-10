// Kryžiažodžių turinio tikrinimas: kiekis, kartojimasis, užuominų taisyklės, žaidimo pasirinkimai.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { CROSSWORDS, describeWord } from '../js/data/crosswords.js';
import { validateLayout } from '../js/lib/crosswordCheck.js';
import { WORDS, familyOf } from '../js/data/words.js';

const letters = (s) => Array.from(s);
const wordsOf = (cw) => cw.map((w) => w.answer);

test('kryžiažodžių yra bent 25, pirmieji 4 nepakito', () => {
  assert.ok(CROSSWORDS.length >= 25, `yra tik ${CROSSWORDS.length}`);
  const first = CROSSWORDS.slice(0, 4).map((cw) => wordsOf(cw).join(','));
  assert.deepEqual(first, [
    'ledai,pelė,uoga',
    'namas,katė,kava,tėtis',
    'durys,batai,duona,sūris',
    'tortas,grybas,arklys,raktas',
  ]);
});

test('kiekvienas kryžiažodis tinkamas ir telpa į 6x6', () => {
  CROSSWORDS.forEach((cw, i) => {
    const res = validateLayout(cw);
    assert.ok(res.ok, `kryžiažodis ${i + 1}: ${res.errors.join('; ')}`);
    assert.equal(res.minR, 0, `kryžiažodis ${i + 1}: neprasideda nuo 0 eilutės`);
    assert.equal(res.minC, 0, `kryžiažodis ${i + 1}: neprasideda nuo 0 stulpelio`);
    assert.ok(res.rows <= 6 && res.cols <= 6, `kryžiažodis ${i + 1}: ${res.rows}x${res.cols}`);
    assert.ok(cw.length >= 2 && cw.length <= 4, `kryžiažodis ${i + 1}: ${cw.length} žodžiai`);
    assert.equal(new Set(wordsOf(cw)).size, cw.length, `kryžiažodis ${i + 1}: kartojasi žodis`);
  });
});

test('nėra dviejų kryžiažodžių su tais pačiais atsakymais; žodis kartojasi ne daugiau kaip 2 kartus', () => {
  const sets = new Set();
  const use = new Map();
  CROSSWORDS.forEach((cw, i) => {
    const key = wordsOf(cw).sort().join(',');
    assert.ok(!sets.has(key), `kryžiažodis ${i + 1} kartoja ankstesnį`);
    sets.add(key);
    for (const a of wordsOf(cw)) use.set(a, (use.get(a) || 0) + 1);
  });
  for (const [a, n] of use) assert.ok(n <= 2, `žodis „${a}“ kartojasi ${n} kartus`);
});

test('užuominos: 3-8 žodžių, be atsakymo ar jo šaknies, nesikartoja', () => {
  const seenClue = new Map();
  const all = new Set(CROSSWORDS.flatMap(wordsOf));
  for (const a of all) {
    const { clue, emoji } = describeWord(a);
    assert.ok(emoji, `nėra paveikslėlio: ${a}`);
    const toks = clue.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
    assert.ok(toks.length >= 3 && toks.length <= 8, `užuomina „${clue}“ (${a}): ${toks.length} žodžių`);
    assert.ok(clue.endsWith('.'), `užuomina be taško: ${a}`);
    assert.equal(clue, clue.normalize('NFC'));
    assert.ok(clue[0] === clue[0].toUpperCase(), `užuomina ne iš didžiosios: ${a}`);
    const stem = letters(a).slice(0, Math.max(3, letters(a).length - 2)).join('');
    for (const t of toks) assert.ok(!t.startsWith(stem), `užuomina „${clue}“ turi atsakymo šaknį „${stem}“`);
    assert.ok(!seenClue.has(clue), `ta pati užuomina: ${a} ir ${seenClue.get(clue)}`);
    seenClue.set(clue, a);
  }
});

test('užuomina neatskleidžia kito to paties kryžiažodžio žodžio (nėra to žodžio užuominoje)', () => {
  CROSSWORDS.forEach((cw, i) => {
    for (const w of cw) {
      const toks = describeWord(w.answer).clue.toLowerCase().split(/[^\p{L}]+/u);
      for (const o of cw) {
        if (o.answer === w.answer) continue;
        assert.ok(!toks.includes(o.answer), `kryžiažodis ${i + 1}: „${w.answer}“ užuomina turi „${o.answer}“`);
      }
    }
  });
});

test('žaidimo pasirinkimai: kiekvienai raidei yra bent 3 klaidinantys skirtingų šeimų variantai', () => {
  // Žaidimas imamas pool = atsakymų raidės + 'aeiostrklnmdvbpg'.
  const extra = 'aeiostrklnmdvbpg'.split('');
  for (const cw of CROSSWORDS) {
    const pool = [...new Set([...cw.flatMap((w) => letters(w.answer)), ...extra])];
    for (const w of cw) {
      for (const ch of letters(w.answer)) {
        const wrong = pool.filter((x) => familyOf(x) !== familyOf(ch));
        assert.ok(wrong.length >= 3, `${w.answer}: per mažai klaidinančių variantų raidei ${ch}`);
      }
    }
  }
});

test('visi atsakymai yra words.js žodžiai arba turi savo paveikslėlį', () => {
  const known = new Set(WORDS.map((x) => x.w));
  for (const a of new Set(CROSSWORDS.flatMap(wordsOf))) {
    assert.ok(known.has(a) || describeWord(a).emoji, `nežinomas žodis: ${a}`);
  }
});
