// Kryžiažodis: pasirinkite langelį ir paspauskite tinkamą raidę iš keturių variantų.

import { h, createFeedback, progressBar, finishView, makeLock, nextGood, nextTry } from '../ui.js';
import { CROSSWORDS, describeWord } from '../data/crosswords.js';
import { buildGrid } from '../lib/crosswordCheck.js';
import { shuffle } from '../lib/random.js';
import { familyOf } from '../data/words.js';

const EXTRA_LETTERS = 'aeiostrklnmdvbpg'.split('');

export function mount(root, ctx) {
  const lock = makeLock();
  let puzzleIdx = 0;

  function showPuzzle() {
    const def = CROSSWORDS[puzzleIdx];
    const { cells: letterMap } = buildGrid(def);
    const coords = [...letterMap.keys()].map((k) => k.split(',').map(Number));
    const rows = Math.max(...coords.map((p) => p[0])) + 1;
    const cols = Math.max(...coords.map((p) => p[1])) + 1;

    const words = def.map((w, idx) => {
      const chars = Array.from(w.answer);
      const keys = chars.map((_, k) => `${w.row + (w.dir === 'D' ? k : 0)},${w.col + (w.dir === 'A' ? k : 0)}`);
      return { ...w, idx, chars, keys, ...describeWord(w.answer) };
    });

    // Numeravimas pagal skaitymo tvarką.
    const startNumber = new Map();
    let counter = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (words.some((w) => w.row === r && w.col === c)) startNumber.set(`${r},${c}`, ++counter);
      }
    }
    words.forEach((w) => { w.num = startNumber.get(`${w.row},${w.col}`); });

    const cellWords = new Map();
    for (const w of words) for (const k of w.keys) cellWords.set(k, [...(cellWords.get(k) || []), w.idx]);

    const filled = new Set();
    const doneWords = new Set();
    const tried = new Map();
    const optCache = new Map();
    let active = 0;
    let sel = null;
    let hintKey = null;
    let solved = false;

    const pool = [...new Set([...words.flatMap((w) => w.chars), ...EXTRA_LETTERS])];
    function optionsFor(key) {
      if (!optCache.has(key)) {
        const ch = letterMap.get(key);
        const fam = familyOf(ch);
        const wrong = shuffle(pool.filter((x) => familyOf(x) !== fam)).slice(0, 3);
        optCache.set(key, shuffle([ch, ...wrong]));
      }
      return optCache.get(key);
    }

    const feedback = createFeedback();
    const area = h('div', { class: 'cw-area' });
    const panel = h('div', { class: 'cw-panel' });
    let started = false;
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      puzzleIdx === CROSSWORDS.length - 1 ? 'Baigti ✓' : 'Toliau →');
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');

    nextBtn.addEventListener('click', () => {
      if (lock.locked) return;
      lock.lock();
      puzzleIdx += 1;
      if (puzzleIdx >= CROSSWORDS.length) finish();
      else showPuzzle();
    });

    function firstEmpty(w) {
      return w.keys.find((k) => !filled.has(k)) ?? null;
    }

    function advance() {
      const order = [active, ...words.map((w) => w.idx).filter((i) => i !== active)];
      for (const i of order) {
        const k = firstEmpty(words[i]);
        if (k) { active = i; sel = k; return; }
      }
      sel = null;
    }

    function selectCell(key) {
      const here = cellWords.get(key);
      if (filled.has(key)) {
        // Užpildytą langelį spustelėjus pereiname prie kito jame esančio žodžio.
        if (here.length > 1 && here.includes(active)) active = here.find((i) => i !== active);
        else active = here[0];
        sel = firstEmpty(words[active]);
      } else {
        if (!here.includes(active)) active = here[0];
        sel = key;
      }
      hintKey = null;
      render();
    }

    function selectWord(idx) {
      active = idx;
      sel = firstEmpty(words[idx]);
      hintKey = null;
      render();
    }

    function chooseLetter(letter) {
      if (solved || sel == null || lock.locked) return;
      const key = sel;
      const correct = letterMap.get(key);
      if (letter === correct) {
        filled.add(key);
        hintKey = null;
        const justDone = words.filter((w) => !doneWords.has(w.idx) && w.keys.every((k) => filled.has(k)));
        justDone.forEach((w) => doneWords.add(w.idx));
        if (filled.size === letterMap.size) {
          solved = true;
          sel = null;
          feedback.show('good', 'Puiku! Kryžiažodis išspręstas.', justDone.length ? `Paskutinis žodis: ${justDone[0].answer.toUpperCase()}.` : undefined);
          hintBtn.hidden = true;
          nextBtn.hidden = false;
        } else if (justDone.length) {
          feedback.show('good', 'Žodis surastas!', justDone.map((w) => w.answer.toUpperCase()).join(', '));
          advance();
        } else {
          feedback.show('good', nextGood());
          advance();
        }
        render();
        if (solved) nextBtn.focus({ preventScroll: true });
      } else {
        const set = tried.get(key) || new Set();
        set.add(letter);
        tried.set(key, set);
        if (set.size >= 2) {
          hintKey = key;
          feedback.show('try', 'Nieko tokio!', 'Pažiūrėkite į pažymėtą raidę.');
        } else {
          feedback.show('try', nextTry());
        }
        render();
      }
    }

    hintBtn.addEventListener('click', () => {
      if (solved || lock.locked) return;
      if (sel == null) advance();
      hintKey = sel;
      feedback.show('hint', 'Užuomina:', 'tinka pažymėta raidė.');
      render();
    });

    function render() {
      const activeKeys = new Set(words[active].keys);
      const grid = h('div', {
        class: 'cw-grid',
        style: `grid-template-columns: repeat(${cols}, auto)`,
        role: 'group',
        'aria-label': 'Kryžiažodžio tinklelis',
      });
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const key = `${r},${c}`;
          if (!letterMap.has(key)) {
            grid.append(h('div', { class: 'cw-cell void' }));
            continue;
          }
          const isFilled = filled.has(key);
          const cls = ['cw-cell'];
          if (activeKeys.has(key)) cls.push('inword');
          if (isFilled) cls.push('filled');
          if (key === sel) cls.push('sel');
          const btn = h('button', {
            class: cls.join(' '),
            type: 'button',
            'aria-label': isFilled ? `Raidė ${letterMap.get(key)}` : 'Tuščias langelis',
          },
          startNumber.has(key) ? h('span', { class: 'num' }, String(startNumber.get(key))) : null,
          isFilled ? letterMap.get(key).toUpperCase() : '');
          btn.addEventListener('click', () => selectCell(key));
          grid.append(btn);
        }
      }

      const clueList = (dir, heading) => {
        const list = words.filter((w) => w.dir === dir).sort((a, b) => a.num - b.num);
        if (!list.length) return null;
        return h('div', {},
          h('h2', {}, heading),
          h('ul', {}, list.map((w) => {
            const cls = ['clue-btn'];
            if (w.idx === active) cls.push('active');
            if (doneWords.has(w.idx)) cls.push('done');
            const b = h('button', { class: cls.join(' '), type: 'button' },
              h('span', { class: 'clue-emoji', 'aria-hidden': 'true' }, doneWords.has(w.idx) ? '✅' : w.emoji),
              h('span', {},
                `${w.num}. ${w.clue}`,
                h('span', { class: 'clue-meta' }, doneWords.has(w.idx) ? w.answer.toUpperCase() : `${w.chars.length} raidės`),
              ),
            );
            b.addEventListener('click', () => selectWord(w.idx));
            return h('li', {}, b);
          })),
        );
      };

      // Raidžių skydelis yra apatinėje juostoje (.dock); perpiešiame tik jo vidų.
      // Vaikų sąrašas be null: replaceChildren(null) įrašytų žodį „null“.
      let panelKids = [];
      if (solved) {
        panelKids = [];
      } else if (sel != null) {
        const w = words[active];
        const correct = letterMap.get(sel);
        const tr = tried.get(sel) || new Set();
        panelKids = [
          h('p', { class: 'cw-letter-help' }, `${w.emoji} ${w.clue}`),
          h('p', { class: 'cw-letter-help' }, 'Kokia raidė pažymėtame langelyje?'),
          h('div', { class: 'options letters', role: 'group', 'aria-label': 'Raidžių variantai' },
            optionsFor(sel).map((ch) => {
              const cls = ['opt'];
              if (tr.has(ch)) cls.push('tried');
              if (hintKey === sel && ch === correct) cls.push('hint');
              const b = h('button', { class: cls.join(' '), type: 'button', disabled: tr.has(ch) }, ch.toUpperCase());
              b.addEventListener('click', () => chooseLetter(ch));
              return b;
            }),
          ),
        ];
      } else {
        panelKids = [h('p', { class: 'cw-letter-help' }, 'Pasirinkite tuščią langelį arba aprašymą.')];
      }

      area.replaceChildren(
        h('div', { class: 'cw-layout' },
          grid,
          h('div', { class: 'cw-clues' }, clueList('A', '→ Iš kairės į dešinę'), clueList('D', '↓ Iš viršaus į apačią')),
        ),
      );
      panel.replaceChildren(...panelKids.filter(Boolean));

      // Pasirinktas langelis neturi likti po apatine juosta.
      const selCell = grid.querySelector('.cw-cell.sel');
      if (selCell && started) selCell.scrollIntoView({ block: 'nearest' });
      started = true;
    }

    advance();
    root.replaceChildren(
      h('section', { class: 'game cw-game' },
        h('h1', { class: 'game-title' }, 'Kryžiažodis'),
        progressBar(puzzleIdx, CROSSWORDS.length, 'Kryžiažodis'),
        h('p', { class: 'instruction' }, 'Spustelėkite žodžio aprašymą arba langelį, tada pasirinkite raidę.'),
        area,
        h('div', { class: 'dock' },
          panel,
          feedback.el,
          h('div', { class: 'actions' }, hintBtn, h('span', { class: 'spacer' }), nextBtn),
        ),
      ),
    );
    render();
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visi kryžiažodžiai išspręsti. Puikus darbas!',
      onAgain: () => { lock.lock(); puzzleIdx = 0; showPuzzle(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  showPuzzle();
}
