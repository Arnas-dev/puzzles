// Mažasis sudoku 4×4: kiekviename stulpelyje, eilutėje ir kvadrate skaičiai nuo 1 iki 4 turi būti po vieną kartą.

import { h, createFeedback, progressBar, finishView, makeLock, nextGood, nextTry } from '../ui.js';
import { makePuzzle, conflicts, isSolved, rowOf, colOf } from '../lib/sudokuLogic.js';

const LEVELS = [5, 7, 9]; // tuščių langelių skaičius

export function mount(root, ctx) {
  const lock = makeLock();
  let level = 0;

  function showLevel() {
    const { puzzle, solution } = makePuzzle(LEVELS[level]);
    const grid = puzzle.slice();
    const given = new Set(puzzle.map((v, i) => (v ? i : -1)).filter((i) => i >= 0));
    const hinted = new Set();
    const wrongAt = new Map(); // langelis -> klaidų skaičius
    let sel = grid.indexOf(0);
    let flash = []; // langeliai, kurie trumpai paryškinami dėl pasikartojančio skaičiaus
    let hintNumber = null;
    let solved = false;

    const feedback = createFeedback();
    const area = h('div', { class: 'sd-area' });
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      level === LEVELS.length - 1 ? 'Baigti ✓' : 'Toliau →');
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');

    function selectNextEmpty(from) {
      for (let k = 1; k <= 16; k++) {
        const i = (from + k) % 16;
        if (grid[i] === 0) return i;
      }
      return -1;
    }

    function place(i, v, viaHint = false) {
      grid[i] = v;
      if (viaHint) hinted.add(i);
      flash = [];
      hintNumber = null;
      if (isSolved(grid)) {
        solved = true;
        sel = -1;
        feedback.show('good', nextGood(), 'Sudoku išspręstas.');
        hintBtn.hidden = true;
        nextBtn.hidden = false;
        render();
        nextBtn.focus({ preventScroll: true });
        return;
      }
      sel = selectNextEmpty(i);
      render();
    }

    function chooseNumber(v) {
      if (solved || sel < 0 || lock.locked) return;
      if (solution[sel] === v) {
        feedback.show('good', nextGood());
        place(sel, v);
        return;
      }
      // Netinka: paaiškiname, kodėl.
      const c = conflicts(grid, sel, v);
      const n = (wrongAt.get(sel) || 0) + 1;
      wrongAt.set(sel, n);
      let explain = 'Čia reikia kito skaičiaus.';
      flash = [];
      if (c.row.length) { explain = `Skaičius ${v} jau yra šioje eilutėje.`; flash = c.row; }
      else if (c.col.length) { explain = `Skaičius ${v} jau yra šiame stulpelyje.`; flash = c.col; }
      else if (c.box.length) { explain = `Skaičius ${v} jau yra šiame kvadrate.`; flash = c.box; }
      if (n >= 2) {
        hintNumber = solution[sel];
        feedback.show('try', 'Nieko tokio!', 'Pažiūrėkite į pažymėtą skaičių.');
      } else {
        feedback.show('try', nextTry(), explain);
      }
      render();
    }

    hintBtn.addEventListener('click', () => {
      if (solved || lock.locked) return;
      if (sel < 0) sel = grid.indexOf(0);
      if (sel < 0) return;
      const i = sel;
      feedback.show('hint', 'Užuomina:', `čia tinka skaičius ${solution[i]}.`);
      place(i, solution[i], true);
    });

    nextBtn.addEventListener('click', () => {
      if (lock.locked) return;
      lock.lock();
      level += 1;
      if (level >= LEVELS.length) finish();
      else showLevel();
    });

    function render() {
      const board = h('div', { class: 'sudoku', role: 'group', 'aria-label': 'Sudoku lenta' },
        grid.map((v, i) => {
          const cls = ['sd-cell'];
          if (given.has(i)) cls.push('given');
          if (hinted.has(i)) cls.push('hinted');
          if (i === sel) cls.push('sel');
          if (flash.includes(i)) cls.push('conflict');
          if (colOf(i) === 1) cls.push('box-r');
          if (rowOf(i) === 1) cls.push('box-b');
          if (colOf(i) === 3) cls.push('last-c');
          if (rowOf(i) === 3) cls.push('last-r');
          const b = h('button', { class: cls.join(' '), type: 'button', 'aria-label': v ? `Skaičius ${v}` : 'Tuščias langelis' }, v ? String(v) : '');
          b.addEventListener('click', () => {
            if (solved || given.has(i) || hinted.has(i) || grid[i] !== 0) return;
            sel = i;
            flash = [];
            hintNumber = null;
            render();
          });
          return b;
        }),
      );
      const numbers = h('div', { class: 'options numbers', role: 'group', 'aria-label': 'Skaičiai' },
        [1, 2, 3, 4].map((v) => {
          const cls = ['opt'];
          if (hintNumber === v) cls.push('hint');
          const b = h('button', { class: cls.join(' '), type: 'button', disabled: solved || sel < 0 }, String(v));
          b.addEventListener('click', () => chooseNumber(v));
          return b;
        }),
      );
      area.replaceChildren(
        h('div', { class: 'board-wrap' }, board),
        solved ? null : h('p', { class: 'cw-letter-help' }, 'Koks skaičius turi būti pažymėtame langelyje?'),
        numbers,
      );
    }

    root.replaceChildren(
      h('section', { class: 'game' },
        h('h1', { class: 'game-title' }, 'Mažasis sudoku'),
        progressBar(level, LEVELS.length),
        h('p', { class: 'instruction' }, 'Kiekvienoje eilutėje, stulpelyje ir storu rėmeliu apvestame kvadrate skaičiai nuo 1 iki 4 turi būti po vieną kartą.'),
        area,
        feedback.el,
        h('div', { class: 'actions' }, hintBtn, h('span', { class: 'spacer' }), nextBtn),
      ),
    );
    render();
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visi sudoku išspręsti. Puikus darbas!',
      onAgain: () => { lock.lock(); level = 0; showLevel(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  showLevel();
}
