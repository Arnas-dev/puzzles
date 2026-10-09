// Lietuviško teksto tvarka: NFC, tik lietuviškos raidės, jokių brūkšnių.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { WORDS, ALPHABET } from '../js/data/words.js';
import { COMPLETE_WORDS } from '../js/data/completeWords.js';
import { SENTENCES } from '../js/data/sentences.js';
import { CATEGORIES, AVOID_PAIRS } from '../js/data/categories.js';
import { CLUES, EXTRA } from '../js/data/clues.js';
import { CROSSWORDS } from '../js/data/crosswords.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const letters = new Set(ALPHABET);
const onlyLithuanian = (s) => s.length > 0 && Array.from(s).every((ch) => letters.has(ch));

function* strings(v) {
  if (typeof v === 'string') yield v;
  else if (Array.isArray(v)) for (const x of v) yield* strings(x);
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) { yield k; yield* strings(x); }
  }
}

function* files(dir, ext) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p, ext);
    else if (ext.some((e) => name.endsWith(e))) yield p;
  }
}

test('abėcėlę sudaro 32 skirtingos raidės', () => {
  assert.equal(ALPHABET.length, 32);
  assert.equal(new Set(ALPHABET).size, 32);
});

test('visi duomenų failų tekstai yra NFC', () => {
  const sets = { WORDS, COMPLETE_WORDS, SENTENCES, CATEGORIES, AVOID_PAIRS, CLUES, EXTRA, CROSSWORDS };
  for (const [name, data] of Object.entries(sets)) {
    for (const s of strings(data)) {
      assert.equal(s, s.normalize('NFC'), `${name}: ne NFC: ${JSON.stringify(s)}`);
    }
  }
});

test('visi js/ ir index.html failai yra NFC', () => {
  const list = [...files(join(root, 'js'), ['.js']), join(root, 'index.html')];
  for (const f of list) {
    const text = readFileSync(f, 'utf8');
    assert.equal(text, text.normalize('NFC'), `ne NFC: ${f}`);
  }
});

test('WORDS žodžiai turi tik lietuviškas raides', () => {
  for (const x of WORDS) assert.ok(onlyLithuanian(x.w), `WORDS: ${x.w}`);
});

test('COMPLETE_WORDS žodžiai ir klaidingos raidės: tik lietuviškos raidės', () => {
  for (const x of COMPLETE_WORDS) {
    assert.ok(onlyLithuanian(x.w), `COMPLETE_WORDS: ${x.w}`);
    for (const l of x.wrong) assert.ok(onlyLithuanian(l), `COMPLETE_WORDS ${x.w}: ${l}`);
  }
});

test('CLUES ir EXTRA raktai turi tik lietuviškas raides', () => {
  for (const k of [...Object.keys(CLUES), ...Object.keys(EXTRA)]) assert.ok(onlyLithuanian(k), `raktas: ${k}`);
});

test('kryžiažodžių atsakymai turi tik lietuviškas raides', () => {
  for (const cw of CROSSWORDS) for (const w of cw) assert.ok(onlyLithuanian(w.answer), `kryžiažodis: ${w.answer}`);
});

test('kategorijų žodžiai turi tik lietuviškas raides', () => {
  for (const c of CATEGORIES) for (const w of c.words) assert.ok(onlyLithuanian(w), `kategorija ${c.name}: ${w}`);
});

test('sakinių atsakymai ir klaidingi variantai neturi neįprastų simbolių', () => {
  const ok = /^[\p{L} ]+$/u;
  for (const s of SENTENCES) {
    for (const w of [s.answer, ...s.wrong]) assert.match(w, ok, `sakinys: ${w}`);
  }
});

test('nėra ilgojo ar vidutinio brūkšnio (— –) js/ ir index.html', () => {
  const list = [...files(join(root, 'js'), ['.js']), join(root, 'index.html')];
  for (const f of list) {
    const text = readFileSync(f, 'utf8');
    assert.ok(!/[–—]/.test(text), `rastas brūkšnys: ${f}`);
  }
});
