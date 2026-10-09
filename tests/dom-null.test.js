// Klaidos prevencija: replaceChildren / append su null ar undefined į puslapį įrašo žodį „null“.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function jsFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? jsFiles(p) : p.endsWith('.js') ? [p] : [];
  });
}

// Randa `.replaceChildren(` ar `.append(` kvietimus, kurių argumentuose yra trinaris `? ... : null`
// ir nėra `...` išskleidimo su `.filter(`. Tai paprasta, bet pagauna tipišką klaidą.
test('replaceChildren / append negauna null argumentų', () => {
  const bad = [];
  for (const file of jsFiles('js')) {
    const src = readFileSync(file, 'utf8');
    const re = /\.(replaceChildren|append)\(/g;
    let m;
    while ((m = re.exec(src))) {
      let depth = 1;
      let i = re.lastIndex;
      while (i < src.length && depth > 0) {
        if (src[i] === '(') depth++;
        else if (src[i] === ')') depth--;
        i++;
      }
      const call = src.slice(re.lastIndex, i - 1);
      const hasNullBranch = /:\s*null\b/.test(call) || /\?\s*null\b/.test(call);
      const filtered = /\.filter\(/.test(call) || /\bkids\b/.test(call);
      // js/main.js: null yra tik h(...) viduje, o h() tuščius vaikus praleidžia.
      const allowed = file.replace(/\\/g, '/') === 'js/main.js';
      if (hasNullBranch && !filtered && !allowed) bad.push(`${file}: ${call.slice(0, 60).replace(/\s+/g, ' ')}...`);
    }
  }
  assert.deepEqual(bad, []);
});
