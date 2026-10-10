// „Sudėkite sakinį“ turinys: kiekiai, žodžių skaičius, pasikartojimai, raidės.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORD_ORDER } from '../js/data/wordOrder.js';
import { ALPHABET } from '../js/data/words.js';

const letters = new Set(ALPHABET);
const ALL = [...WORD_ORDER.easy, ...WORD_ORDER.medium, ...WORD_ORDER.hard];
const key = (w) => [...w].sort().join(' ');

test('kiekiai: bent po 20 sakinių kiekvienoje pakopoje', () => {
  assert.ok(WORD_ORDER.easy.length >= 20);
  assert.ok(WORD_ORDER.medium.length >= 20);
  assert.ok(WORD_ORDER.hard.length >= 20);
  assert.ok(ALL.length >= 60);
});

test('žodžių skaičius: 3, 4, 5-6', () => {
  for (const s of WORD_ORDER.easy) assert.equal(s.words.length, 3, s.words.join(' '));
  for (const s of WORD_ORDER.medium) assert.equal(s.words.length, 4, s.words.join(' '));
  for (const s of WORD_ORDER.hard) assert.ok(s.words.length >= 5 && s.words.length <= 6, s.words.join(' '));
});

test('sakiniai nesikartoja ir nesikartoja žodžiai viename sakinyje', () => {
  const texts = ALL.map((s) => s.words.join(' '));
  assert.equal(new Set(texts).size, texts.length);
  for (const s of ALL) assert.equal(new Set(s.words).size, s.words.length, `kartojasi žodis: ${s.words.join(' ')}`);
});

test('pakaitalai: tie patys žodžiai, kita eilė, be pasikartojimų', () => {
  for (const s of ALL) {
    const seen = new Set([s.words.join(' ')]);
    for (const a of s.alts) {
      assert.equal(key(a), key(s.words), `kiti žodžiai: ${a.join(' ')}`);
      assert.ok(!seen.has(a.join(' ')), `kartojasi: ${a.join(' ')}`);
      seen.add(a.join(' '));
    }
  }
});

test('higiena: NFC, mažosios lietuviškos raidės, be tarpų ir ženklų', () => {
  for (const s of ALL) {
    for (const order of [s.words, ...s.alts]) {
      for (const w of order) {
        assert.equal(w, w.normalize('NFC'));
        assert.ok(w.length > 0 && w === w.trim(), `tuščias ar su tarpu: "${w}"`);
        assert.ok(Array.from(w).every((ch) => letters.has(ch)), `netinkamos raidės: ${w}`);
      }
    }
  }
});
