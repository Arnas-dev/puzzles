// Šviesos: pastatykite lemputes taip, kad būtų apšviesti visi balti langeliai.
// Lemputės negali šviesti viena į kitą, o skaičius juodame langelyje rodo, kiek lempučių yra šalia.

import { h, createFeedback, progressBar, finishView, makeLock, nextGood, nextTry } from '../ui.js';
import {
  WHITE, isNumber, generate, solve, isSolved, conflicts, litCells, overNumbers, doneNumbers,
  unlitCount, hint as makeHint, lempuciu,
} from '../lib/lightUpLogic.js';

const SIZES = [4, 4, 5, 5, 6];

const HINT_LABEL = '💡 Užuomina';
const HINT_DO_LABEL = '💡 Padaryti už mane';

export function mount(root, ctx) {
  const lock = makeLock();
  let level = 0;

  function showLevel() {
    const n = SIZES[level];
    const puzzle = generate(n);
    const solution = puzzle.solution || solve(puzzle, 1).solution;
    const total = n * n;
    let lamps = new Array(total).fill(0);
    const hinted = new Set();
    let pending = null; // { action, index, focus } po pirmos užuominos pakopos
    let solved = false;

    const feedback = createFeedback();
    const countEl = h('p', { class: 'lu-count', 'aria-live': 'polite' });
    const boardEl = h('div', {
      class: `lu-board lu-s${n}`,
      style: `grid-template-columns: repeat(${n}, auto); --n: ${n}`,
      role: 'group',
      'aria-label': 'Šviesų lenta',
    });
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, HINT_LABEL);
    const checkBtn = h('button', { class: 'btn light', type: 'button' }, 'Patikrinti');
    const resetBtn = h('button', { class: 'btn light', type: 'button' }, '↩ Pradėti iš naujo');
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      level === SIZES.length - 1 ? 'Baigti ✓' : 'Toliau →');

    const cellEls = puzzle.cells.map((v, idx) => {
      if (v === WHITE) {
        const el = h('button', { type: 'button' });
        el.addEventListener('click', () => onCell(idx));
        return el;
      }
      return h('div', { class: 'lu-cell lu-block' });
    });
    boardEl.append(...cellEls);

    const pos = (idx) => `Eilutė ${Math.floor(idx / n) + 1}, stulpelis ${(idx % n) + 1}`;

    function render() {
      const lit = litCells(puzzle, lamps);
      const bad = conflicts(puzzle, lamps);
      const over = overNumbers(puzzle, lamps);
      const done = doneNumbers(puzzle, lamps);
      puzzle.cells.forEach((v, idx) => {
        const el = cellEls[idx];
        const cls = ['lu-cell'];
        if (v !== WHITE) {
          cls.push('lu-block');
          let label = `${pos(idx)}, juodas langelis`;
          if (isNumber(v)) {
            cls.push('lu-num');
            if (over.has(idx)) { cls.push('over'); label += `, skaičius ${v}, per daug lempučių`; }
            else if (done.has(idx)) { cls.push('done'); label += `, skaičius ${v}, tinka`; }
            else label += `, skaičius ${v}`;
          }
          if (pending && pending.focus === idx) cls.push('target-focus');
          el.className = cls.join(' ');
          el.setAttribute('aria-label', label);
          el.replaceChildren(...[
            isNumber(v) ? String(v) : '',
            isNumber(v) && over.has(idx) ? h('span', { class: 'lu-mark', 'aria-hidden': 'true' }, '!') : null,
            isNumber(v) && !over.has(idx) && done.has(idx) ? h('span', { class: 'lu-mark ok', 'aria-hidden': 'true' }, '✓') : null,
          ].filter(Boolean));
          return;
        }
        const isLamp = lamps[idx] === 1;
        if (isLamp) cls.push('lamp');
        else if (lit[idx]) cls.push('lit');
        if (isLamp && bad.has(idx)) cls.push('conflict');
        if (hinted.has(idx)) cls.push('hinted');
        if (pending && pending.index === idx) cls.push(pending.action === 'add' ? 'target-add' : 'target-remove');
        if (pending && pending.focus === idx) cls.push('target-focus');
        el.className = cls.join(' ');
        el.setAttribute('aria-label',
          `${pos(idx)}, ${isLamp ? 'lemputė' : lit[idx] ? 'apšviestas' : 'tamsus'}`
          + (isLamp && bad.has(idx) ? ', šviečia kitą lemputę' : ''));
        el.setAttribute('aria-pressed', isLamp ? 'true' : 'false');
        el.replaceChildren(...[
          isLamp ? h('span', { class: 'lu-lamp', 'aria-hidden': 'true' }, '💡') : null,
          !isLamp && lit[idx] ? h('span', { class: 'lu-glow', 'aria-hidden': 'true' }) : null,
          isLamp && bad.has(idx) ? h('span', { class: 'lu-mark', 'aria-hidden': 'true' }, '!') : null,
        ].filter(Boolean));
        el.disabled = solved;
      });
      countEl.textContent = `Neapšviestų langelių: ${unlitCount(puzzle, lamps)}`;
      hintBtn.textContent = pending ? HINT_DO_LABEL : HINT_LABEL;
    }

    // Pirmiausia pranešame apie klaidas, kitaip apie pastatytų lempučių kiekį.
    function problemText() {
      const bad = conflicts(puzzle, lamps);
      if (bad.size) return 'Šios dvi lemputės šviečia viena į kitą. Viena turi dingti.';
      const over = overNumbers(puzzle, lamps);
      if (over.size) {
        const v = puzzle.cells[[...over][0]];
        return v === 0
          ? 'Šalia skaičiaus 0 lempučių negali būti.'
          : `Šalia skaičiaus ${v} yra per daug lempučių. Viena turi dingti.`;
      }
      return null;
    }

    function status() {
      const problem = problemText();
      if (problem) { feedback.show('try', problem); return; }
      const count = lamps.reduce((s, x) => s + x, 0);
      feedback.show('hint', count ? `Pastatyta: ${lempuciu(count)}.` : 'Spustelėkite baltą langelį, kad pastatytumėte lemputę.');
    }

    function afterChange() {
      if (isSolved(puzzle, lamps)) {
        solved = true;
        pending = null;
        render();
        feedback.show('good', nextGood(), 'Visi langeliai apšviesti.');
        hintBtn.hidden = true;
        checkBtn.hidden = true;
        resetBtn.hidden = true;
        nextBtn.hidden = false;
        nextBtn.focus({ preventScroll: true });
        return;
      }
      render();
      status();
    }

    function onCell(idx) {
      if (solved || lock.locked) return;
      lamps[idx] = lamps[idx] ? 0 : 1;
      hinted.delete(idx);
      pending = null;
      afterChange();
    }

    resetBtn.addEventListener('click', () => {
      if (solved) return;
      lamps = new Array(total).fill(0);
      hinted.clear();
      pending = null;
      render();
      feedback.show('hint', 'Pradėjome iš naujo. Spustelėkite baltą langelį.');
    });

    checkBtn.addEventListener('click', () => {
      if (solved || lock.locked) return;
      const problem = problemText();
      if (problem) { feedback.show('try', problem); return; }
      const dark = unlitCount(puzzle, lamps);
      if (dark > 0) {
        feedback.show('try', nextTry(), `Dar yra neapšviestų langelių: ${dark}. Pastatykite daugiau lempučių.`);
        return;
      }
      feedback.show('try', nextTry(), 'Ne prie visų skaičių yra tiek lempučių, kiek jie rodo.');
    });

    // Užuomina dviem pakopomis: pirma parodo ir paaiškina, antra padaro.
    hintBtn.addEventListener('click', () => {
      if (solved || lock.locked) return;
      if (pending) {
        const p = pending;
        pending = null;
        lamps[p.index] = p.action === 'add' ? 1 : 0;
        if (p.action === 'add') hinted.add(p.index); else hinted.delete(p.index);
        afterChange();
        return;
      }
      const hint = makeHint(puzzle, lamps, solution);
      if (!hint) {
        feedback.show('hint', 'Daugiau užuominų nėra.');
        return;
      }
      pending = { action: hint.action, index: hint.index, focus: hint.focus };
      render();
      feedback.show('hint', hint.text, hint.action === 'add'
        ? 'Langelis pažymėtas. Spustelėkite „Padaryti už mane“ arba pastatykite lemputę patys.'
        : 'Lemputė pažymėta. Spustelėkite „Padaryti už mane“ arba nuimkite ją patys.');
    });

    nextBtn.addEventListener('click', () => {
      if (lock.locked) return;
      lock.lock();
      level += 1;
      if (level >= SIZES.length) finish();
      else showLevel();
    });

    root.replaceChildren(
      h('section', { class: 'game' },
        h('h1', { class: 'game-title' }, 'Šviesos'),
        progressBar(level, SIZES.length),
        h('p', { class: 'instruction' }, 'Spustelėkite baltą langelį, kad pastatytumėte lemputę, ir apšvieskite visus langelius. Lemputės neturi šviesti viena į kitą, o skaičius rodo, kiek lempučių yra šalia jo.'),
        countEl,
        h('div', { class: 'board-wrap' }, boardEl),
        h('div', { class: 'dock' },
          feedback.el,
          h('div', { class: 'actions' }, hintBtn, checkBtn, resetBtn, h('span', { class: 'spacer' }), nextBtn),
        ),
      ),
    );
    render();
    status();
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visos lentos apšviestos. Puikus darbas!',
      onAgain: () => { lock.lock(); level = 0; showLevel(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  showLevel();
}
