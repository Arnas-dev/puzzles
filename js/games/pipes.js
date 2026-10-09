// Vamzdžiai: spustelėjus plytelę ji pasisuka. Tikslas: sujungti visus vamzdžius su vandens šaltiniu.

import { h, createFeedback, progressBar, finishView, makeLock, nextGood } from '../ui.js';
import { N, E, S, W, makePuzzle, rotateMask, reachable, openEnds, isSolved, hintTile } from '../lib/pipesLogic.js';

const LEVELS = [{ n: 3 }, { n: 3 }, { n: 4 }];

const SVG_NS = 'http://www.w3.org/2000/svg';
const ENDS = [
  [N, 50, 0],
  [E, 100, 50],
  [S, 50, 100],
  [W, 0, 50],
];

// Vamzdžių piešinys: storos linijos nuo centro iki pasirinktų kraštų.
function pipeSvg(mask) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'pp-svg');
  svg.setAttribute('aria-hidden', 'true');
  let d = '';
  for (const [bit, x, y] of ENDS) if (mask & bit) d += `M50 50L${x} ${y}`;
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('class', 'pp-pipe');
  const hub = document.createElementNS(SVG_NS, 'circle');
  hub.setAttribute('cx', '50');
  hub.setAttribute('cy', '50');
  hub.setAttribute('r', '17');
  hub.setAttribute('class', 'pp-hub');
  svg.append(path, hub);
  return svg;
}

export function mount(root, ctx) {
  const lock = makeLock();
  let level = 0;

  function showLevel() {
    const { n } = LEVELS[level];
    const puzzle = makePuzzle(n);
    const total = n * n;
    let board = puzzle.start.slice();
    const deg = new Array(total).fill(0); // kaupiamas pasukimas, kad animacija eitų tik pirmyn
    const history = [];
    let hintIdx = null;
    let solved = false;

    const feedback = createFeedback();
    const boardEl = h('div', {
      class: 'pp-board',
      style: `grid-template-columns: repeat(${n}, auto)`,
      role: 'group',
      'aria-label': 'Vamzdžių plytelės',
    });
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      level === LEVELS.length - 1 ? 'Baigti ✓' : 'Toliau →');
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');
    const undoBtn = h('button', { class: 'btn light', type: 'button', disabled: true }, '↩ Atšaukti');
    const resetBtn = h('button', { class: 'btn light', type: 'button' }, '🔄 Iš naujo');

    const tiles = board.map((mask, idx) => {
      const rot = h('span', { class: 'pp-rot' }, pipeSvg(mask));
      const isSource = idx === puzzle.source;
      const tile = h('button', {
        class: 'pp-tile' + (isSource ? ' source' : ''),
        type: 'button',
        'aria-label': isSource ? 'Plytelė su vandens šaltiniu' : 'Vamzdžio plytelė',
      }, rot, isSource ? h('span', { class: 'pp-src', 'aria-hidden': 'true' }, '🚰') : null);
      tile.addEventListener('click', () => onTile(idx));
      return { tile, rot };
    });
    boardEl.append(...tiles.map((t) => t.tile));

    function render() {
      const wet = reachable(board, n, puzzle.source);
      tiles.forEach(({ tile, rot }, idx) => {
        rot.style.transform = `rotate(${deg[idx]}deg)`;
        tile.classList.toggle('wet', wet.has(idx));
        tile.classList.toggle('hint', idx === hintIdx);
        tile.disabled = solved;
      });
      undoBtn.disabled = history.length === 0 || solved;
      return wet.size;
    }

    function status(wetCount) {
      if (wetCount === total && openEnds(board, n) > 0) {
        feedback.show('hint', `Prijungta plytelių: ${wetCount} iš ${total}`, 'Dar liko atvirų vamzdžių galų.');
      } else {
        feedback.show('hint', `Prijungta plytelių: ${wetCount} iš ${total}`);
      }
    }

    function afterChange() {
      hintIdx = null;
      const wetCount = render();
      if (isSolved(board, n, puzzle.source)) {
        solved = true;
        render();
        feedback.show('good', nextGood(), `Prijungta plytelių: ${total} iš ${total}. Visi vamzdžiai sujungti.`);
        hintBtn.hidden = true;
        resetBtn.hidden = true;
        nextBtn.hidden = false;
        nextBtn.focus({ preventScroll: true });
      } else {
        status(wetCount);
      }
    }

    function rotate(idx, times) {
      for (let i = 0; i < times; i++) board[idx] = rotateMask(board[idx]);
    }

    function onTile(idx) {
      if (solved || lock.locked) return;
      rotate(idx, 1);
      deg[idx] += 90;
      history.push(idx);
      afterChange();
    }

    undoBtn.addEventListener('click', () => {
      if (!history.length || solved) return;
      const idx = history.pop();
      rotate(idx, 3);
      deg[idx] -= 90;
      afterChange();
    });

    resetBtn.addEventListener('click', () => {
      if (solved) return;
      board = puzzle.start.slice();
      deg.fill(0);
      history.length = 0;
      hintIdx = null;
      const wetCount = render();
      feedback.show('hint', 'Pradėjome iš naujo.', `Prijungta plytelių: ${wetCount} iš ${total}`);
    });

    hintBtn.addEventListener('click', () => {
      if (solved || lock.locked) return;
      const idx = hintTile(board, puzzle.solution);
      if (idx === -1) return;
      hintIdx = idx;
      render();
      feedback.show('hint', 'Užuomina:', 'spustelėkite pažymėtą plytelę.');
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
        h('h1', { class: 'game-title' }, 'Vamzdžiai'),
        progressBar(level, LEVELS.length),
        h('p', { class: 'instruction' }, 'Spustelėkite plytelę, kad ją pasuktumėte. Sukite plyteles, kol vanduo pasieks visus vamzdžius.'),
        h('div', { class: 'board-wrap' }, boardEl),
        feedback.el,
        h('div', { class: 'actions' }, hintBtn, undoBtn, resetBtn, h('span', { class: 'spacer' }), nextBtn),
      ),
    );
    status(render());
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visi vamzdžiai sujungti. Puikus darbas!',
      onAgain: () => { lock.lock(); level = 0; showLevel(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  showLevel();
}
