// Išdėliokite į grupes: rodomas vienas žodis su paveikslėliu, o apačioje spaudžiate tinkamą grupę (krepšelį).
// Jokio tempimo, laikmačių ar taškų. Čia nenaudojame runChoiceGame, nes krepšeliai ir jų skaičiai
// išlieka visą etapą, o žodžiai keičiasi be „Toliau“ po kiekvieno.

import { h, createFeedback, progressBar, finishView, makeLock, nextGood, nextTry } from '../ui.js';
import { shuffle } from '../lib/random.js';
import { CATEGORIES, AVOID_PAIRS } from '../data/categories.js';
import { WORD_BY_TEXT } from '../data/words.js';
import { makeStages, explainSort } from '../lib/basketsLogic.js';

const NEXT_MS = 800;

export function mount(root, ctx) {
  const lock = makeLock();
  let stages = [];
  let stageIdx = 0;
  let timer = 0;

  function start() {
    stages = makeStages(CATEGORIES, AVOID_PAIRS);
    stageIdx = 0;
    showStage();
  }

  function showStage() {
    clearTimeout(timer);
    const stage = stages[stageIdx];
    const total = stage.items.length;
    const counts = new Map(stage.groups.map((g) => [g, 0]));
    const sorted = new Map(stage.groups.map((g) => [g, []]));
    let itemIdx = 0;
    let wrongCount = 0;
    let hintStage = 0;
    let busy = false; // žodis juda į krepšelį
    let done = false;

    const feedback = createFeedback();
    const itemEmoji = h('div', { class: 'big-emoji', 'aria-hidden': 'true' }, '');
    const itemWord = h('p', { class: 'sentence bk-word' }, '');
    const itemCard = h('div', { class: 'bk-item' }, itemEmoji, itemWord);
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      stageIdx === stages.length - 1 ? 'Baigti ✓' : 'Toliau →');

    const baskets = new Map();
    const countEls = new Map();
    const stackEls = new Map();
    for (const g of stage.groups) {
      const count = h('span', { class: 'bk-count' }, '0');
      const stack = h('span', { class: 'bk-stack', 'aria-hidden': 'true' }, '');
      const btn = h('button', { class: 'opt bk', type: 'button', 'data-id': g },
        h('span', { class: 'bk-name' }, g),
        h('span', { class: 'bk-info' }, h('span', { class: 'bk-label' }, 'Sudėta:'), count),
        stack,
      );
      btn.addEventListener('click', () => choose(g, btn));
      baskets.set(g, btn);
      countEls.set(g, count);
      stackEls.set(g, stack);
    }
    const basketBtns = [...baskets.values()];
    const current = () => stage.items[itemIdx];
    const emojiOf = (word) => WORD_BY_TEXT.get(word).e;

    function showItem() {
      const it = current();
      wrongCount = 0;
      hintStage = 0;
      busy = false;
      itemCard.classList.remove('flying');
      itemEmoji.textContent = emojiOf(it.word);
      itemWord.textContent = it.word;
      for (const [g, btn] of baskets) {
        btn.disabled = false;
        btn.className = 'opt bk';
        btn.setAttribute('aria-label', `Grupė ${g}. Sudėta: ${counts.get(g)}`);
      }
      hintBtn.hidden = false;
      itemCard.setAttribute('aria-label', `Žodis: ${it.word}`);
      itemCard.setAttribute('role', 'img');
    }

    function highlightCorrect() {
      baskets.get(current().group).classList.add('hint');
    }

    function choose(group, btn) {
      if (busy || done || btn.disabled || lock.locked) return;
      const it = current();
      if (group === it.group) {
        busy = true;
        lock.lock(NEXT_MS);
        counts.set(group, counts.get(group) + 1);
        sorted.get(group).push(it.word);
        countEls.get(group).textContent = String(counts.get(group));
        stackEls.get(group).textContent = sorted.get(group).map(emojiOf).join('');
        basketBtns.forEach((b) => b.classList.remove('hint'));
        btn.classList.add('correct', 'bump');
        btn.setAttribute('aria-label', `Grupė ${group}. Sudėta: ${counts.get(group)}`);
        basketBtns.forEach((b) => { if (b !== btn) b.disabled = true; });
        itemCard.classList.add('flying');
        feedback.show('good', nextGood(), explainSort(it.word, group));
        itemIdx += 1;
        if (itemIdx >= total) {
          done = true;
          hintBtn.hidden = true;
          nextBtn.hidden = false;
          nextBtn.focus({ preventScroll: true });
        } else {
          timer = setTimeout(showItem, NEXT_MS);
        }
      } else {
        wrongCount += 1;
        btn.disabled = true;
        btn.classList.add('tried');
        if (wrongCount >= 2) {
          highlightCorrect();
          feedback.show('try', 'Nieko tokio!', 'Pažiūrėkite į pažymėtą grupę.');
        } else {
          feedback.show('try', nextTry());
        }
      }
    }

    hintBtn.addEventListener('click', () => {
      if (busy || done || lock.locked) return;
      const right = baskets.get(current().group);
      const wrongLeft = basketBtns.filter((b) => !b.disabled && b !== right);
      if (hintStage === 0 && wrongLeft.length > 1) {
        const victim = shuffle(wrongLeft)[0];
        victim.disabled = true;
        victim.classList.add('tried');
        hintStage = 1;
        feedback.show('hint', 'Užuomina:', 'Pašalinome vieną netinkamą grupę.');
      } else {
        hintStage = 2;
        highlightCorrect();
        feedback.show('hint', 'Užuomina:', 'tinka pažymėta grupė.');
      }
    });

    nextBtn.addEventListener('click', () => {
      if (lock.locked) return;
      lock.lock();
      stageIdx += 1;
      if (stageIdx >= stages.length) finish();
      else showStage();
    });

    root.replaceChildren(
      h('section', { class: 'game' },
        h('h1', { class: 'game-title' }, 'Išdėliokite į grupes'),
        progressBar(stageIdx, stages.length, 'Etapas'),
        h('p', { class: 'instruction' }, 'Pažiūrėkite į žodį ir paspauskite grupę, kuriai jis tinka.'),
        h('div', { class: 'prompt bk-prompt' }, itemCard),
        h('div', { class: 'dock' },
          h('div', { class: `options baskets n${stage.groups.length}`, role: 'group', 'aria-label': 'Grupės' }, basketBtns),
          feedback.el,
          h('div', { class: 'actions' }, hintBtn, h('span', { class: 'spacer' }), nextBtn),
        ),
      ),
    );
    showItem();
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visi žodžiai sudėti į grupes. Gerai padirbėta!',
      onAgain: () => { lock.lock(); start(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  start();

  return () => clearTimeout(timer);
}
