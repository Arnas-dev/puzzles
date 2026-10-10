import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, explainSort, makeStage, makeStages } from '../js/lib/basketsLogic.js';
import { CATEGORIES, AVOID_PAIRS } from '../js/data/categories.js';
import { WORD_BY_TEXT } from '../js/data/words.js';

test('explainSort', () => {
  assert.equal(explainSort('obuolys', 'vaisiai'), '„obuolys“ tinka į grupę „vaisiai“.');
});

test('visi kategorijų žodžiai turi paveikslėlį', () => {
  for (const c of CATEGORIES) {
    for (const w of c.words) assert.ok(WORD_BY_TEXT.get(w)?.e, `nėra paveikslėlio: ${w}`);
  }
});

test('makeStages: etapų dydžiai, grupės skirtingos, žodžiai tinka tik savo grupei', () => {
  for (let t = 0; t < 200; t++) {
    const stages = makeStages(CATEGORIES, AVOID_PAIRS);
    assert.equal(stages.length, STAGES.length);
    stages.forEach((st, i) => {
      assert.equal(st.groups.length, STAGES[i].groups);
      assert.equal(new Set(st.groups).size, st.groups.length);
      assert.equal(st.items.length, STAGES[i].groups * STAGES[i].perGroup);
      assert.equal(new Set(st.items.map((x) => x.word)).size, st.items.length);
      for (const [a, b] of AVOID_PAIRS) assert.ok(!(st.groups.includes(a) && st.groups.includes(b)));
      for (const it of st.items) {
        assert.ok(st.groups.includes(it.group));
        const fits = CATEGORIES.filter((c) => st.groups.includes(c.name) && c.words.includes(it.word));
        assert.equal(fits.length, 1, `žodis ${it.word} tinka ne vienai grupei`);
        assert.equal(fits[0].name, it.group);
      }
    });
  }
});

test('makeStage: nuspėjamas su pastoviu atsitiktinumu', () => {
  let s = 1;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const st = makeStage({ groups: 3, perGroup: 2 }, CATEGORIES, AVOID_PAIRS, [], rnd);
  assert.equal(st.items.length, 6);
});
