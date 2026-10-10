import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORDS } from '../js/data/words.js';
import { dealPairs, isMatch, hintPair, allMatched, MAX_WORD_LENGTH } from '../js/lib/memoryLogic.js';

test('dealPairs: 2n kortelių, kiekviena pora turi paveikslėlį ir žodį, be pasikartojimų', () => {
  for (const n of [3, 4, 6]) {
    for (let t = 0; t < 50; t++) {
      const cards = dealPairs(WORDS, n);
      assert.equal(cards.length, 2 * n);
      assert.equal(new Set(cards.map((c) => c.id)).size, 2 * n);
      const pairs = new Set(cards.map((c) => c.pair));
      assert.equal(pairs.size, n);
      assert.equal(new Set(cards.filter((c) => c.kind === 'pic').map((c) => c.text)).size, n);
      for (const p of pairs) {
        const kinds = cards.filter((c) => c.pair === p).map((c) => c.kind).sort();
        assert.deepEqual(kinds, ['pic', 'word']);
      }
      for (const c of cards) if (c.kind === 'word') assert.ok(c.text.length <= MAX_WORD_LENGTH);
    }
  }
});

test('dealPairs: pavaizduoja tą patį žodį ir paveikslėlį iš WORDS', () => {
  const cards = dealPairs(WORDS, 6);
  for (const c of cards.filter((x) => x.kind === 'pic')) {
    const w = WORDS.find((x) => x.w === c.pair);
    assert.equal(w.e, c.text);
  }
});

test('dealPairs: per mažai žodžių -> klaida', () => {
  assert.throws(() => dealPairs(WORDS.slice(0, 2), 3));
});

test('isMatch: tik paveikslėlis ir to paties žodžio kortelė', () => {
  const cards = dealPairs(WORDS, 3);
  const pic = cards.find((c) => c.kind === 'pic');
  const word = cards.find((c) => c.kind === 'word' && c.pair === pic.pair);
  const otherWord = cards.find((c) => c.kind === 'word' && c.pair !== pic.pair);
  const otherPic = cards.find((c) => c.kind === 'pic' && c.pair !== pic.pair);
  assert.ok(isMatch(pic, word));
  assert.ok(isMatch(word, pic));
  assert.ok(!isMatch(pic, otherWord));
  assert.ok(!isMatch(pic, otherPic));
  assert.ok(!isMatch(pic, pic));
});

test('hintPair: grąžina tikrą porą, atsižvelgia į atversta kortelę ir rastas poras', () => {
  const cards = dealPairs(WORDS, 4);
  const matched = new Set();
  const [a, b] = hintPair(cards, matched);
  const ca = cards.find((c) => c.id === a);
  const cb = cards.find((c) => c.id === b);
  assert.ok(isMatch(ca, cb));
  // atversta kortelė: užuomina apie jos porą
  const open = cards.find((c) => c.id !== a && c.id !== b);
  const hint = hintPair(cards, matched, [open.id]);
  assert.ok(hint.includes(open.id));
  assert.ok(isMatch(...hint.map((id) => cards.find((c) => c.id === id))));
  // rastos poros neminimos
  for (const c of cards) if (c.pair === ca.pair) matched.add(c.id);
  const h2 = hintPair(cards, matched);
  assert.ok(!h2.includes(a) && !h2.includes(b));
  for (const c of cards) matched.add(c.id);
  assert.equal(hintPair(cards, matched), null);
  assert.ok(allMatched(cards, matched));
  assert.ok(!allMatched(cards, new Set()));
});
