// Plytelės: stumkite plyteles į tuščią vietą, kol jos išsirikiuos eilės tvarka.

import { h, createFeedback, progressBar, finishView, makeLock, nextGood } from '../ui.js';
import { makeTiles, moveTile, isSolved, hintTile } from '../lib/tilesLogic.js';

const LEVELS = [
  { rows: 2, cols: 3, moves: 6 },
  { rows: 3, cols: 3, moves: 10 },
  { rows: 3, cols: 3, moves: 25 },
];

export function mount(root, ctx) {
  const lock = makeLock();
  let level = 0;

  function showLevel() {
    const { rows, cols, moves } = LEVELS[level];
    const initial = makeTiles(rows, cols, moves);
    let board = initial.slice();
    const history = [];
    let hintIdx = null;
    let solved = false;

    const feedback = createFeedback();
    const boardEl = h('div', {
      class: 'tl-board',
      style: `grid-template-columns: repeat(${cols}, auto)`,
      role: 'group',
      'aria-label': 'Plytelės',
    });
    const counter = h('p', { class: 'tl-counter', 'aria-live': 'polite' });
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      level === LEVELS.length - 1 ? 'Baigti ✓' : 'Toliau →');
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');
    const undoBtn = h('button', { class: 'btn light', type: 'button', disabled: true }, '↩ Atšaukti');
    const resetBtn = h('button', { class: 'btn light', type: 'button' }, '🔄 Iš naujo');

    function render() {
      boardEl.replaceChildren(...board.map((v, idx) => {
        if (v === 0) return h('div', { class: 'tl-empty', 'aria-label': 'Tuščia vieta' });
        const tile = h('button', {
          class: 'tl-tile' + (idx === hintIdx ? ' hint' : ''),
          type: 'button',
          'aria-label': `Plytelė ${v}`,
          disabled: solved,
        }, String(v));
        tile.addEventListener('click', () => onTile(idx));
        return tile;
      }));
      counter.textContent = `Žingsnių: ${history.length}`;
      undoBtn.disabled = history.length === 0 || solved;
    }

    function onTile(idx) {
      if (solved || lock.locked) return;
      const next = moveTile(board, rows, cols, idx);
      if (!next) {
        feedback.show('try', 'Šios plytelės dar negalima pastumti.',
          'Paspauskite plytelę, esančią šalia tuščios vietos.');
        return;
      }
      history.push(board);
      board = next;
      hintIdx = null;
      if (isSolved(board)) {
        solved = true;
        feedback.show('good', nextGood(), 'Plytelės išsirikiavo eilės tvarka.');
        hintBtn.hidden = true;
        resetBtn.hidden = true;
        nextBtn.hidden = false;
        render();
        nextBtn.focus({ preventScroll: true });
      } else {
        feedback.clear();
        render();
      }
    }

    undoBtn.addEventListener('click', () => {
      if (!history.length || solved) return;
      board = history.pop();
      hintIdx = null;
      feedback.show('hint', 'Žingsnis atšauktas.');
      render();
    });

    resetBtn.addEventListener('click', () => {
      if (solved) return;
      board = initial.slice();
      history.length = 0;
      hintIdx = null;
      feedback.show('hint', 'Pradėjome iš naujo.');
      render();
    });

    hintBtn.addEventListener('click', () => {
      if (solved || lock.locked) return;
      hintIdx = hintTile(board, rows, cols);
      if (hintIdx == null) return;
      feedback.show('hint', 'Užuomina:', 'pastumkite pažymėtą plytelę.');
      render();
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
        h('h1', { class: 'game-title' }, 'Plytelės'),
        progressBar(level, LEVELS.length),
        h('p', { class: 'instruction' }, 'Paspauskite plytelę šalia tuščios vietos, ir ji pasislinks. Išrikiuokite plyteles eilės tvarka: 1, 2, 3 ir toliau. Tuščia vieta turi likti apačioje dešinėje.'),
        h('div', { class: 'board-wrap' }, boardEl),
        h('div', { class: 'dock' },
          counter,
          feedback.el,
          h('div', { class: 'actions' }, hintBtn, undoBtn, resetBtn, h('span', { class: 'spacer' }), nextBtn),
        ),
      ),
    );
    render();
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visos plytelės išrikiuotos. Puikus darbas!',
      onAgain: () => { lock.lock(); level = 0; showLevel(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  showLevel();
}
