// Ryškus žymeklis: spalvotas ratas seka pelę, o spustelėjus išsiplečia ratilas.
// Tai padeda rasti žymeklį ekrane.

import { load, save } from './lib/store.js';

const CLICKABLE = 'button, a, [role="button"], .opt, .btn';

export function initCursor() {
  const halo = document.getElementById('halo');
  if (!halo) return { isOn: () => false, toggle: () => false };

  let on = load('halo', true) !== false;
  let x = -200;
  let y = -200;
  let scale = 1;
  let frame = 0;

  function apply() {
    document.body.classList.toggle('no-halo', !on);
  }

  function draw() {
    frame = 0;
    halo.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    x = e.clientX;
    y = e.clientY;
    const target = e.target instanceof Element ? e.target.closest(CLICKABLE) : null;
    const overTarget = !!target && !target.disabled;
    scale = overTarget ? 1.25 : 1;
    halo.classList.toggle('over-target', overTarget);
    document.body.classList.add('halo-active');
    schedule();
  }, { passive: true });

  document.addEventListener('pointerleave', () => document.body.classList.remove('halo-active'));
  document.documentElement.addEventListener('mouseleave', () => document.body.classList.remove('halo-active'));

  window.addEventListener('pointerdown', (e) => {
    if (!on) return;
    const ring = document.createElement('div');
    ring.className = 'ripple';
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
    ring.addEventListener('animationend', () => ring.remove());
    document.body.append(ring);
  }, { passive: true });

  apply();

  return {
    isOn: () => on,
    toggle() {
      on = !on;
      save('halo', on);
      apply();
      return on;
    },
  };
}
