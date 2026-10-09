// Bendri sąsajos pagalbininkai.

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

export const GOOD_WORDS = ['Teisingai! Šaunu!', 'Puiku!', 'Labai gerai!', 'Būtent taip!'];
export const TRY_WORDS = ['Dar ne. Pabandykite kitą variantą.', 'Dar ne visai. Pabandykite dar kartą.', 'Nieko tokio, bandykite toliau.'];

let goodIdx = 0;
let tryIdx = 0;
export const nextGood = () => GOOD_WORDS[goodIdx++ % GOOD_WORDS.length];
export const nextTry = () => TRY_WORDS[tryIdx++ % TRY_WORDS.length];

// Telefone atsiliepimas ar mygtukai gali likti žemiau ekrano krašto. Po paspaudimo švelniai
// pastumiame puslapį tik tiek, kad matytųsi visa apatinė juosta (arba bent atsiliepimas), ir ne daugiau.
function keepInView(el) {
  if (!el.scrollIntoView) return;
  const dock = el.closest('.dock');
  const target = dock && dock.offsetHeight <= window.innerHeight ? dock : el;
  const r = target.getBoundingClientRect();
  if (r.top >= 0 && r.bottom <= window.innerHeight) return;
  target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

// Atsiliepimo laukelis: spalva + ženklas + tekstas, kad žinutė būtų aiški ir be spalvų.
export function createFeedback() {
  const el = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  const ICONS = { good: '✅', try: '🙂', hint: '💡' };
  return {
    el,
    show(kind, text, explain) {
      el.className = 'feedback ' + kind;
      // replaceChildren(null) įrašytų žodį „null“, todėl tuščių vaikų nepaduodame.
      const kids = [`${ICONS[kind] || ''} ${text}`];
      if (explain) kids.push(h('span', { class: 'explain' }, explain));
      el.replaceChildren(...kids);
      keepInView(el);
    },
    clear() {
      el.className = 'feedback';
      el.replaceChildren();
    },
  };
}

export function progressBar(index, total, label = 'Užduotis') {
  const dots = [];
  for (let i = 0; i < total; i++) {
    dots.push(h('span', { class: 'dot' + (i < index ? ' done' : i === index ? ' current' : '') }));
  }
  return h('div', { class: 'progress' },
    h('span', {}, `${label} ${index + 1} iš ${total}`),
    h('span', { class: 'dots', 'aria-hidden': 'true' }, dots),
  );
}

export function finishView({ text = 'Visos užduotys atliktos.', onAgain, onExit }) {
  return h('section', { class: 'finish' },
    h('div', { class: 'party', 'aria-hidden': 'true' }, '🎉'),
    h('h1', {}, 'Šaunu!'),
    h('p', { class: 'lead' }, text),
    h('div', { class: 'actions' },
      h('button', { class: 'btn big green', type: 'button', onclick: onAgain }, '🔄 Žaisti dar kartą'),
      h('button', { class: 'btn big', type: 'button', onclick: onExit }, '← Į sąrašą'),
    ),
  );
}

// Apatinė juosta (.dock) segama prie ekrano apačios (klasė „pinned“) tik tada, kai tai neuždengia turinio.
// Po turiniu esanti juosta segama tik jei elemento prieš ją apačia (ties slinkimu 0) telpa virš juostos;
// šalia lentos esanti tik jei jos viršus telpa taip, kad ji nepakiltų virš savo vietos. Kitaip lieka įprastame sraute.
export function pinDock(dock) {
  dock.classList.remove('pinned');
  if (window.innerWidth <= 640) return;
  const prev = dock.previousElementSibling;
  if (!prev || getComputedStyle(prev).display === 'contents') return;
  const pr = prev.getBoundingClientRect();
  const dr = dock.getBoundingClientRect();
  const sideBySide = dr.top + 1 < pr.bottom;
  // Šalia lentos: juosta neturi iškilti virš savo vietos (nepaslėpti pavadinimo); po turiniu: virš juostos telpa elementas prieš ją.
  const margin = sideBySide ? 0 : parseFloat(getComputedStyle(prev).marginBottom) || 0;
  const limit = sideBySide ? dr.top : pr.bottom + margin;
  if (limit + window.scrollY <= window.innerHeight - dr.height) dock.classList.add('pinned');
}

// Perskaičiuoja visas juostas po kiekvieno perpiešimo, lango ar raidžių dydžio pasikeitimo.
// Visi trys signalai (stebėtojai ir lango dydis) sujungiami į vieną skaičiavimą per kadrą,
// kad matavimai nevyktų po kelis kartus ir nekeistų išdėstymo nuolat.
export function watchDocks(app) {
  let queued = 0;
  const run = () => {
    queued = 0;
    app.querySelectorAll('.dock').forEach(pinDock);
  };
  const schedule = () => {
    if (!queued) queued = requestAnimationFrame(run);
  };
  const ro = new ResizeObserver(schedule);
  const mo = new MutationObserver(() => {
    ro.disconnect();
    app.querySelectorAll('.game, .dock').forEach((el) => ro.observe(el));
    schedule();
  });
  mo.observe(app, { childList: true, subtree: true });
  window.addEventListener('resize', schedule);
  schedule();
}

// Dvigubo spustelėjimo apsauga: po „Toliau“ trumpai ignoruojame spustelėjimus.
export function makeLock() {
  let until = 0;
  return {
    lock(ms = 600) { until = performance.now() + ms; },
    get locked() { return performance.now() < until; },
  };
}
