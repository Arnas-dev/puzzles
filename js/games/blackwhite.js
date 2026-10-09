// Juoda ir balta: spustelėjus langelį jis tampa juodas, baltas arba tuščias.
// Taisyklės: ne daugiau kaip du vienodi iš eilės; kiekvienoje eilutėje ir stulpelyje spalvų po lygiai.

import { h, createFeedback, progressBar, finishView, makeLock, nextGood } from '../ui.js';
import {
  EMPTY, BLACK, WHITE, makePuzzle, tripleCells, overfullLines, isSolved, hintCell,
} from '../lib/blackwhiteLogic.js';

const LEVELS = [
  { n: 4, blanks: 6 },
  { n: 4, blanks: 9 },
  { n: 6, blanks: 16 },
];

const MARK = { [EMPTY]: '', [BLACK]: '●', [WHITE]: '○' };
const NAME = { [EMPTY]: 'tuščias', [BLACK]: 'juodas', [WHITE]: 'baltas' };

export function mount(root, ctx) {
  const lock = makeLock();
  let level = 0;

  function showLevel() {
    const { n, blanks } = LEVELS[level];
    const puzzle = makePuzzle(n, blanks);
    const givens = new Set();
    puzzle.puzzle.forEach((v, i) => { if (v !== EMPTY) givens.add(i); });
    let grid = puzzle.puzzle.slice();
    const hinted = new Set();
    const history = []; // { idx, prev }
    let solved = false;

    const feedback = createFeedback();
    const boardEl = h('div', {
      class: 'bw-board' + (n > 4 ? ' bw-big' : ''),
      style: `grid-template-columns: repeat(${n}, auto)`,
      role: 'group',
      'aria-label': 'Juodų ir baltų langelių lentelė',
    });
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      level === LEVELS.length - 1 ? 'Baigti ✓' : 'Toliau →');
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');
    const undoBtn = h('button', { class: 'btn light', type: 'button', disabled: true }, '↩ Atšaukti');
    const resetBtn = h('button', { class: 'btn light', type: 'button' }, '🔄 Iš naujo');

    const fixed = (i) => givens.has(i) || hinted.has(i);

    const cells = grid.map((_, idx) => {
      const el = h('button', { type: 'button' });
      el.addEventListener('click', () => onCell(idx));
      return el;
    });
    boardEl.append(...cells);

    function render() {
      const triples = tripleCells(grid, n);
      cells.forEach((el, idx) => {
        const v = grid[idx];
        const cls = ['bw-cell', v === BLACK ? 'black' : v === WHITE ? 'white' : 'empty'];
        if (givens.has(idx)) cls.push('given');
        if (hinted.has(idx)) cls.push('hinted');
        if (triples.has(idx)) cls.push('conflict');
        el.className = cls.join(' ');
        el.setAttribute('aria-label',
          `Eilutė ${Math.floor(idx / n) + 1}, stulpelis ${(idx % n) + 1}, ${NAME[v]}`
          + (givens.has(idx) ? ', pradinis' : hinted.has(idx) ? ', užuomina' : ''));
        // Null vaikų nepaduodame: replaceChildren(null) įrašytų žodį „null“.
        el.replaceChildren(...[
          MARK[v],
          givens.has(idx) ? h('span', { class: 'bw-lock', 'aria-hidden': 'true' }, '🔒') : null,
          hinted.has(idx) ? h('span', { class: 'bw-lock', 'aria-hidden': 'true' }, '💡') : null,
        ].filter(Boolean));
        el.disabled = solved;
      });
      undoBtn.disabled = history.length === 0 || solved;
    }

    // Švelnus atsiliepimas po kiekvieno veiksmo.
    function status() {
      if (isSolved(grid, n)) return;
      if (tripleCells(grid, n).size > 0) {
        feedback.show('try', 'Greta yra trys vienodi langeliai. Pakeiskite vieną iš jų.');
        return;
      }
      const over = overfullLines(grid, n);
      if (over.length) {
        feedback.show('try', over[0].kind === 'row'
          ? `Eilutėje ${over[0].index + 1} per daug vienos spalvos langelių.`
          : `Stulpelyje ${over[0].index + 1} per daug vienos spalvos langelių.`);
        return;
      }
      const left = grid.filter((v) => v === EMPTY).length;
      feedback.show('hint', left ? `Liko tuščių langelių: ${left}` : 'Viskas užpildyta.');
    }

    function afterChange(explain) {
      if (isSolved(grid, n)) {
        solved = true;
        render();
        feedback.show('good', nextGood(), 'Visi langeliai teisingi.');
        hintBtn.hidden = true;
        resetBtn.hidden = true;
        nextBtn.hidden = false;
        nextBtn.focus({ preventScroll: true });
        return;
      }
      render();
      if (explain) feedback.show('hint', explain.title, explain.text);
      else status();
    }

    function onCell(idx) {
      if (solved || lock.locked || fixed(idx)) return;
      history.push({ idx, prev: grid[idx] });
      grid[idx] = (grid[idx] + 1) % 3; // tuščia -> juoda -> balta -> tuščia
      afterChange();
    }

    undoBtn.addEventListener('click', () => {
      if (solved) return;
      // Užuominos langelių neatšaukiame.
      while (history.length && fixed(history[history.length - 1].idx)) history.pop();
      const last = history.pop();
      if (!last) { render(); return; }
      grid[last.idx] = last.prev;
      afterChange({ title: 'Žingsnis atšauktas.' });
    });

    resetBtn.addEventListener('click', () => {
      if (solved) return;
      grid = puzzle.puzzle.slice();
      hinted.clear();
      history.length = 0;
      render();
      feedback.show('hint', 'Pradėjome iš naujo.');
    });

    hintBtn.addEventListener('click', () => {
      if (solved || lock.locked) return;
      const hint = hintCell(grid, puzzle.solution, new Set([...givens, ...hinted]));
      if (!hint) return;
      grid[hint.index] = hint.value;
      hinted.add(hint.index);
      afterChange({ title: 'Užuomina:', text: 'langelis su 💡 jau užpildytas teisingai.' });
    });

    nextBtn.addEventListener('click', () => {
      if (lock.locked) return;
      lock.lock();
      level += 1;
      if (level >= LEVELS.length) finish();
      else showLevel();
    });

    root.replaceChildren(
      h('section', { class: 'game' },
        h('h1', { class: 'game-title' }, 'Juoda ir balta'),
        progressBar(level, LEVELS.length),
        h('p', { class: 'instruction' }, 'Spustelėkite langelį, kad jis taptų juodas, baltas arba tuščias. Trys vienodi langeliai iš eilės negalimi. Kiekvienoje eilutėje ir kiekviename stulpelyje juodų langelių turi būti tiek pat, kiek baltų.'),
        h('div', { class: 'board-wrap' }, boardEl),
        feedback.el,
        h('div', { class: 'actions' }, hintBtn, undoBtn, resetBtn, h('span', { class: 'spacer' }), nextBtn),
      ),
    );
    render();
    status();
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visos lentelės išspręstos. Puikus darbas!',
      onAgain: () => { lock.lock(); level = 0; showLevel(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  showLevel();
}
