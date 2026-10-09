// Ieško kryžiažodžių išdėstymų iš žodžių, turinčių užuominas (data/clues.js).
// Naudojimas: node tools/find-crosswords.mjs [HV2|H2V2] [kiek]
import { CLUES, EXTRA } from '../js/data/clues.js';
import { validateLayout } from '../js/lib/crosswordCheck.js';

const type = process.argv[2] || 'H2V2';
const limit = Number(process.argv[3] || 60);
const N = 6;

const words = [...Object.keys(CLUES), ...Object.keys(EXTRA)]
  .map((w) => w.normalize('NFC'))
  .filter((w) => Array.from(w).length >= 3 && Array.from(w).length <= 6);

const letters = (w) => Array.from(w);

const H = [];
const V = [];
for (const w of words) {
  const L = letters(w).length;
  for (let r = 0; r < N; r++) for (let c = 0; c + L <= N; c++) H.push({ w, r, c, dir: 'A' });
  for (let c = 0; c < N; c++) for (let r = 0; r + L <= N; r++) V.push({ w, r, c, dir: 'D' });
}

function cross(h, v) {
  const lh = letters(h.w);
  const lv = letters(v.w);
  if (v.c < h.c || v.c >= h.c + lh.length) return false;
  if (h.r < v.r || h.r >= v.r + lv.length) return false;
  return lh[v.c - h.c] === lv[h.r - v.r];
}

const crossH = new Map(V.map((v, i) => [i, H.filter((h) => cross(h, v))]));

const out = [];
const seen = new Set();
function record(placed) {
  const ws = placed.map((p) => p.w).sort().join(',');
  if (new Set(placed.map((p) => p.w)).size !== placed.length) return;
  if (seen.has(ws)) return;
  const res = validateLayout(placed.map((p) => ({ answer: p.w, row: p.r, col: p.c, dir: p.dir })));
  if (!res.ok) return;
  seen.add(ws);
  out.push({ ws, placed, rows: res.rows, cols: res.cols });
}

for (let i = 0; i < V.length; i++) {
  for (let j = i + 1; j < V.length; j++) {
    const v1 = V[i];
    const v2 = V[j];
    if (v2.c < v1.c + 2) continue;
    const a = crossH.get(i);
    const b = new Set(crossH.get(j));
    const common = a.filter((h) => b.has(h));
    if (type === 'HV2') {
      for (const h of common) record([h, v1, v2]);
    } else {
      for (let x = 0; x < common.length; x++) {
        for (let y = x + 1; y < common.length; y++) {
          const h1 = common[x];
          const h2 = common[y];
          if (Math.abs(h1.r - h2.r) < 2) continue;
          record([h1, h2, v1, v2]);
        }
      }
    }
  }
}

// Mažesni išdėstymai pirmi; žodžių ilgis 4-6 geriau už 3.
out.sort((p, q) => (p.rows * p.cols) - (q.rows * q.cols));
console.log(`${out.length} išdėstymų (${type})`);
const shuffled = out.map((o) => [Math.random(), o]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).slice(0, limit);
for (const o of shuffled) {
  console.log(`${o.rows}x${o.cols}: ` + o.placed.map((p) => `${p.w}@${p.dir}${p.r},${p.c}`).join('  '));
}
