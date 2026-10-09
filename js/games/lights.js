// Lemputės: paspaudus lemputę pasikeičia ji ir jos kaimynės. Tikslas: užgesinti visas.

import { h, createFeedback, progressBar, finishView, makeLock, nextGood } from '../ui.js';
import { makeLights, press, allOff } from '../lib/lightsLogic.js';
import { shuffle } from '../lib/random.js';

const LEVELS = [
  { n: 3, k: 2 },
  { n: 3, k: 3 },
  { n: 4, k: 3 },
];

export function mount(root, ctx) {
  const lock = makeLock();
  let level = 0;

  function showLevel() {
    const { n, k } = LEVELS[level];
    const puzzle = makeLights(n, k);
    const initial = puzzle.board.slice();
    let board = initial.slice();
    // Dar reikalingi paspaudimai = (pradinis planas) XOR (vartotojo paspaudimai).
    let remaining = new Set(puzzle.plan);
    const history = [];
    let hintIdx = null;
    let solved = false;

    const feedback = createFeedback();
    const boardEl = h('div', { class: 'lamps', style: `grid-template-columns: repeat(${n}, auto)`, role: 'group', 'aria-label': 'Lemputės' });
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      level === LEVELS.length - 1 ? 'Baigti ✓' : 'Toliau →');
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');
    const undoBtn = h('button', { class: 'btn light', type: 'button', disabled: true }, '↩ Atšaukti');
    const resetBtn = h('button', { class: 'btn light', type: 'button' }, '🔄 Iš naujo');

    function toggleRemaining(idx) {
      if (remaining.has(idx)) remaining.delete(idx);
      else remaining.add(idx);
    }

    function render() {
      boardEl.replaceChildren(...board.map((on, idx) => {
        const lamp = h('button', {
          class: 'lamp' + (on ? ' on' : '') + (idx === hintIdx ? ' hint' : ''),
          type: 'button',
          'aria-label': on ? 'Dega lemputė' : 'Užgesusi lemputė',
          'aria-pressed': String(on),
          disabled: solved,
        }, on ? '💡' : '');
        lamp.addEventListener('click', () => onPress(idx));
        return lamp;
      }));
      undoBtn.disabled = history.length === 0 || solved;
    }

    function onPress(idx) {
      if (solved || lock.locked) return;
      board = press(board, n, idx);
      toggleRemaining(idx);
      history.push(idx);
      hintIdx = null;
      if (allOff(board)) {
        solved = true;
        feedback.show('good', nextGood(), 'Visos lemputės užgesintos.');
        hintBtn.hidden = true;
        resetBtn.hidden = true;
        nextBtn.hidden = false;
        render();
        nextBtn.focus({ preventScroll: true });
      } else {
        feedback.show('hint', `Dar dega lempučių: ${board.filter(Boolean).length}.`);
        render();
      }
    }

    undoBtn.addEventListener('click', () => {
      if (!history.length || solved) return;
      const idx = history.pop();
      board = press(board, n, idx);
      toggleRemaining(idx);
      hintIdx = null;
      feedback.show('hint', 'Žingsnis atšauktas.');
      render();
    });

    resetBtn.addEventListener('click', () => {
      if (solved) return;
      board = initial.slice();
      remaining = new Set(puzzle.plan);
      history.length = 0;
      hintIdx = null;
      feedback.show('hint', 'Pradėjome iš naujo.');
      render();
    });

    hintBtn.addEventListener('click', () => {
      if (solved || lock.locked) return;
      const choices = [...remaining];
      if (!choices.length) return;
      hintIdx = shuffle(choices)[0];
      feedback.show('hint', 'Užuomina:', 'paspauskite pažymėtą lemputę.');
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
        h('h1', { class: 'game-title' }, 'Lemputės'),
        progressBar(level, LEVELS.length),
        h('p', { class: 'instruction' }, 'Užgesinkite visas lemputes. Paspaudus lemputę, pasikeičia ji ir jos kaimynės: degančios užgęsta, užgesusios užsidega.'),
        h('div', { class: 'board-wrap' }, boardEl),
        feedback.el,
        h('div', { class: 'actions' }, hintBtn, undoBtn, resetBtn, h('span', { class: 'spacer' }), nextBtn),
      ),
    );
    render();
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visos lemputės užgesintos. Puikus darbas!',
      onAgain: () => { lock.lock(); level = 0; showLevel(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  showLevel();
}
