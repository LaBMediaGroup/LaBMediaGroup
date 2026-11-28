/* D · Title Sequence. One rAF loop drives every card from scroll; IntersectionObserver starts and stops media.
   Phone first: touch gets the same ink, the centre row plays inline, the portrait wipe locks on tap. */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const W = window.LAB_WORK, q = new URLSearchParams(location.search);
const coonQ = /^(awake|asleep)$/.test(q.get('coon') || '') ? q.get('coon') : '';
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const vh = () => innerHeight;
let now = null;                                       // Labcoon's live state

/* ---------------- film grain tile ---------------- */
{
  const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'), d = x.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); $('.grain').style.backgroundImage = `url(${c.toDataURL()})`;
}

/* ---------------- loader: 000 → 100, then the mark, then the letterbox opens ---------------- */
const introDone = new Promise(res => {
  const el = $('#intro');
  if (document.documentElement.classList.contains('no-intro')) return res();
  const cols = $$('.col', el), t0 = performance.now(), DUR = 1150;
  document.documentElement.style.overflow = 'hidden';
  const tick = () => {
    const k = clamp((performance.now() - t0) / DUR), e = 1 - Math.pow(1 - k, 3), n = e * 100;
    // each wheel rolls continuously, like a mechanical counter
    cols[2].style.setProperty('--d', (n % 10).toFixed(3));
    cols[1].style.setProperty('--d', (Math.floor(n / 10) % 10 + smooth(.82, 1, (n % 10) / 10)).toFixed(3));
    cols[0].style.setProperty('--d', (n >= 99 ? smooth(99, 100, n) : 0).toFixed(3));
    if (k < 1) return requestAnimationFrame(tick);
    cols.forEach((c, i) => c.style.setProperty('--d', i === 0 ? 1 : i === 1 ? 10 : 10));
    setTimeout(() => el.classList.add('done'), 120);
    setTimeout(() => el.classList.add('mark'), 260);
    setTimeout(() => { el.classList.add('open'); document.documentElement.style.overflow = ''; res(); }, 820);
    setTimeout(() => { el.remove(); }, 1700);
    try { sessionStorage.setItem('labD-intro', '1'); } catch {}
  };
  // the counter runs while fonts and the first clip arrive; it never waits longer than its own 1.2 s
  requestAnimationFrame(tick);
});

/* ---------------- timecode in the slate ---------------- */
{
  const tc = $('#tc'), t0 = performance.now(), p2 = n => String(n).padStart(2, '0');
  setInterval(() => { const f = Math.floor((performance.now() - t0) / 1000 * 24); tc.textContent = `${p2(Math.floor(f / 86400))}:${p2(Math.floor(f / 1440) % 60)}:${p2(Math.floor(f / 24) % 60)}:${p2(f % 24)}`; }, 1000 / 24);
}

/* ---------------- 01 · opening titles: films inside the letters ---------------- */
// the cut list: which film, and where in its clip the shot is bright enough to read inside thin letters
const CLIPS = [['lookout', .1], ['boy', 5.6], ['trail', 3.6], ['scattered', 1.1], ['gone', .2]]
  .map(([id, at]) => Object.assign({}, W.films.find(f => f.id === id), {at})).filter(f => f.vid);
const hero = (() => {
  const sec = $('#open'), pin = $('.pin', sec), out = $('#openGL');
  const M = document.createElement('canvas'), L = document.createElement('canvas');
  const m = M.getContext('2d'), l = L.getContext('2d');
  const ink = new Ink(out, {src: M, dynamic: true, res: fine ? 150 : 100, amp: .75});
  let view = out, mctx = null;
  if (!ink.ok) { view = M; M.id = 'openGL'; out.replaceWith(M); }
  const vids = [0, 1].map(() => Object.assign(document.createElement('video'), {muted: true, playsInline: true, loop: true, preload: 'auto', crossOrigin: 'anonymous'}));
  vids.forEach(v => { v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); });
  const posters = CLIPS.map(f => Object.assign(new Image(), {src: f.img}));
  let cur = 0, clip = 0, cutAt = 0, flash = 0, w = 0, h = 0, dpr = 1, letters = [], cap = 0, p = 0, visible = true;
  const setClip = i => {
    const f = CLIPS[i];
    $('#nowTitle').textContent = f.title; $('#nowMeta').textContent = `${f.year} · ${f.tag}`;
    $('#endTitle').textContent = f.title; $('#endMeta').textContent = (f.cred || []).map(c => c[1]).slice(0, 2).join(' · ');
  };
  const cue = (v, i) => { v.src = CLIPS[i].vid; v.addEventListener('loadedmetadata', () => { v.currentTime = CLIPS[i].at; }, {once: true}); };
  cue(vids[0], 0); cue(vids[1], 1); setClip(0);
  function cut(t) {
    const nextV = vids[1 - cur]; if (nextV.readyState < 2) return;  // wait until the next shot is ready
    vids[cur].pause(); cur = 1 - cur; clip = (clip + 1) % CLIPS.length;
    nextV.currentTime = CLIPS[clip].at; nextV.play().catch(() => {}); setClip(clip); cutAt = t; flash = 1;
    cue(vids[1 - cur], (clip + 1) % CLIPS.length);
  }
  function layout() {
    w = innerWidth; h = pin.clientHeight; dpr = Math.min(devicePixelRatio || 1, w < 760 ? 1.6 : 1.25);
    for (const c of [M, L]) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    if (ink.ok) ink.size(w, h, dpr); else { M.style.width = '100%'; M.style.height = '100%'; }
    const g = w < 760 ? 16 : 40, F = '"Bebas Neue"';
    l.font = `400 100px ${F}`; const capH = l.measureText('H').actualBoundingBoxAscent / 100 || .7;
    const lines = w < 760 ? ['LAB', 'MEDIA'] : ['LAB MEDIA'];
    const sizes = lines.map(t => (w - g * 2) / (l.measureText(t).width / 100));
    if (w < 760) sizes[0] = Math.min(sizes[0], h * .36 / capH);
    letters = []; let y = w < 760 ? Math.max(118, h * .15) : h * .5 - sizes[0] * capH * .62;
    lines.forEach((t, li) => {
      const s = sizes[li]; l.font = `400 ${s}px ${F}`; y += s * capH; const x0 = g - s * .012;
      for (let i = 0; i < t.length; i++) if (t[i] !== ' ') {
        const x = x0 + l.measureText(t.slice(0, i)).width, cw = l.measureText(t[i]).width;
        letters.push({ch: t[i], x, cw, base: y, s, capH: s * capH});
      }
      y += s * .06;
    });
    cap = y;
    // the order they fall: the A goes first, Warhol-style ("L B"), then the rest
    const order = w < 760 ? [1, 6, 3, 0, 7, 4, 2, 5] : [1, 6, 3, 0, 7, 4, 2, 5];
    order.forEach((li, k) => letters[li] && (letters[li].k = k));
    pin.style.setProperty('--h1y', `${Math.round(y + (w < 760 ? 18 : 34))}px`);
  }
  function cover(ctx, src, s = 1) {
    const sw = src.videoWidth || src.naturalWidth, sh = src.videoHeight || src.naturalHeight; if (!sw) return;
    const W2 = ctx.canvas.width, H2 = ctx.canvas.height, k = Math.max(W2 / sw, H2 / sh) * s;
    ctx.drawImage(src, (W2 - sw * k) / 2, (H2 - sh * k) / 2, sw * k, sh * k);
  }
  // a tiny light meter: night footage gets pushed, bright footage is left alone
  const LM = document.createElement('canvas'); LM.width = LM.height = 8; const lm = LM.getContext('2d', {willReadFrequently: true});
  let gain = 1.3, gainT = 1.3, metered = 0;
  function meter(src, t) {
    if (t - metered >= 400) { metered = t; try { lm.drawImage(src, 0, 0, 8, 8); const d = lm.getImageData(0, 0, 8, 8).data; let y = 0;
      for (let i = 0; i < d.length; i += 4) y += d[i] * .2126 + d[i + 1] * .7152 + d[i + 2] * .0722;
      gainT = clamp(118 / Math.max(20, y / 64), .95, 1.7); } catch {} }
    gain = lerp(gain, gainT, .1);
  }
  function draw(t) {
    const v = vids[cur], src = v.readyState >= 2 ? v : posters[clip];
    // letters: white glyphs, then the film poured in (source-in)
    l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over'; l.clearRect(0, 0, L.width, L.height);
    l.setTransform(dpr, 0, 0, dpr, 0, 0); l.fillStyle = '#fff';
    for (const a of letters) {
      const st = .05 + a.k * .052, k = clamp((p - st) / .2), e = k * k * k;
      if (e >= 1) continue;
      const dir = a.k % 2 ? 1 : -1;
      l.save(); l.font = `400 ${a.s}px "Bebas Neue"`;
      l.translate(a.x + a.cw / 2 + dir * e * 40, a.base - a.capH / 2 + e * h * 1.1); l.rotate(dir * e * .5);
      l.fillText(a.ch, -a.cw / 2, a.capH / 2); l.restore();
    }
    // Rasterize the video before compositing. WebKit can paint an accelerated
    // video draw outside a source-in mask; canvas-to-canvas preserves the glyph alpha.
    meter(src, t);
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.globalAlpha = 1; m.fillStyle = '#0b0a09'; m.fillRect(0, 0, M.width, M.height);
    if ('filter' in m) m.filter = `brightness(${gain.toFixed(2)}) contrast(1.06) saturate(1.15)`;
    cover(m, src, 1.02);
    if ('filter' in m) m.filter = 'none';
    l.setTransform(1, 0, 0, 1, 0, 0);
    l.globalCompositeOperation = 'source-in';
    l.drawImage(M, 0, 0);
    // lift the shadows inside the glyphs so dark footage still reads as letters
    l.globalCompositeOperation = 'source-atop'; l.fillStyle = 'rgba(243,235,221,.14)'; l.fillRect(0, 0, L.width, L.height);
    l.globalCompositeOperation = 'source-over';
    // the frame: black, then the full shot rising behind as the letters fall away
    m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = 1; m.fillStyle = '#0b0a09'; m.fillRect(0, 0, M.width, M.height);
    const a = smooth(.16, .62, p);
    if (a > 0) { m.globalAlpha = a; cover(m, src, 1.18 - .18 * a); m.globalAlpha = 1; m.fillStyle = `rgba(11,10,9,${.5 - .32 * a})`; m.fillRect(0, 0, M.width, M.height); }
    m.drawImage(L, 0, 0);
    if (flash > 0) { m.fillStyle = `rgba(243,235,221,${flash * .22})`; m.fillRect(0, 0, M.width, M.height); flash = Math.max(0, flash - .2); }
    if (ink.ok) ink.frame(t);
  }
  function update(t, scrollV) {
    const r = sec.getBoundingClientRect();
    visible = r.bottom > 0 && r.top < vh();
    p = clamp(-r.top / (r.height - vh()));
    if (!visible) { vids.forEach(v => v.pause()); return; }
    if (vids[cur].paused) vids[cur].play().catch(() => {});
    if (cutAt === 0) cutAt = t;                         // the first shot gets its full 3.4 s
    if (t - cutAt > 3400) cut(t);
    pin.style.setProperty('--lb', smooth(.56, .8, p).toFixed(3));
    pin.style.setProperty('--endA', smooth(.72, .86, p).toFixed(3));
    const fade = (1 - smooth(.01, .12, p)).toFixed(3);
    for (const el of $$('.open-h1, .open-now, .open-cue, .open-slug', pin)) el.style.opacity = fade;
    if (ink.ok) { ink.turb = lerp(ink.turb, Math.min(.4, Math.abs(scrollV) / 6000), .15); ink.smear = lerp(ink.smear, clamp(scrollV / 6000, -.5, .5), .2); }
    draw(t);
  }
  document.fonts.load('400 100px "Bebas Neue"').then(layout);
  layout(); addEventListener('resize', layout);
  return {update, ink, get view() { return view; }, sec, vids};
})();

/* ---------------- ink on two headlines (statement, contact) ---------------- */
const inks = [];
document.fonts.ready.then(() => {
  for (const el of $$('[data-ink]')) { const t = Ink.text(el); if (t) inks.push(t); }
  addEventListener('resize', () => { clearTimeout(inks.rz); inks.rz = setTimeout(() => inks.forEach(t => t.build()), 200); });
  io.refresh();
});

/* pointer and finger: poke the ink wherever it is under them */
{
  let lx = 0, ly = 0, lt = 0;
  const poke = (x, y) => {
    const t = performance.now(), dt = Math.max(8, t - lt), sp = Math.hypot(x - lx, y - ly) / dt; lx = x; ly = y; lt = t;
    const s = Math.min(1.2, .25 + sp * .6);
    const targets = [...inks.map(i => i.ink), hero.ink].filter(i => i.ok);
    for (const ink of targets) { const r = ink.canvas.getBoundingClientRect(); if (x > r.left && x < r.right && y > r.top && y < r.bottom) ink.poke(x - r.left, y - r.top, s); }
  };
  addEventListener('pointermove', e => poke(e.clientX, e.clientY), {passive: true});
  addEventListener('touchmove', e => { for (const tc of e.touches) poke(tc.clientX, tc.clientY); }, {passive: true});
  addEventListener('touchstart', e => { const tc = e.touches[0]; lx = tc.clientX; ly = tc.clientY; lt = performance.now(); poke(tc.clientX, tc.clientY + .1); }, {passive: true});
}

/* ---------------- reveals ---------------- */
const io = (() => {
  const seen = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); seen.unobserve(e.target);
    const ink = inks.find(i => i.el === e.target); ink && ink.reveal();
    if (e.target.id === 'sigBobby') drawSig(e.target);
  }), {rootMargin: '0px 0px -18% 0px'});
  const refresh = () => $$('.statement, .contact-h, .cascade, .reel .row, #sigBobby, .hl').forEach(el => !el.classList.contains('in') && seen.observe(el));
  refresh(); return {refresh};
})();

/* cascade: split headings into letters that drop in */
for (const el of $$('.cascade')) {
  const words = el.textContent.trim().split(/\s+/); el.setAttribute('aria-label', el.textContent.trim()); el.textContent = '';
  let i = 0;
  words.forEach((wd, wi) => {
    const w = document.createElement('span'); w.className = 'cascade-w'; w.setAttribute('aria-hidden', 'true');
    for (const ch of wd) { const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; w.appendChild(s); }
    el.appendChild(w); if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
}

/* ---------------- signatures (single-stroke script, EMS Allure, OFL) ---------------- */
let SIG = null;
const sigReady = fetch(new URL('sig-data.json', import.meta.url)).then(r => r.json()).then(j => (SIG = j));
function strokes(svg, ds, cls) {
  svg.innerHTML = ds.map(d => `<path class="${cls}" d="${d}"/>`).join('');
  return $$('path', svg).map(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return {p, L}; });
}
function play(list, total, delay = 0) {
  const sum = list.reduce((a, s) => a + s.L, 0); let at = delay;
  for (const s of list) { const d = total * s.L / sum; s.p.animate([{strokeDashoffset: s.L}, {strokeDashoffset: 0}], {duration: d, delay: at, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards'}); at += d * .92; }
  return at;
}
async function drawSig(box) {
  await sigReady; const svg = $('svg', box);
  const list = strokes(svg, SIG.bobby.d, '');
  // a flourish under the name, the way it ends on a cheque
  svg.insertAdjacentHTML('beforeend', '<path d="M38 112 C 160 96, 330 92, 560 70 C 575 69, 586 74, 578 80"/>');
  const fl = svg.lastElementChild, FL = fl.getTotalLength(); fl.style.strokeDasharray = FL; fl.style.strokeDashoffset = FL;
  const end = play(list, 2100, 200);
  fl.animate([{strokeDashoffset: FL}, {strokeDashoffset: 0}], {duration: 520, delay: end, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards'});
}

/* ---------------- 02 · portrait: a strip of film rolls across Bobby; tap to lock it on his face ---------------- */
const portrait = (() => {
  const fig = $('#portrait'), vid = $('video', fig), btn = $('.portrait-lock', fig);
  let locked = false, target = .5, x = .2, on = false, px = null;
  const BAND = .36, FACE = .56;
  new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) { if (!vid.src) vid.src = vid.dataset.src; vid.play().catch(() => {}); } else vid.pause(); }, {rootMargin: '120px'}).observe(fig);
  fig.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = fig.getBoundingClientRect(); px = (e.clientX - r.left) / r.width; });
  fig.addEventListener('pointerleave', () => (px = null));
  const toggle = () => { locked = !locked; btn.setAttribute('aria-pressed', locked); btn.querySelector('.on-touch').textContent = locked ? 'Locked · tap again' : 'Tap to lock'; btn.querySelector('.on-mouse').textContent = locked ? 'Locked · click again' : 'Click to lock'; };
  btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  fig.addEventListener('click', () => toggle());
  return {update(t) {
    if (!on) return;
    target = locked ? FACE : px != null ? px : .5 + Math.sin(t / 1300) * .42;
    x = lerp(x, target, locked ? .09 : px != null ? .14 : .08);
    const a = clamp(x - BAND / 2, -BAND, 1) * 100, b = clamp(x + BAND / 2, 0, 1 + BAND) * 100;
    fig.style.setProperty('--b1', a.toFixed(2) + '%'); fig.style.setProperty('--b2', b.toFixed(2) + '%');
  }};
})();

/* ---------------- 02 · collage drifts at its own speeds ---------------- */
const collage = $$('.collage figure').map(el => ({el, s: +el.dataset.speed}));

/* ---------------- 03 · the films ---------------- */
const reel = $('#reel'), follow = $('#follow'), fv = $('video', follow);
W.films.forEach((f, i) => {
  const award = (f.cred || []).find(c => /award/i.test(c[0])) || (f.cred || [])[0];
  const li = document.createElement('li'); li.className = 'row'; li.dataset.i = i;
  li.innerHTML = `<a href="${f.full || f.vid}" data-film="${i}"><span class="row-n mono">${String(i + 1).padStart(2, '0')}</span>
    <span class="row-t" aria-label="${f.title}">${[...f.title].map((c, k) => `<span class="ch" style="--i:${k}" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</span>
    <span class="row-m mono"><span>${f.year} · ${f.tag}</span>${award ? `<b>${award[1]}</b>` : ''}</span>
    <span class="row-clip" aria-hidden="true"><video muted playsinline loop preload="none" poster="${f.img}"></video></span></a>`;
  reel.appendChild(li);
});
const rows = $$('.row', reel);
let rowOn = -1;
function setRow(i) {
  if (i === rowOn) return; rowOn = i;
  rows.forEach((r, k) => { const v = $('video', r); r.classList.toggle('on', k === i);
    if (k === i) { if (!v.src) v.src = W.films[k].vid; v.play().catch(() => {}); } else v.pause(); });
}
if (fine) {
  let fx = innerWidth / 2, fy = innerHeight / 2, tx = fx, ty = fy, shown = false, tilt = 0;
  reel.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
  rows.forEach((r, i) => r.addEventListener('pointerenter', () => {
    const f = W.films[i]; if (fv.dataset.i != i) { fv.dataset.i = i; fv.poster = f.img; fv.src = f.vid; }
    fv.play().catch(() => {}); shown = true; follow.style.opacity = 1; follow.style.scale = 1;
  }));
  reel.addEventListener('pointerleave', () => { shown = false; follow.style.opacity = 0; follow.style.scale = .6; fv.pause(); });
  follow.update = () => {
    const dx = tx - fx; fx = lerp(fx, tx, .14); fy = lerp(fy, ty, .14);
    tilt = lerp(tilt, clamp(dx * .12, -14, 14), .12);
    follow.style.transform = `translate(${fx - 170}px, ${fy - 106}px) rotate(${tilt}deg)`;
  };
}
/* the screening room */
const scr = $('#screening'), sv = $('video', scr);
reel.addEventListener('click', e => {
  const a = e.target.closest('a[data-film]'); if (!a || !scr.showModal) return; e.preventDefault();
  const f = W.films[+a.dataset.film];
  $('#scrTitle').textContent = f.title; $('.scr-line', scr).textContent = f.line;
  $('.scr-cred', scr).innerHTML = (f.cred || []).map(c => `<dt>${c[0]}</dt><dd>${c[1]}</dd>`).join('');
  $('.scr-links', scr).innerHTML = (f.links || []).map(l => `<a href="${l[1]}">${l[0]}</a>`).join(' · ');
  sv.poster = f.img; sv.src = f.full || f.vid; scr.showModal(); sv.play().catch(() => {});
});
$('.scr-x', scr).addEventListener('click', () => scr.close());
scr.addEventListener('close', () => { sv.pause(); sv.removeAttribute('src'); sv.load(); });

/* ---------------- 04 · websites: phone recordings and live desktop sites ---------------- */
const phoneSites = matchMedia('(max-width: 759px), (pointer: coarse) and (max-height: 520px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const previewToggle = $('#previewToggle');
let playPreviews = !reducedMotion.matches;
const SITE_URL = {ballcap: 'https://bcp.labmedia.work/', splitbone: 'https://splitbone-room.labmedia.work/', sweetbabe: 'https://sweetbabemusic.com/', sideways: 'https://ssa.labmedia.work/'};
const siteCards = $('#siteCards'), siteNames = $('#siteNames');
W.websites.forEach((s, i) => {
  const url = SITE_URL[s.id] || (s.links || [])[0]?.[1] || '#contact';
  siteCards.insertAdjacentHTML('beforeend', `<a class="scard" href="${url}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><picture><source media="${phoneSites.media}" srcset="/title-sequence/previews/${s.id}.webp"><img src="${s.img}" alt="" loading="lazy"></picture><span class="scard-live mono">Live</span></a>`);
  const short = s.title.replace(/ Productions$/, '');
  siteNames.insertAdjacentHTML('beforeend', `<li class="sname"><a href="${url}" target="_blank" rel="noopener">${short}<span class="vh"> (opens the live site)</span></a></li>`);
});
const scards = $$('.scard'), snames = $$('.sname');
let siteOn = -1, siteHover = -1;
function liveIn(card, url) {
  if ($('iframe', card)) return;
  const portrait = card.clientHeight > card.clientWidth, vw = portrait ? 390 : 1280, k = card.clientWidth / vw;
  const f = document.createElement('iframe');
  f.title = 'Live preview'; f.loading = 'lazy'; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
  f.style.width = vw + 'px'; f.style.height = Math.ceil(card.clientHeight / k) + 'px'; f.style.transform = `scale(${k})`;
  f.addEventListener('load', () => { if (f.parentNode === card) card.classList.add('live'); });
  f.src = url; card.appendChild(f);
}
function removePreview(card) {
  const media = $('iframe, video', card);
  previewToggle.hidden = true;
  card.classList.remove('live', 'playing');
  if (!media) return;
  media.remove();
  if (media.tagName === 'VIDEO') {
    media.pause();
    media.removeAttribute('src');
    media.load();
  }
}
function phonePreview(i) {
  const card = scards[i], video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.preload = 'metadata';
  video.addEventListener('playing', () => {
    if (!card.contains(video)) return;
    card.classList.add('playing');
    previewToggle.textContent = 'Pause preview';
  });
  video.addEventListener('pause', () => {
    if (card.contains(video)) previewToggle.textContent = 'Play preview';
  });
  video.addEventListener('error', () => {
    if (card.contains(video)) removePreview(card);
  });
  card.append(video);
  video.src = new URL('previews/' + W.websites[i].id + '.mp4', import.meta.url);
  previewToggle.hidden = false;
  previewToggle.textContent = 'Play preview';
  if (playPreviews) video.play().catch(() => {});
}
previewToggle.addEventListener('click', () => {
  const video = $('video', siteCards);
  if (!video) return;
  playPreviews = video.paused;
  if (playPreviews) video.play().catch(() => {});
  else video.pause();
});
reducedMotion.addEventListener('change', () => {
  playPreviews = !reducedMotion.matches;
  const video = $('video', siteCards);
  if (!video) return;
  if (playPreviews) video.play().catch(() => {});
  else video.pause();
});
function setSite(i) {
  if (i === siteOn) return; siteOn = i; const s = W.websites[i];
  scards.forEach((c, k) => { c.classList.toggle('on', k === i); c.classList.toggle('past', k < i); });
  snames.forEach((n, k) => n.classList.toggle('on', k === i));
  $('#siteLine').textContent = s.line;
  const a = $('#siteVisit'); a.href = scards[i].href; a.target = '_blank'; a.rel = 'noopener'; a.textContent = `Visit ${s.title.replace(/ Productions$/, '')} ↗`;
  $('#siteCount').textContent = `${String(i + 1).padStart(2, '0')} / ${String(W.websites.length).padStart(2, '0')}`;
}
if (fine) { snames.forEach((n, k) => n.addEventListener('pointerenter', () => (siteHover = k))); siteNames.addEventListener('pointerleave', () => (siteHover = -1)); }
let requestedSite = -1, siteTimer;
function requestSite(i) {
  if (requestedSite === i) return;
  clearTimeout(siteTimer);
  if (requestedSite >= 0) removePreview(scards[requestedSite]);
  requestedSite = i;
  if (i < 0) return;
  setSite(i);
  siteTimer = setTimeout(() => {
    if (phoneSites.matches) phonePreview(i);
    else liveIn(scards[i], scards[i].href);
  }, 450);
}
phoneSites.addEventListener('change', () => { siteHover = -1; requestSite(-1); });
setSite(0);

/* ---------------- 05 · the pond, live, inside the letters. Entrance 1: fall in through the P ---------------- */
const pond = (() => {
  const word = $('#pondWord'), mask = $('#pondMask'); let made = false;
  function make() {
    if (made || !now) return; made = true;
    const f = document.createElement('iframe');
    f.title = 'Live view of Labcoon’s pond'; f.setAttribute('allow', 'autoplay'); f.setAttribute('loading', 'lazy'); f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
    f.src = `/title-sequence/peek/explore.html?shot=${now.asleep ? 'culvert' : 'coon'}&coon=${now.asleep ? 'asleep' : 'awake'}`;
    mask.appendChild(f);
    addEventListener('message', e => { if (e.data && e.data.peek === 'ready') mask.classList.add('ready'); });
    setTimeout(() => mask.classList.add('ready'), 9000);
  }
  new IntersectionObserver(([e]) => e.isIntersecting && make(), {rootMargin: '900px 0px'}).observe(word);
  word.addEventListener('click', e => {
    e.preventDefault(); if (mask.classList.contains('flying')) return;
    const R = mask.getBoundingClientRect(), wide = matchMedia('(min-width: 760px)').matches;
    const [ax, ay] = wide ? [.045, .5] : [.084, .245];               // the stem of the P
    const A = {x: R.left + R.width * ax, y: R.top + R.height * ay}, S = 42, D = 1350, t0 = performance.now();
    word.style.height = R.height + 'px';
    mask.classList.add('flying');
    const set = (k, v) => { mask.style.setProperty(k, v); mask.style.setProperty('-webkit-' + k, v); };
    const step = () => {
      const k = clamp((performance.now() - t0) / D), e = k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2, s = Math.exp(Math.log(S) * k * k * k);
      const B = {x: lerp(R.left, 0, e), y: lerp(R.top, 0, e), w: lerp(R.width, innerWidth, e), h: lerp(R.height, innerHeight, e)};
      Object.assign(mask.style, {left: B.x + 'px', top: B.y + 'px', width: B.w + 'px', height: B.h + 'px'});
      set('mask-size', `${R.width * s}px ${R.height * s}px`);
      set('mask-position', `${A.x + (R.left - A.x) * s - B.x}px ${A.y + (R.top - A.y) * s - B.y}px`);
      if (k < 1) requestAnimationFrame(step); else go(now?.asleep ? 'Tiptoeing in…' : 'Into the pond…', 250);
    };
    step();
  });
  return {make};
})();

function go(label, wait = 0) {
  const th = $('#through'); $('p', th).textContent = label; th.classList.add('on');
  setTimeout(() => (location.href = '/explore.html' + (coonQ ? `?coon=${coonQ}` : '')), 450 + wait);
}
for (const a of $$('[data-door]')) a.addEventListener('click', e => { e.preventDefault(); go(now?.asleep ? 'Tiptoeing in…' : a.dataset.door === 'signature' ? 'Following the paw prints…' : 'Into the field…'); });

/* ---------------- 06 · drone school ---------------- */
$('#flyLine').textContent = W.droneSchool.line;
$('#flyLinks').innerHTML = W.droneSchool.links.map(l => `<li><a href="${l[1]}">${l[0]}${/^http/.test(l[1]) ? ' ↗' : ''}</a></li>`).join('');

/* ---------------- 07 · end credits ---------------- */
$('#toolCredits').innerHTML = W.tools.map(t => `<li><a href="${t.href}"><span class="t">${t.title}</span><i></i><span class="v">free</span></a></li>`).join('');
const roll = $('#roll'), credits = $('#credits');
function sizeRoll() { credits.style.setProperty('--rollH', (roll.offsetHeight) + 'px'); }
document.fonts.ready.then(sizeRoll); addEventListener('resize', sizeRoll); sizeRoll();

/* entrance 2: Labcoon in the credits, the real 3D him, walking the dotted line or asleep on it */
const creditCoon = (() => {
  const cv = $('#ccCoon'), line = $('.cc-line'); let api = null, dir = 1, x = 0, started = false, last = 0;
  async function start() {
    if (started || !now) return; started = true;
    try {
      const {coonSticker} = await import('/title-sequence/shared/coon.js');
      api = await coonSticker(cv, {clip: now.asleep ? 'sleep_curl' : 'walk', yaw: Math.PI / 2, light: 'night', pitch: .18, height: .42, fit: 1.05});
      cv.classList.add('ready');
      if (now.asleep) x = Math.max(0, line.offsetWidth - cv.offsetWidth - 8);
    } catch (e) { console.warn('coon', e); }
  }
  const go = () => (window.requestIdleCallback || setTimeout)(() => start());
  new IntersectionObserver(([e]) => e.isIntersecting && (document.readyState === 'complete' ? go() : addEventListener('load', go, {once: true})), {rootMargin: '1200px 0px'}).observe(credits);
  return {update(t) {
    if (!api) return; const dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
    const max = Math.max(0, line.offsetWidth - cv.offsetWidth);
    if (!now.asleep) {
      x += dir * 46 * dt;
      if (x > max) { x = max; dir = -1; api.yaw(-Math.PI / 2); } else if (x < 0) { x = 0; dir = 1; api.yaw(Math.PI / 2); }
    }
    cv.style.setProperty('--cx', x.toFixed(1) + 'px');
  }, start};
})();

/* entrance 3: his signature, a muddy paw scribble that draws itself */
const autograph = (() => {
  const svg = $('.paw-sig'); let done = false;
  const paw = (x, y, r, s = 1) => `<g class="paw" transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><ellipse cx="0" cy="6" rx="9" ry="8"/><ellipse cx="-9" cy="-6" rx="3.4" ry="4.4"/><ellipse cx="-3" cy="-10" rx="3.4" ry="4.6"/><ellipse cx="4" cy="-10" rx="3.4" ry="4.6"/><ellipse cx="10" cy="-5" rx="3.2" ry="4.2"/></g>`;
  new IntersectionObserver(async ([e], o) => {
    if (!e.isIntersecting || done) return; done = true; o.disconnect(); await sigReady;
    const dash = '<path class="stroke" d="M-14 64 Q 0 60, 14 63"/>';
    svg.innerHTML = `<defs><filter id="mud" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter></defs><g filter="url(#mud)">${dash}${SIG.coon.d.map(d => `<path class="stroke" d="${d}" transform="translate(26 6)"/>`).join('')}</g>`;
    const list = $$('path.stroke', svg).map(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return {p, L}; });
    const end = play(list, now?.asleep ? 2600 : 1800, 150);
    setTimeout(() => {
      const zs = now?.asleep ? '<path class="stroke" d="M300 40 L 316 40 L 300 56 L 316 56 M322 20 L 334 20 L 322 32 L 334 32" style="stroke-width:4"/>' : '';
      svg.insertAdjacentHTML('beforeend', paw(316, 108, 18) + paw(290, 128, -12, .8) + zs);
      requestAnimationFrame(() => svg.classList.add('drawn'));
    }, end);
  }, {rootMargin: '0px 0px -20% 0px'}).observe(svg);
})();

/* ---------------- Labcoon's live state, everywhere it shows ---------------- */
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
LabcoonLive.watch(n => {
  now = n; document.body.classList.toggle('asleep', n.asleep); document.body.classList.toggle('awake', n.awake);
  const at = n.time ? ` · ${n.time}` : '';
  const set = (k, v) => $$(`[data-live="${k}"]`).forEach(el => (el.textContent = v));
  set('line', n.asleep ? `Labcoon is asleep in ${n.where}${at}. Tiptoe.` : `Labcoon is awake at ${n.where}${at}. He ${n.doing}.`.replace(/\.\.$/, '.'));
  set('pondCta', n.asleep ? 'Tiptoe into the pond' : 'Step into the pond');
  set('credit', n.asleep ? `asleep in ${n.where}${at}` : `awake at ${n.where}${at}`);
  set('signed', n.asleep ? `signed before bed · asleep in ${n.where}` : `signed at ${n.where}${at}`);
  const hr = new Date().getHours(); set('clock', hr >= 20 || hr < 6 ? 'Night' : hr < 9 ? 'Dawn' : hr < 17 ? 'Day' : 'Dusk');
  $('#pondWord').setAttribute('aria-label', `Pond: live view of Labcoon’s field. ${n.asleep ? 'He’s asleep. Tiptoe in.' : `He’s awake at ${n.where}. Go in.`}`);
  $('#creditCoon').setAttribute('aria-label', `Labcoon, as himself: ${n.asleep ? 'asleep' : 'awake at ' + n.where}. Go in to his field.`);
  pond.make();
});

/* ---------------- one loop ---------------- */
let lastY = scrollY, lastT = performance.now(), sv2 = 0;
const fly = $('#fly .fly-word'), fin = $('.fin-word');
function pinP(el) { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - vh())); }
function frame(t) {
  const y = scrollY, dt = Math.max(1, t - lastT); sv2 = lerp(sv2, (y - lastY) / dt * 1000, .25); lastY = y; lastT = t;
  hero.update(t, sv2);
  portrait.update(t);
  // ink headlines: scroll speed stirs the water
  for (const i of inks) i.ink.frame(t);   // headlines only ripple under the finger, never from scrolling
  // collage parallax
  const H = vh();
  for (const c of collage) { const r = c.el.getBoundingClientRect(); if (r.bottom < -200 || r.top > H + 200) continue; c.el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - H / 2) * c.s).toFixed(1)}px, 0)`; }
  // films: the centre row plays inline on touch
  if (!fine) { let best = -1, bd = 1e9; rows.forEach((r, i) => { const b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - H * .5); if (d < bd && b.top < H * .78 && b.bottom > H * .22) { bd = d; best = i; } }); setRow(best); }
  else if (follow.update) follow.update();
  // sites: scroll picks the card
  { const el = $('#sites'), r = el.getBoundingClientRect(), sp = pinP(el);
    const visible = r.bottom > 0 && r.top < H;
    const index = siteHover >= 0 ? siteHover : Math.min(scards.length - 1, Math.floor(sp * scards.length));
    requestSite(visible ? index : -1); }
  // fly: drone pans over the field inside the letters
  { const r = fly.getBoundingClientRect(); if (r.bottom > 0 && r.top < H) { const k = clamp(1 - (r.top + r.height) / (H + r.height)); fly.style.setProperty('--fy', (15 + k * 70).toFixed(1) + '%'); fly.style.setProperty('--fx', (40 + k * 25).toFixed(1) + '%'); } }
  { const r = fin.getBoundingClientRect(); if (r.top < H) fin.style.setProperty('--finY', (20 + clamp(1 - r.top / H) * 60).toFixed(1) + '%'); }
  // credits crawl
  { const p = pinP(credits); roll.style.transform = `translate3d(0, ${(-p * Math.max(0, roll.offsetHeight - H)).toFixed(1)}px, 0)`; }
  creditCoon.update(t);
  requestAnimationFrame(frame);
}
introDone.then(() => { for (const v of hero.vids) v.play().catch(() => {}); });
requestAnimationFrame(frame);
/* iOS: a first touch unlocks autoplay for anything that refused */
addEventListener('touchend', () => { hero.vids[0].paused && hero.vids[0].play().catch(() => {}); }, {once: true, passive: true});
