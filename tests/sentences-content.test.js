// „Trūkstamas žodis“: turinio kiekis ir paprastumas (trumpi, aiškūs sakiniai).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SENTENCES } from '../js/data/sentences.js';
import { fullSentence, buildRounds } from '../js/games/sentence.js';

const wordCount = (s) => fullSentence(s).split(/\s+/).length;

test('sentences: bent 120 sakinių', () => {
  assert.ok(SENTENCES.length >= 120, `sakinių: ${SENTENCES.length}`);
});

test('sentences: kiekvienas sakinys 3-8 žodžių, be dublikatų', () => {
  const seen = new Set();
  for (const s of SENTENCES) {
    const t = fullSentence(s);
    const n = wordCount(s);
    assert.ok(n >= 3 && n <= 8, `${n} žodžių: ${t}`);
    assert.ok(!seen.has(t), `kartojasi sakinys: ${t}`);
    seen.add(t);
  }
});

test('sentences: klaidingas variantas nėra kito to paties sakinio teisingas atsakymas', () => {
  for (const s of SENTENCES) {
    for (const o of SENTENCES) {
      if (o === s || o.before !== s.before || o.after !== s.after) continue;
      assert.ok(!s.wrong.includes(o.answer), `abejotinas: ${fullSentence(s)}`);
    }
  }
});

test('sentences: 1000 sesijų turi 6 skirtingus sakinius su teisingu atsakymu tarp variantų', () => {
  for (let n = 0; n < 1000; n++) {
    const rounds = buildRounds();
    assert.equal(rounds.length, 6);
    assert.equal(new Set(rounds.map((r) => r.explain)).size, 6);
    for (const r of rounds) {
      const labels = r.options.map((o) => o.label);
      assert.equal(new Set(labels).size, labels.length);
      assert.ok(labels.includes(r.correct));
    }
  }
});
