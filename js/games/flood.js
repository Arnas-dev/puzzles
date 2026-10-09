// Spalvų užliejimas: spalvos mygtuku užlieta sritis keičia spalvą. Tikslas: visa lenta vienos spalvos.

import { h, createFeedback, progressBar, finishView, makeLock, nextGood } from '../ui.js';
import { SPALVOS, makeFlood, floodStep, floodedRegion, isWon, hintColor } from '../lib/floodLogic.js';

const LEVELS = [
  { n: 4, k: 3 },
  { n: 5, k: 3 },
  { n: 6, k: 4 },
];

export function mount(root, ctx) {
  const lock = makeLock();
  let level = 0;

  function showLevel() {
    const { n, k } = LEVELS[level];
    const initial = makeFlood(n, k);
    let board = initial.slice();
    const history = [];
    let hint = null;
    let solved = false;

    const feedback = createFeedback();
    const boardEl = h('div', {
      class: 'fl-board',
      style: `grid-template-columns: repeat(${n}, auto)`,
      role: 'img',
      'aria-label': 'Spalvų lenta',
    });
    const counter = h('p', { class: 'fl-counter', 'aria-live': 'polite' });
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      level === LEVELS.length - 1 ? 'Baigti ✓' : 'Toliau →');
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');
    const undoBtn = h('button', { class: 'btn light', type: 'button', disabled: true }, '↩ Atšaukti');
    const resetBtn = h('button', { class: 'btn light', type: 'button' }, '🔄 Iš naujo');

    const colourBtns = SPALVOS.slice(0, k).map((s, c) => {
      const btn = h('button', {
        class: 'fl-colour',
        type: 'button',
        style: `background: ${s.color}`,
        'aria-label': `Spalva: ${s.name}`,
      },
      h('span', { class: 'fl-sym', 'aria-hidden': 'true' }, s.symbol),
      h('span', { class: 'fl-name' }, s.name));
      btn.addEventListener('click', () => onColour(c));
      return btn;
    });

    function render() {
      const region = floodedRegion(board, n);
      boardEl.replaceChildren(...board.map((c, idx) => h('div', {
        class: 'fl-cell' + (region.has(idx) ? ' in' : ''),
        style: `background: ${SPALVOS[c].color}`,
      }, SPALVOS[c].symbol)));
      counter.textContent = `Žingsnių: ${history.length}`;
      colourBtns.forEach((btn, c) => {
        btn.disabled = solved || c === board[0];
        btn.classList.toggle('hint', c === hint);
      });
      undoBtn.disabled = history.length === 0 || solved;
    }

    function onColour(c) {
      if (solved || lock.locked || c === board[0]) return;
      const before = floodedRegion(board, n).size;
      history.push(board);
      board = floodStep(board, n, c);
      hint = null;
      if (isWon(board)) {
        solved = true;
        feedback.show('good', nextGood(), 'Visa lenta tapo vienos spalvos.');
        hintBtn.hidden = true;
        resetBtn.hidden = true;
        nextBtn.hidden = false;
        render();
        nextBtn.focus({ preventScroll: true });
      } else {
        const after = floodedRegion(board, n).size;
        if (after > before) {
          feedback.show('hint', `Užlieta langelių: ${after} iš ${n * n}.`, 'Sritis padidėjo.');
        } else {
          feedback.show('hint', 'Šįkart sritis nepadidėjo.', 'Pabandykite kitą spalvą.');
        }
        render();
      }
    }

    undoBtn.addEventListener('click', () => {
      if (!history.length || solved) return;
      board = history.pop();
      hint = null;
      feedback.show('hint', 'Žingsnis atšauktas.');
      render();
    });

    resetBtn.addEventListener('click', () => {
      if (solved) return;
      board = initial.slice();
      history.length = 0;
      hint = null;
      feedback.show('hint', 'Pradėjome iš naujo.');
      render();
    });

    hintBtn.addEventListener('click', () => {
      if (solved || lock.locked) return;
      hint = hintColor(board, n, k);
      if (hint == null) return;
      feedback.show('hint', 'Užuomina:', 'paspauskite pažymėtą spalvos mygtuką.');
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
        h('h1', { class: 'game-title' }, 'Spalvų užliejimas'),
        progressBar(level, LEVELS.length),
        h('p', { class: 'instruction' }, 'Paspauskite spalvos mygtuką. Viršutiniame kairiajame kampe esanti sritis pakeis spalvą ir prijungs gretimus tos pačios spalvos langelius. Visą lentą užliekite viena spalva.'),
        h('div', { class: 'board-wrap' }, boardEl),
        h('div', { class: 'dock' },
          counter,
          h('div', { class: 'fl-colours' }, colourBtns),
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
      text: 'Visos lentos užlietos viena spalva. Puikus darbas!',
      onAgain: () => { lock.lock(); level = 0; showLevel(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  showLevel();
}
