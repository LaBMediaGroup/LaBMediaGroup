/* His gallery: every drawing pinned up full screen, filter by medium, tap one to see it big.
   openGallery(items, {start, sound}) — items are the art API's drawings ({svg, title, medium}).
   start (an index) opens straight onto that piece. Swipe or arrow keys step through; Escape steps back. */
const MEDIUM = {mud: 'Stick in mud', paw_paint: 'Paw paint', crayon: 'Crayon'};
const label = m => MEDIUM[m] || MEDIUM.crayon;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

let open = null;
export function openGallery(items, {start = null, sound = () => {}} = {}) {
  closeGallery(true);
  const root = document.createElement('div'); root.className = 'gallery pe'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'His gallery');
  const kinds = [...new Set(items.map(a => MEDIUM[a.medium] ? a.medium : 'crayon'))];
  root.innerHTML = `<header class="gal-top">
      <div><span class="gal-title">His gallery</span><small>${items.length} piece${items.length === 1 ? '' : 's'}, newest first</small></div>
      <button class="st-round" type="button" data-gal-close aria-label="Close the gallery">${X}</button></header>
    ${kinds.length > 1 ? `<div class="gal-chips" role="group" aria-label="Show">${['all', ...kinds].map(k => `<button type="button" class="st-pill${k === 'all' ? ' dark' : ''}" data-kind="${k}">${k === 'all' ? 'All' : label(k)}</button>`).join('')}</div>` : ''}
    <div class="gal-wall"></div>
    <div class="gal-view" hidden><div class="gal-stage"><div class="gal-frame"></div></div>
      <div class="gal-caption"><button class="st-round" type="button" data-step="-1" aria-label="Previous piece">←</button>
        <div aria-live="polite" aria-atomic="true"><b></b><small></small></div>
        <button class="st-round" type="button" data-step="1" aria-label="Next piece">→</button></div>
      <button class="st-pill" type="button" data-wall>Back to the wall</button></div>`;
  document.getElementById('hud2').appendChild(root);
  const wall = root.querySelector('.gal-wall'), view = root.querySelector('.gal-view'), frame = root.querySelector('.gal-frame');
  let shown = items.map((_, i) => i), at = 0;
  function paintWall(kind = 'all') {
    shown = items.map((a, i) => [a, i]).filter(([a]) => kind === 'all' || (MEDIUM[a.medium] ? a.medium : 'crayon') === kind).map(([, i]) => i);
    wall.innerHTML = '';
    shown.forEach((i, n) => {
      const a = items[i], b = document.createElement('button');
      b.type = 'button'; b.className = 'gal-card st-card'; b.style.setProperty('--tilt', ((i * 37) % 7 - 3) * .6 + 'deg'); b.style.animationDelay = Math.min(n, 16) * 35 + 'ms';
      b.innerHTML = `<i class="pin"></i><div class="frame">${a.svg}</div><b>${esc(a.title)}</b><small>${label(a.medium)}</small>`;
      b.addEventListener('click', () => show(n));
      wall.appendChild(b);
    });
  }
  function show(n) {
    at = (n + shown.length) % shown.length; const a = items[shown[at]];
    frame.innerHTML = a.svg; frame.classList.remove('in'); void frame.offsetWidth; frame.classList.add('in');
    view.querySelector('b').textContent = a.title;
    view.querySelector('small').textContent = `${label(a.medium)} · ${at + 1} of ${shown.length}`;
    for (const s of view.querySelectorAll('[data-step]')) s.hidden = shown.length < 2;
    wall.hidden = true; view.hidden = false; root.querySelector('.gal-chips')?.setAttribute('hidden', '');
  }
  function wallBack() { view.hidden = true; wall.hidden = false; root.querySelector('.gal-chips')?.removeAttribute('hidden'); sound('page'); }
  root.addEventListener('click', e => {
    const k = e.target.closest('[data-kind]'), s = e.target.closest('[data-step]');
    if (k) { for (const c of root.querySelectorAll('[data-kind]')) c.classList.toggle('dark', c === k); paintWall(k.dataset.kind); }
    if (s) { show(at + Number(s.dataset.step)); }
    if (e.target.closest('[data-wall]')) wallBack();
    if (e.target.closest('[data-gal-close]')) closeGallery();
  });
  // swipe between pieces in the big view
  let x0 = null;
  view.addEventListener('pointerdown', e => { if (!e.target.closest('button')) x0 = e.clientX; });
  view.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50 && shown.length > 1) { show(at + (dx < 0 ? 1 : -1)); sound('page'); } });
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); view.hidden ? closeGallery() : wallBack(); }
    if (!view.hidden && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); show(at + (e.key === 'ArrowLeft' ? -1 : 1)); sound('page'); }
  });
  paintWall();
  if (start != null) show(Math.max(0, start));
  requestAnimationFrame(() => root.classList.add('on'));
  sound('swoop');
  open = root;
  root.querySelector(start != null ? '[data-wall]' : '[data-gal-close]').focus();
}
export function closeGallery(quick = false) {
  if (!open) return; const r = open; open = null; r.classList.remove('on');
  quick ? r.remove() : setTimeout(() => r.remove(), 260);
}
