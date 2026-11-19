/* LaB studio prototype: one room, Golden Hour at the window, Events on the next wall.
   Geometry comes from studio/blender (exported as assets/loft.glb). Light, sky, dust and
   materials are rebuilt here so the page stays light. Blender coords (x, y, z) = three (x, z, -y). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const $ = id => document.getElementById(id);
const PLACE = { lat: 42.67, lon: -83.03, tz: 'America/Detroit', label: 'Shelby Township, MI' };
const WINDOW_FACES = 232;                 // compass bearing the big window looks toward (matches build_loft.py)
const quiet = matchMedia('(prefers-reduced-motion: reduce)');
const params = new URLSearchParams(location.search);

/* ------------------------------------------------------------------ time */
const fmtParts = new Intl.DateTimeFormat('en-US', { timeZone: PLACE.tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const fmtClock = new Intl.DateTimeFormat('en-US', { timeZone: PLACE.tz, hour: 'numeric', minute: '2-digit' });
function zoneOffset(ms) {
  const p = Object.fromEntries(fmtParts.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return Date.UTC(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - ms;
}
function instant(dateStr, minute) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, minute);
  return new Date(guess - zoneOffset(guess - zoneOffset(guess)));
}
function localParts(date) {
  const p = Object.fromEntries(fmtParts.formatToParts(date).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minute: (+p.hour % 24) * 60 + +p.minute };
}
const minuteOf = date => localParts(date).minute;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

const now = localParts(new Date());
const state = {
  date: /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : now.date,
  minute: null, day: null, sun: { azimuth: 0, elevation: -20 },
  view: 0, // continuous camera position along the stops
};
function setDay() {
  state.day = LaBSun.getDay(state.date, PLACE.lat, PLACE.lon);
  const d = state.day;
  const lo = minuteOf(d.civilDawn) - 30, hi = minuteOf(d.civilDusk) + 45;
  const scrub = $('scrub'); scrub.min = lo; scrub.max = hi;
  const at = t => ((minuteOf(t) - lo) / (hi - lo)) * 100;
  // the track is painted with the day's light: blue hour, golden, day, golden, blue hour
  const stopsCss = [['#1d2950', 0], ['#3c4c86', at(d.civilDawn)], ['#e8a35c', at(d.sunrise)], ['#f1c98a', at(d.morningGoldenEnd)], ['#cfd9e0', at(d.morningGoldenEnd) + 2], ['#cfd9e0', at(d.eveningGoldenStart) - 2], ['#f1c98a', at(d.eveningGoldenStart)], ['#e8873f', at(d.sunset)], ['#3c4c86', at(d.civilDusk)], ['#1d2950', 100]];
  $('scrub').style.setProperty('--track', `linear-gradient(90deg,${stopsCss.map(([c, p]) => `${c} ${clamp(p, 0, 100).toFixed(1)}%`).join(',')})`);
  $('ticks').innerHTML = [['Sunrise', d.sunrise], ['Sunset', d.sunset]].map(([n, t], i) => `<span class="${i ? 'end' : 'start'}" style="left:${clamp(at(t), 0, 100)}%">${n} ${fmtClock.format(t)}</span>`).join('');
  $('facts').textContent = `${PLACE.label} · sunrise ${fmtClock.format(d.sunrise)} · golden ${fmtClock.format(d.eveningGoldenStart)} · sunset ${fmtClock.format(d.sunset)} · blue hour ends ${fmtClock.format(d.civilDusk)}`;
  return [lo, hi];
}
{
  const [lo, hi] = setDay();
  const asked = parseInt(params.get('minute'), 10);
  let m = Number.isFinite(asked) ? asked : (state.date === now.date ? now.minute : minuteOf(state.day.eveningGoldenStart) + 10);
  // after dark with no time asked for: open at golden hour, the room's best light
  if (!Number.isFinite(asked) && (m < lo || m > hi)) m = minuteOf(state.day.eveningGoldenStart) + 10;
  state.minute = clamp(m, lo, hi);
  $('scrub').value = state.minute; $('date').value = state.date;
}

/* ------------------------------------------------------------------ url */
const STOPS_WIDE = ['window', 'events', 'fridge', 'projector'];
const STOPS_TALL = ['window', 'calendar', 'board', 'fridge', 'projector'];
// names a link or button can ask for, mapped onto the current shape's stops
const alias = name => { name = { story: 'fridge', ideas: 'fridge', work: 'projector', films: 'projector' }[name] || name; return stops === STOPS_TALL ? ({ events: 'calendar' }[name] || name) : ({ calendar: 'events', board: 'events' }[name] || name); };
let stops = STOPS_WIDE;
function stopName() { return stops[Math.round(state.view)]; }
let urlTimer;
function writeURL() {
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => {
    const u = new URL(location.href);
    u.searchParams.set('date', state.date); u.searchParams.set('minute', String(state.minute));
    const name = stopName();
    u.hash = name === 'calendar' ? 'events' : name;
    history.replaceState(null, '', u);
  }, 120);
}

/* ------------------------------------------------------------------ calendar (real listings) */
const records = [...SPOTLIGHT].sort((a, b) => a.date.localeCompare(b.date));
const todayStr = now.date;
const ended = r => (r.until || r.date) < todayStr;
const plainText = html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent; };
let calYear = +state.date.slice(0, 4), calMonth = +state.date.slice(5, 7) - 1;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function eventsIn(y, m) {
  const key = `${y}-${String(m + 1).padStart(2, '0')}`;
  return records.filter(r => r.date.startsWith(key) || (r.until && r.date <= `${key}-31` && r.until >= `${key}-01`));
}
function renderCalendar(direction = 0) {
  const page = $('calPage');
  const draw = () => {
    $('calMonth').innerHTML = `${MONTHS[calMonth]} <span>${calYear}</span>`;
    const first = new Date(Date.UTC(calYear, calMonth, 1)).getUTCDay();
    const days = new Date(Date.UTC(calYear, calMonth + 1, 0)).getUTCDate();
    const list = eventsIn(calYear, calMonth);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const n = i - first + 1;
      if (i >= 35 && n > days) break;
      if (n < 1 || n > days) { cells.push('<li class="out" aria-hidden="true"></li>'); continue; }
      const ds = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      const hits = list.filter(r => r.date === ds || (r.until && r.date <= ds && r.until >= ds));
      const cls = [ds === todayStr ? 'today' : '', hits.length ? 'has' : '', hits.length && hits.every(ended) ? 'past' : ''].join(' ');
      cells.push(hits.length
        ? `<li class="${cls}"><span class="ring" aria-hidden="true"></span>${n}<span class="tag" aria-hidden="true">${plainText(hits[0].title).split(':')[0]}</span><button type="button" data-id="${hits[0].id}" aria-label="${MONTHS[calMonth]} ${n}: ${plainText(hits[0].title)}"></button></li>`
        : `<li class="${cls}">${n}</li>`);
    }
    $('calGrid').innerHTML = cells.join('');
    const fmtDay = ds => new Date(ds + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    if (list.length) {
      $('calAgenda').innerHTML = `<ul>${list.map(r => `<li class="${ended(r) ? 'past' : ''}" id="ag-${r.id}"><span class="when">${fmtDay(r.date)}</span><span class="what"><a href="${r.url || r.byUrl}" target="_blank" rel="noopener">${plainText(r.title)}</a><span class="where">${r.venue || r.where || r.by || ''}${ended(r) ? ' · happened' : ''}</span></span></li>`).join('')}</ul>`;
    } else {
      const next = records.find(r => r.date > `${calYear}-${String(calMonth + 1).padStart(2, '0')}-31`);
      const last = [...records].reverse().find(r => r.date < `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`);
      const jump = next || last;
      $('calAgenda').innerHTML = `<p class="empty">Nothing pinned for ${MONTHS[calMonth]} yet.${jump ? ` <button type="button" data-jump="${jump.date}">${next ? 'Next' : 'Latest'}: ${plainText(jump.title)}, ${fmtDay(jump.date)} ${next ? '→' : '←'}</button>` : ''}</p>`;
    }
    calendarTexture?.(); // keep the 3D paper's printed copy in step
  };
  if (!direction || quiet.matches || document.body.classList.contains('plain')) return draw();
  // flip the page up off the rail, swap it, let it fall back
  const a = page.animate([{ transform: 'perspective(1400px) rotateX(0deg)', opacity: 1 }, { transform: `perspective(1400px) rotateX(${direction > 0 ? 70 : -40}deg)`, opacity: .2 }], { duration: 180, easing: 'ease-in' });
  a.onfinish = () => { draw(); page.animate([{ transform: `perspective(1400px) rotateX(${direction > 0 ? -25 : 25}deg)`, opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.2,.9,.3,1.2)' }); };
}
function shiftMonth(delta) {
  calMonth += delta; if (calMonth < 0) { calMonth = 11; calYear--; } if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar(delta);
}
$('calPrev').onclick = () => shiftMonth(-1);
$('calNext').onclick = () => shiftMonth(1);
$('calendar').addEventListener('click', e => {
  const jump = e.target.closest('[data-jump]');
  if (jump) { const [y, m] = jump.dataset.jump.split('-').map(Number); const delta = (y - calYear) * 12 + (m - 1 - calMonth); calYear = y; calMonth = m - 1; renderCalendar(Math.sign(delta)); return; }
  const day = e.target.closest('[data-id]');
  if (day) { const row = $('ag-' + day.dataset.id); row?.querySelector('a')?.focus(); }
});
let calendarTexture = null;
renderCalendar();

/* ------------------------------------------------------------------ flyer data */
const flyer = records.find(r => r.photos?.length) || records[records.length - 1];
const flyerArt = '../room/light/kickoff-art.webp';
$('flyerName').textContent = plainText(flyer.title);
$('flyerImg').src = flyerArt;
$('flyerImg').alt = typeof flyer.photos?.[0] === 'object' ? flyer.photos[0].alt : `Flyer for ${plainText(flyer.title)}`;
$('flyerWhen').textContent = new Date(flyer.date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) + (flyer.time ? ' · ' + plainText(flyer.time) : '');
$('flyerTitle').innerHTML = flyer.title;
$('flyerWhere').textContent = [flyer.venue, flyer.address].filter(Boolean).join(' · ');
$('flyerBody').innerHTML = flyer.body || '';
$('flyerLink').href = flyer.url || flyer.byUrl;

/* ------------------------------------------------------------------ story magnets (ideas-data.js) */
const TONES = [[null, 'Any'], ['drama', 'Drama'], ['comedy', 'Comedy'], ['dark', 'Dark'], ['thriller', 'Thriller'], ['mystery', 'Mystery'], ['horror', 'Horror'], ['tender', 'Tender'], ['experimental', 'Experimental'], ['scifi', 'Sci-Fi'], ['action', 'Action'], ['satire', 'Satire'], ['docu', 'Documentary'], ['noir', 'Neo-Noir']];
const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let idea = null, audio = null;
$('tone').innerHTML = TONES.map(([id, label]) => `<option value="${id || ''}">${label}</option>`).join('');
{ const t = params.get('tone'); if (t && TONES.some(([id]) => id === t)) $('tone').value = t; }
function rollStory() {
  if (!window.rollIdea || !window.ideasData) return { concept: 'The magnet tin is empty.', rows: [['Try', 'the full story generator']] };
  const tone = $('tone').value || null;
  const r = window.rollIdea(window.ideasData, tone ? { tone } : {}), t = r.text;
  return {
    concept: t.concept, genre: t.genre,
    rows: [r.picks.place?.fromConcept ? null : ['Place', t.place], ['Who', t.character], ['Thing', t.object], ['Twist', t.twist]].filter(x => x && x[1]),
  };
}
function writeIdea() {
  $('ideaConcept').textContent = idea.concept;
  $('ideaBrief').innerHTML = idea.rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
}
function sound(kind) {
  // synthesised, quiet: a door thunk, or one magnet slapping onto steel
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const t0 = audio.currentTime;
    const hit = (at, freq, len, gain, q = 1.4) => {
      const buf = audio.createBuffer(1, Math.ceil(audio.sampleRate * len), audio.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      const src = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
      src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = gain;
      src.connect(f).connect(g).connect(audio.destination); src.start(t0 + at);
    };
    if (kind === 'door') { hit(0, 260, .08, .25); hit(.5, 120, .16, .6, .8); hit(.51, 1800, .04, .18); }
    else hit(0, 2600 + Math.random() * 900, .025, .07);
  } catch { /* no audio: the door still shuts */ }
}
idea = rollStory(); writeIdea();

/* ------------------------------------------------------------------ selected work (local reels, full films on YouTube) */
const FILMS = {
  moz: { title: 'MOZ Interiors', src: '../assets/selected-work/moz-interior-v3.mp4', poster: '../assets/selected-work/moz-interior-v3.jpg', yt: 'https://www.youtube.com/watch?v=HtF4L9RpkaU',
    note: 'The textures, light and character of a Detroit-designed space. July 2024 · Bobby: A-camera and edit · Larry: B-camera · filmed in one day.' },
  brass: { title: 'Anthony Brass', src: '../assets/hero-v4/AnthonyBrass-Paintingclip.mp4', poster: '../assets/hero-v4/AnthonyBrass-Paintingclip.jpg', yt: 'https://www.youtube.com/watch?v=CPvxM8GrCg8',
    note: 'Inside Anthony’s home studio: his paintings, his process, his story in his own words. March 2024 · Bobby: A-camera and edit · Larry: B-camera.' },
};
let filmId = FILMS[params.get('film')] ? params.get('film') : 'moz', filmPaused = quiet.matches, reelBoost = 0;
const film = $('film');
function loadFilm(id) {
  filmId = id; const f = FILMS[id];
  film.src = f.src; film.poster = f.poster;
  $('filmTitle').textContent = f.title; $('filmNote').textContent = f.note; $('filmLink').href = f.yt;
  document.querySelectorAll('.reel').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.film === id)));
}
function syncFilm() {
  // only roll film while you are looking at it and the page is visible
  const want = !filmPaused && !document.hidden && !document.body.classList.contains('plain') && stopName() === 'projector';
  if (want && film.paused) film.play().catch(() => { filmPaused = true; $('playPause').textContent = $('cinemaPause').textContent = 'Play'; });
  if (!want && !film.paused) film.pause();
  $('playPause').textContent = $('cinemaPause').textContent = filmPaused ? 'Play' : 'Pause';
}
document.querySelectorAll('.reel').forEach(b => b.addEventListener('click', async () => {
  if (b.dataset.film === filmId) return;
  const u = new URL(location.href); u.searchParams.set('film', b.dataset.film); history.replaceState(null, '', u);
  if (quiet.matches || document.body.classList.contains('plain')) { loadFilm(b.dataset.film); syncFilm(); return; }
  // change reels: the picture flares and drops out, the reels whip round, the new film threads in
  film.classList.add('flash'); reelBoost = 1; sound('slap');
  await new Promise(r => setTimeout(r, 260));
  loadFilm(b.dataset.film); film.classList.remove('flash'); syncFilm();
}));
$('playPause').addEventListener('click', () => { filmPaused = !filmPaused; syncFilm(); });
$('cinemaPause').addEventListener('click', () => { filmPaused = !filmPaused; syncFilm(); });
$('bigScreen').addEventListener('click', () => {
  film.controls = true;
  if (film.requestFullscreen) film.requestFullscreen().catch(() => film.webkitEnterFullscreen?.());
  else film.webkitEnterFullscreen?.();     // iPhone Safari: the native player
});
for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(ev, () => { if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.body.classList.contains('plain')) film.controls = false; });
film.addEventListener('webkitendfullscreen', () => { if (!document.body.classList.contains('plain')) film.controls = false; });
loadFilm(filmId);

/* ------------------------------------------------------------------ plain view */
function setPlain(on, remember = true) {
  // Flat view is its own page (flat.js renders into #flat); the 3D room just steps aside and hands over the state.
  document.body.classList.toggle('plain', on);
  $('plainToggle').setAttribute('aria-pressed', String(on));
  $('plainToggle').textContent = on ? '3D room' : 'Flat view';
  if (remember) try { localStorage.setItem('lab-studio-plain', on ? '1' : '0'); } catch { }
  $('flat').hidden = !on;
  syncFilm();
  document.dispatchEvent(new CustomEvent('lab:flat', { detail: { on, hash: location.hash.slice(1) || stopName() } }));
  if (!on) {
    window.scrollTo(0, 0);
    // let the flat view finish writing the URL first, then take the state from it
    requestAnimationFrame(() => setTimeout(() => { readURL(); if (!renderer) boot3D(); else { resize(); needsFrame = true; } }, 0));
  }
}
// coming back from the flat view: it rewrote the URL, so take date, time, tone, film and wall from there
function readURL() {
  const q = new URLSearchParams(location.search);
  const d = q.get('date');
  if (/^\d{4}-\d{2}-\d{2}$/.test(d || '') && d !== state.date) { state.date = d; $('date').value = d; setDay(); calYear = +d.slice(0, 4); calMonth = +d.slice(5, 7) - 1; renderCalendar(); }
  const m = parseInt(q.get('minute'), 10);
  if (Number.isFinite(m)) { state.minute = clamp(m, +$('scrub').min, +$('scrub').max); $('scrub').value = state.minute; }
  const t = q.get('tone') || '';
  if (TONES.some(([id]) => (id || '') === t) && $('tone').value !== t) { $('tone').value = t; if (door && !shaking) { idea = rollStory(); writeIdea(); for (const it of [...magnets.children]) { magnets.remove(it); it.traverse(o => o.userData.dispose?.()); } placeIdea(idea, true); } }
  const f = q.get('film');
  if (FILMS[f] && f !== filmId) loadFilm(f);
  const idx = stops.indexOf(alias(location.hash.slice(1) || 'window'));
  if (idx >= 0) { state.view = idx; anim = null; }
  applySun(); settle();
}
$('plainToggle').onclick = () => setPlain(!document.body.classList.contains('plain'));
document.querySelector('[data-plain]').onclick = () => { setPlain(true); $('flat').focus?.(); };

/* ------------------------------------------------------------------ 3D */
const shade = { fabric: null, hem: null };
let ground, farTrees, country, projector, reels = [], door = null, magnets = null, debris = [], treeLine, renderer, scene, camera, sunLight, hemi, bounce, practicalLights = [], bulbMat, sky, shafts, dust, flyerMesh, calPaperMat;
const tmp = new THREE.Vector3();
const B = (x, y, z) => new THREE.Vector3(x, z, -y);       // Blender -> three
const WIN = { x: -3.2, y0: 0.45, y1: 3.0, z0: -1.5, z1: 1.5 };
const CAL = { c: B(-1.05, 2.588, 1.62), w: 0.80, h: 1.02 };
const FLY = { c: B(0.42, 2.5585, 1.66), w: 0.216, h: 0.279 };
// projector on its cart (Blender 0.5, -1.5) throws a 1.5 x 1.0 m picture on the east wall
const PJ = { lens: B(0.80, -1.5, 0.80), c: new THREE.Vector3(2.996, 1.5, 1.5), w: 1.5, h: 0.844 };
// fridge after the Smeg FAB28 (1530 x 601 x 728 mm): pillow door face at x 2.257, right-hinged on the south edge,
// lever handle on the north (left) edge at 0.97 m. Blender y 0.902..1.499 = three z -1.499..-0.902.
const FR = { face: 2.255, z0: -1.499, z1: -0.902, y0: 0.075, y1: 1.526, hinge: new THREE.Vector3(2.2945, 0, -0.902) };

function sunVector(az, el) {   // unit vector pointing at the sun, room space
  const A = THREE.MathUtils.degToRad(az + 270 - WINDOW_FACES), E = THREE.MathUtils.degToRad(el);
  return new THREE.Vector3(Math.sin(A) * Math.cos(E), Math.sin(E), -Math.cos(A) * Math.cos(E));
}

/* procedural textures: seeded so every visit sees the same room */
function rng(seed) { return () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) ^ Math.imul(seed ^ (seed >>> 13), 3266489909), (seed ^= seed >>> 16) >>> 0) / 4294967296); }
function canvasTex(size, draw, { color = true, repeat = [1, 1] } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function speckle(g, s, r, n, colors, min, max, alpha) {
  for (let i = 0; i < n; i++) { g.globalAlpha = alpha * r(); g.fillStyle = colors[(r() * colors.length) | 0]; const d = min + r() * (max - min); g.beginPath(); g.arc(r() * s, r() * s, d, 0, 7); g.fill(); }
  g.globalAlpha = 1;
}
const TEX = {
  plaster: () => canvasTex(512, (g, s) => { const r = rng(3); g.fillStyle = '#d6cbb8'; g.fillRect(0, 0, s, s); speckle(g, s, r, 900, ['#cbbfa9', '#e0d7c6', '#c4b8a2'], 6, 40, .25); speckle(g, s, r, 4000, ['#b9ad97', '#efe7d8'], .5, 1.6, .35); }, { repeat: [0.5, 0.5] }),
  brick: (bump) => canvasTex(1024, (g, s) => {
    const r = rng(11), bw = s * 0.205, bh = s * 0.068, m = 5;
    g.fillStyle = bump ? '#333' : '#d9d2c6'; g.fillRect(0, 0, s, s);
    for (let row = 0; row * bh < s; row++) for (let col = -1; col * bw < s; col++) {
      const x = col * bw + (row % 2) * bw / 2, y = row * bh;
      const tone = r();
      g.fillStyle = bump ? `rgb(${190 + tone * 50},${190 + tone * 50},${190 + tone * 50})` : `hsl(${18 + tone * 10},${16 + tone * 14}%,${56 + tone * 12}%)`;
      g.fillRect(x + m / 2, y + m / 2, bw - m, bh - m);
    }
    if (!bump) {
      for (let k = 0; k < 220; k++) { const x = r() * s, w = 14 + r() * 50, y = r() * s, h = 60 + r() * 300; const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(240,235,226,0)'); gr.addColorStop(.5, `rgba(240,235,226,${.12 + r() * .22})`); gr.addColorStop(1, 'rgba(240,235,226,0)'); g.fillStyle = gr; g.fillRect(x, y, w, h); }
      speckle(g, s, r, 3000, ['#a8826c', '#efe9de'], .6, 2, .25);
    }
  }, { color: !bump }),
  oak: (bump) => canvasTex(1024, (g, s) => {   // 1024 px = 2 m; planks 0.18 m wide run along x
    const r = rng(5), pw = s * 0.09;
    for (let row = 0; row * pw < s; row++) {
      let x = -r() * s * .6;
      while (x < s) {
        const len = s * (0.45 + r() * 0.6), tone = r();
        g.fillStyle = bump ? '#bdbdbd' : `hsl(${30 + tone * 6},${38 + tone * 14}%,${44 + tone * 14}%)`;
        g.fillRect(x, row * pw, len, pw);
        if (!bump) for (let k = 0; k < 26; k++) { g.globalAlpha = .08 + r() * .12; g.fillStyle = r() > .5 ? '#5a3a20' : '#e9c99c'; const yy = row * pw + r() * pw; g.fillRect(x, yy, len, .6 + r() * 1.6); }
        g.globalAlpha = 1; g.fillStyle = bump ? '#222' : '#3a2616'; g.fillRect(x, row * pw, 2, pw); x += len;
      }
      g.fillStyle = bump ? '#222' : '#2e1e12'; g.fillRect(0, row * pw, s, 2);
    }
  }, { color: !bump, repeat: [0.5, 0.5] }),
  grain: (base, seed) => canvasTex(512, (g, s) => { const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, s, s); for (let k = 0; k < 260; k++) { g.globalAlpha = .05 + r() * .12; g.fillStyle = r() > .5 ? '#000' : '#fff'; g.fillRect(0, r() * s, s, .5 + r() * 2); } }, { repeat: [1, 1] }),
  cork: () => canvasTex(512, (g, s) => { const r = rng(9); g.fillStyle = '#a77a4d'; g.fillRect(0, 0, s, s); speckle(g, s, r, 9000, ['#7a4f2a', '#c49768', '#8e623a', '#d8b183'], .6, 2.6, .8); }, { repeat: [1.5, 1.5] }),
  rug: () => canvasTex(512, (g, s) => { const r = rng(4); g.fillStyle = '#6e2a1a'; g.fillRect(0, 0, s, s); for (let i = 0; i < 18; i++) { g.fillStyle = ['#8c3a22', '#4f1d14', '#b27a43', '#2f3a3a'][i % 4]; g.globalAlpha = .55; g.fillRect(0, i * s / 18 + 6, s, s / 60); } g.globalAlpha = 1; speckle(g, s, r, 6000, ['#5a2014', '#8a3c26'], .6, 1.4, .5); }, { repeat: [0.4, 0.4] }),
};

/* scanned CC0 surfaces (Poly Haven, assets/tex/CREDITS.md): colour, OpenGL normal and roughness maps,
   tiled at the scan's real size on the room's metre UVs */
function scanned(id, metres) {
  const L = new THREE.TextureLoader(), rep = 1 / metres;
  const load = (suffix, color) => { const t = L.load(`assets/tex/${id}_${suffix}.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8; if (color) t.colorSpace = THREE.SRGBColorSpace; return t; };
  return { map: load('diff', true), normalMap: load('nor_gl'), roughnessMap: load('rough') };
}
function makeMaterials() {
  return {
    M_Limewash: new THREE.MeshStandardMaterial({ ...scanned('painted_plaster_wall', 2), color: '#f4e9d8', roughness: 1, normalScale: new THREE.Vector2(.8, .8) }),
    M_LimewashBrick: new THREE.MeshStandardMaterial({ ...scanned('painted_worn_brick', 1.8), color: '#fbf3e6', roughness: 1, normalScale: new THREE.Vector2(1.2, 1.2) }),
    M_OakFloor: new THREE.MeshStandardMaterial({ ...scanned('wood_floor_worn', 2), color: '#efe2d0', roughness: .9, normalScale: new THREE.Vector2(.9, .9) }),
    M_FirBeam: new THREE.MeshStandardMaterial({ map: TEX.grain('#7a5434', 21), roughness: .8 }),
    M_Walnut: new THREE.MeshStandardMaterial({ map: TEX.grain('#4a2f1e', 22), roughness: .5 }),
    M_Cork: new THREE.MeshStandardMaterial({ map: TEX.cork(), roughness: 1 }),
    M_Paper: new THREE.MeshStandardMaterial({ color: '#ece6d8', roughness: .85 }),
    M_BlackSteel: new THREE.MeshStandardMaterial({ color: '#1b1b1b', roughness: .45, metalness: .6 }),
    M_RugWool: new THREE.MeshStandardMaterial({ map: TEX.rug(), roughness: 1 }),
    M_Canvas: new THREE.MeshStandardMaterial({ color: '#b5ab95', roughness: .95 }),
    M_GearBlack: new THREE.MeshStandardMaterial({ color: '#141416', roughness: .5 }),
    M_Aluminium: new THREE.MeshStandardMaterial({ color: '#a9abae', roughness: .35, metalness: 1 }),
    M_ProjectorBeige: new THREE.MeshStandardMaterial({ color: '#b6a585', roughness: .55 }),
    M_WindowGlass: new THREE.MeshBasicMaterial({ color: '#cfe2e8', transparent: true, opacity: .025, depthWrite: false }),
    M_FridgeEnamel: new THREE.MeshPhysicalMaterial({ color: '#7e9d8c', roughness: .34, clearcoat: .5, clearcoatRoughness: .25 }),
    M_Chrome: new THREE.MeshStandardMaterial({ color: '#e6e8ec', roughness: .08, metalness: 1 }),
    M_Stainless: new THREE.MeshStandardMaterial({ color: '#b9bcbf', roughness: .32, metalness: 1 }),
    M_Gasket: new THREE.MeshStandardMaterial({ color: '#111', roughness: .7 }),
    M_ShadeLinen: new THREE.MeshStandardMaterial({ map: TEX.grain('#3b3631', 41), roughness: 1, side: THREE.DoubleSide }),
    M_TinRed: new THREE.MeshStandardMaterial({ color: '#8c1d12', roughness: .35, metalness: .3 }),
    M_ProjectorGrey: new THREE.MeshStandardMaterial({ color: '#2b2e2b', roughness: .45, metalness: .2 }),
    M_Bulb: new THREE.MeshStandardMaterial({ color: '#fff3df', emissive: '#ffb066', emissiveIntensity: 0 }),
  };
}

/* sky dome: gradient + sun glow, driven by solar elevation */
/* sky dome: scattering gradient, a sun halo, golden-hour clouds. It carries its own exposure (expComp) so the
   room's camera exposure (dusk lamps, screenings) never changes how the outside looks. */
const NOISE = `
  float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
  float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=.5; } return v; }`;
function makeSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { sunDir: { value: new THREE.Vector3(0, 1, 0) }, zenith: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, glow: { value: new THREE.Color() },
      sunAmt: { value: 1 }, golden: { value: 0 }, expComp: { value: 1 }, time: { value: 0 }, night: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 sunDir,zenith,horizon,glow; uniform float sunAmt,golden,expComp,time,night; varying vec3 vDir;
      ${NOISE}
      void main(){ vec3 d=normalize(vDir); vec3 sd=normalize(sunDir); float h=clamp(d.y,0.,1.);
        vec3 c=mix(horizon,zenith,pow(h,.5));
        float s=max(dot(d,sd),0.);
        // forward scattering: a wide halo, a tight bloom, the disc
        c+=glow*(pow(s,4.)*.32+pow(s,26.)*.7+pow(s,240.)*1.6)*(1.-h*.5);
        // golden hour: the band of fire along the horizon, strongest under the sun
        vec2 a=normalize(d.xz+1e-4), b=normalize(sd.xz+1e-4); float toward=max(dot(a,b),0.);
        c+=glow*golden*pow(1.-h,7.)*(.25+.75*pow(toward,3.))*1.1;
        // clouds on a high deck, lit from below when the sun is low
        if(d.y>.015){
          vec2 uv=d.xz/(d.y+.12)*.55+vec2(time*.0035,time*.001);
          float n=fbm(uv*1.3), n2=fbm(uv*3.1+7.);
          float cov=smoothstep(.4,.7,n*.8+n2*.25)*smoothstep(.015,.2,d.y)*(1.-smoothstep(.6,.95,h));
          vec3 lit=mix(vec3(.92,.93,.96),vec3(1.,.6,.34),golden)*(.55+1.1*pow(s,2.));
          vec3 shade=mix(zenith*.85+.06,vec3(.42,.3,.38),golden);
          vec3 cc=mix(shade,lit,smoothstep(.45,.9,n2+pow(s,3.)*.35));
          cc=mix(cc,zenith*.25,night);
          c=mix(c,cc,cov*.88);
        }
        c+=vec3(1.,.95,.86)*smoothstep(.99952,.99974,s)*7.*sunAmt;
        if(d.y<0.) c=mix(horizon*.7,horizon*.35,clamp(-d.y*5.,0.,1.));
        gl_FragColor=vec4(c*expComp,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), mat);
  m.frustumCulled = false; m.renderOrder = -3;
  return m;
}

/* the field: stubble rows and aerial haze, lit by the sun but blind to the room's lights */
function makeGround() {
  const mat = new THREE.ShaderMaterial({
    uniforms: { sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sky: { value: new THREE.Color() }, haze: { value: new THREE.Color() }, expComp: { value: 1 }, sunAmt: { value: 1 } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 sunDir,sunCol,sky,haze; uniform float expComp,sunAmt; varying vec3 vW;
      ${NOISE}
      void main(){
        vec2 p=vW.xz;
        float rows=.5+.5*sin(p.y*2.4+noise(p*.05)*6.);              // harvested rows running away from the window
        float patchy=fbm(p*.035), fine=noise(p*.9);
        vec3 stubble=mix(vec3(.30,.25,.12),vec3(.48,.39,.2),patchy);
        stubble=mix(stubble,vec3(.2,.24,.12),smoothstep(.55,.8,fbm(p*.012+3.)));   // green where the rye came up
        float furrow=pow(rows,3.);                                   // low sun: every furrow throws a shadow
        stubble*=(.5+.62*furrow)*(.85+.3*fine);
        stubble=mix(stubble,vec3(.16,.11,.07),smoothstep(.6,.85,fbm(p*.02+9.))*.7);   // bare dark soil patches
        float lambert=max(sunDir.y,0.);
        vec3 c=stubble*(sky*.38+sunCol*lambert*1.1*sunAmt);
        float dist=length(vW.xz-vec2(-3.,0.));
        c=mix(c,haze*.85,(1.-exp(-dist*.0032))*.85);                 // aerial perspective: light, and only far off
        gl_FragColor=vec4(c*expComp,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), mat);
  m.rotation.x = -Math.PI / 2; m.position.set(-400, -.25, 0); m.renderOrder = -2;
  return m;
}

/* a farm fence and a run of utility poles: scale and depth against the low sun */
function makeCountry() {
  const g = new THREE.Group(), r = rng(53);
  const wood = new THREE.MeshBasicMaterial({ color: '#2a2219' });
  const post = new THREE.CylinderGeometry(.06, .07, 1.3, 6), rail = new THREE.BoxGeometry(.04, .07, 2.6);
  for (let z = -34; z <= 34; z += 2.6) {
    const p = new THREE.Mesh(post, wood); p.position.set(-15 + (r() - .5) * .2, .4, z); p.rotation.z = (r() - .5) * .08; g.add(p);
    for (const y of [.55, .95]) { const rl = new THREE.Mesh(rail, wood); rl.position.set(-15, y + (r() - .5) * .04, z + 1.3); rl.rotation.x = (r() - .5) * .04; g.add(rl); }
  }
  const poleGeo = new THREE.CylinderGeometry(.13, .17, 11, 8), arm = new THREE.BoxGeometry(.12, .12, 2.4);
  const tops = [];
  for (let i = 0; i < 6; i++) {
    const z = -120 + i * 48 + (r() - .5) * 4, x = -58 - i * 1.5;
    const p = new THREE.Mesh(poleGeo, wood); p.position.set(x, 5.2, z); g.add(p);
    const a = new THREE.Mesh(arm, wood); a.position.set(x, 10.1, z); g.add(a);
    tops.push(new THREE.Vector3(x, 10.2, z));
  }
  // two sagging lines between the poles
  for (const off of [-1, 1]) {
    const pts = [];
    for (let i = 0; i < tops.length - 1; i++) for (let k = 0; k <= 16; k++) {
      const t = k / 16, a = tops[i], b = tops[i + 1];
      pts.push(new THREE.Vector3(mix(a.x, b.x, t), mix(a.y, b.y, t) - Math.sin(Math.PI * t) * 1.1, mix(a.z, b.z, t) + off * 1.05));
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#1a1611' })));
  }
  g.userData.wood = wood;
  return g;
}

/* a painted November tree line on a far ring: bare hardwoods, a few spruce, soft edges */
function makeTreeLine(radius = 170, seed = 31, height = 34) {
  const W = 4096, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), r = rng(seed);
  g.lineCap = 'round';
  const branch = (x, y, len, ang, w, depth) => {
    if (depth === 0 || len < 3) return;
    const x2 = x + Math.cos(ang) * len, y2 = y - Math.sin(ang) * len;
    g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
    const n = depth > 3 ? 2 : 3;
    for (let k = 0; k < n; k++) branch(x2, y2, len * (.62 + r() * .2), ang + (r() - .5) * 1.3, w * .62, depth - 1);
  };
  for (let layer = 0; layer < 2; layer++) {
    g.strokeStyle = g.fillStyle = layer ? 'rgba(26,30,24,1)' : 'rgba(48,52,48,.75)';
    for (let x = -40; x < W + 40; x += 14 + r() * 26) {
      const base = H - 4, h = (layer ? 150 : 110) + r() * (layer ? 190 : 120);
      if (r() < .06) { // the odd spruce, ragged
        g.beginPath(); g.moveTo(x, base - h * 1.05);
        for (let k = 0; k <= 14; k++) { const yy = base - h * 1.05 + k * h / 14, ww = k * h * .02 * (.6 + r() * .7); g.lineTo(x + ww, yy); }
        for (let k = 14; k >= 0; k--) { const yy = base - h * 1.05 + k * h / 14, ww = k * h * .02 * (.6 + r() * .7); g.lineTo(x - ww, yy); }
        g.fill();
      } else branch(x, base, h * .34, Math.PI / 2 + (r() - .5) * .2, 2.6 + r() * 2.5, 7);
    }
    g.fillRect(0, H - 14, W, 14);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const geo = new THREE.CylinderGeometry(radius, radius, height, 96, 1, true, Math.PI * 1.1, Math.PI * .8); // the window's half (centred on -x) of the horizon
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .02, side: THREE.BackSide, depthWrite: false, color: '#9aa08f', fog: false }));
  m.position.y = height / 2 - 1.5; m.renderOrder = -1;
  m.userData.tint = m.material.color;
  return m;
}

/* the beam: one soft frustum per pane so the mullions stripe the air */
function makeShafts() {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { color: { value: new THREE.Color(1, .8, .55) }, strength: { value: 0 }, time: { value: 0 } },
    vertexShader: `attribute float along; attribute vec2 edge; varying float vA; varying vec2 vE; varying vec3 vW;
      void main(){ vA=along; vE=edge; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 color; uniform float strength,time; varying float vA; varying vec2 vE; varying vec3 vW;
      float n(vec3 p){ return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453); }
      void main(){ float edge=smoothstep(0.,.35,vE.x)*smoothstep(0.,.35,1.-vE.x)*smoothstep(0.,.35,vE.y)*smoothstep(0.,.35,1.-vE.y);
        float fall=smoothstep(0.,.2,vA)*(1.-smoothstep(.55,1.,vA));
        float drift=.85+.15*sin(vW.x*3.1+time*.4)*sin(vW.y*2.3-time*.3);
        gl_FragColor=vec4(color*strength*edge*fall*drift*.018,1.); }`,
  });
  const group = new THREE.Group();
  const cols = [-1.5, -0.75, 0, 0.75, 1.5], rows = [0.45, 1.15, 1.85, 2.45, 3.0], inset = .03;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const g = new THREE.BufferGeometry();
    g.userData.pane = [cols[i] + inset, cols[i + 1] - inset, rows[j] + inset, rows[j + 1] - inset];
    const N = 6; // a few slices across the beam so edge falloff reads as volume
    const pos = [], along = [], edge = [], idx = [];
    for (let a = 0; a < 2; a++) for (let u = 0; u <= N; u++) for (let v = 0; v <= N; v++) { pos.push(0, 0, 0); along.push(a); edge.push(u / N, v / N); }
    const id = (a, u, v) => a * (N + 1) * (N + 1) + u * (N + 1) + v;
    for (let u = 0; u <= N; u++) for (let v = 0; v < N; v++) idx.push(id(0, u, v), id(1, u, v), id(1, u, v + 1), id(0, u, v), id(1, u, v + 1), id(0, u, v + 1));
    for (let v = 0; v <= N; v++) for (let u = 0; u < N; u++) idx.push(id(0, u, v), id(1, u, v), id(1, u + 1, v), id(0, u, v), id(1, u + 1, v), id(0, u + 1, v));
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('along', new THREE.Float32BufferAttribute(along, 1));
    g.setAttribute('edge', new THREE.Float32BufferAttribute(edge, 2));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 2;
    group.add(m);
  }
  group.userData.mat = mat;
  return group;
}
function hitRoom(p, dir) {   // distance along dir until the ray leaves the room interior
  let t = Infinity;
  if (dir.y < 0) t = Math.min(t, (0.01 - p.y) / dir.y);
  if (dir.x > 0) t = Math.min(t, (2.99 - p.x) / dir.x);
  if (dir.z > 0) t = Math.min(t, (2.59 - p.z) / dir.z);
  if (dir.z < 0) t = Math.min(t, (-2.59 - p.z) / dir.z);
  return t;
}
function updateShafts(toSun) {
  const L = toSun.clone().negate();
  for (const m of shafts.children) {
    const [z0, z1, y0, y1] = m.geometry.userData.pane;
    const pos = m.geometry.attributes.position, edge = m.geometry.attributes.edge, along = m.geometry.attributes.along;
    for (let k = 0; k < pos.count; k++) {
      const u = edge.getX(k), v = edge.getY(k);
      const p = new THREE.Vector3(WIN.x + .03, mix(y0, y1, v), mix(z0, z1, u));
      if (along.getX(k) > 0) p.addScaledVector(L, Math.min(hitRoom(p, L), 9));
      pos.setXYZ(k, p.x, p.y, p.z);
    }
    pos.needsUpdate = true;
  }
}

/* the projector's own light: a spot from the lens, a soft beam to the picture, a glowing lens */
function makeProjector() {
  const group = new THREE.Group();
  // the gate is a 16:9 rectangle: a soft-edged cookie makes the lamp throw a rectangle, not a round pool
  // lens shift: the throw lands square-on, so the light rides at the picture's height straight from the lens's distance
  const lensShifted = new THREE.Vector3(PJ.lens.x, PJ.c.y, PJ.c.z), throwDist = PJ.c.x - lensShifted.x;
  const R = Math.hypot(PJ.w / 2, PJ.h / 2) + .03;   // the cone must reach the picture's corners; the gate trims it to a rectangle
  const spot = new THREE.SpotLight('#fff0da', 0, 7, Math.atan(R / throwDist), 0, 1.2);
  {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
    const w = 256 * (PJ.w / 2) / R, h = 256 * (PJ.h / 2) / R; g.filter = 'blur(2px)'; g.fillStyle = '#fff'; g.fillRect(128 - w / 2, 128 - h / 2, w, h);
    spot.map = new THREE.CanvasTexture(c);
  }
  spot.castShadow = true; spot.shadow.mapSize.setScalar(512); spot.shadow.bias = -.0005;
  spot.position.copy(lensShifted); spot.target.position.copy(PJ.c); group.add(spot, spot.target);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { strength: { value: 0 }, time: { value: 0 } },
    vertexShader: `attribute vec2 uvw; varying vec2 vU; varying vec3 vW; void main(){ vU=uvw; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform float strength,time; varying vec2 vU; varying vec3 vW;
      void main(){ float along=vU.x, across=vU.y;
        float core=smoothstep(.5,.05,abs(across-.5));
        float flick=.92+.08*sin(time*47.)*sin(time*13.);
        float swirl=.75+.25*sin(vW.y*9.+time*.6)*sin(vW.z*7.-time*.4);
        gl_FragColor=vec4(vec3(1.,.93,.8)*strength*core*swirl*flick*(1.-along*.55)*smoothstep(0.,.06,along)*.05,1.); }`,
  });
  // four slices fanning from the lens to the picture's edges, crossed so it reads from any side
  const corners = quad(PJ.c, PJ.w * .96, PJ.h * .96, 'east');
  const pos = [], uv = [], idx = [];
  const lens = PJ.lens.clone().add(new THREE.Vector3(.04, 0, 0));
  const slices = [[corners[0], corners[2]], [corners[1], corners[3]], [corners[0].clone().lerp(corners[1], .5), corners[3].clone().lerp(corners[2], .5)], [corners[0].clone().lerp(corners[3], .5), corners[1].clone().lerp(corners[2], .5)]];
  slices.forEach(([a, b], i) => {
    const o = pos.length / 3;
    pos.push(lens.x, lens.y + .015, lens.z, lens.x, lens.y - .015, lens.z, a.x, a.y, a.z, b.x, b.y, b.z);
    uv.push(0, .45, 0, .55, 1, 0, 1, 1);
    idx.push(o, o + 2, o + 3, o, o + 3, o + 1);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uvw', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  const beam = new THREE.Mesh(g, mat); beam.frustumCulled = false; beam.renderOrder = 2; group.add(beam);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(.03, 24), new THREE.MeshBasicMaterial({ color: '#fff3dc' }));
  glow.position.copy(PJ.lens).add(new THREE.Vector3(.051, 0, 0)); glow.rotation.y = Math.PI / 2; group.add(glow);
  return { group, spot, mat, glow };
}

/* 16 mm reels: spoked discs built here (the blockout reels are plain), turning while the film rolls */
function buildReels(root) {
  const shape = new THREE.Shape(); shape.absarc(0, 0, .145, 0, Math.PI * 2, false);
  const hole = (x, y, r) => { const h = new THREE.Path(); h.absarc(x, y, r, 0, Math.PI * 2, true); shape.holes.push(h); };
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; hole(Math.cos(a) * .082, Math.sin(a) * .082, .042); }
  hole(0, 0, .009);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: .018, bevelEnabled: true, bevelSize: .002, bevelThickness: .002, bevelSegments: 1, curveSegments: 36 });
  geo.translate(0, 0, -.009);
  const mat = new THREE.MeshStandardMaterial({ color: '#b9bcbf', metalness: .85, roughness: .32 });
  const filmMat = new THREE.MeshStandardMaterial({ color: '#2a1d14', roughness: .45 });
  reels = reels.map((old, i) => {
    const p = old.getWorldPosition(new THREE.Vector3());
    old.visible = false;
    const g = new THREE.Group(); g.position.copy(p);
    const disc = new THREE.Mesh(geo, mat); disc.castShadow = true;
    // film wound on the hub: the feed reel full, the take-up reel thin
    const wound = new THREE.Mesh(new THREE.CylinderGeometry(i ? .07 : .118, i ? .07 : .118, .014, 40), filmMat);
    wound.rotation.x = Math.PI / 2; wound.castShadow = true;
    g.add(disc, wound); scene.add(g);
    return g;
  });
}
let lastReel = 0;
function stepReels(now) {
  const dt = Math.min(.05, (now - (lastReel || now)) / 1000); lastReel = now;
  const rolling = !film.paused || reelBoost > .01;
  if (rolling && !quiet.matches) reels.forEach((r, i) => r.rotation.z -= dt * (i ? 2.6 : 1.7) * (1 + reelBoost * 9));
  reelBoost *= Math.pow(.02, dt);
}

/* the fridge: magnetic-poetry words for the idea, four prop magnets pinning notes for the brief */
function wordTexture(text, { font = '600 46px Georgia, "Times New Roman", serif', h = 64, pad = 16, bg = '#fbf9f3', ink = '#000' } = {}) {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = font; const w = Math.ceil(g.measureText(text).width + pad * 2);
  c.width = w; c.height = h; g.font = font;
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, h - 4, w, 4);
  g.fillStyle = ink; g.textBaseline = 'middle'; g.fillText(text, pad, h / 2 + 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { tex: t, aspect: w / h };
}
function noteTexture(label, text, color) {
  const W = 420, H = 320, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#fbf6e4'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(80,120,170,.25)'; for (let y = 96; y < H; y += 44) g.fillRect(0, y, W, 2);
  g.fillStyle = color; g.font = '700 26px system-ui, sans-serif'; g.fillText(label.toUpperCase(), 22, 70);
  g.fillStyle = '#1c1915'; g.font = '30px Georgia, serif';
  const words = text.split(/\s+/); let line = '', y = 128;
  for (const w of words) { const test = line ? line + ' ' + w : w; if (g.measureText(test).width > W - 44 && line) { g.fillText(line, 22, y); line = w; y += 44; if (y > H - 10) break; } else line = test; }
  if (y <= H - 10) g.fillText(line, 22, y);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const tileEdge = new THREE.MeshStandardMaterial({ color: '#f4f1e8', emissive: '#3a372f', roughness: .6 });
function makeTile(word, h) {
  const { tex, aspect } = wordTexture(word), w = h * aspect;
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, .0025), tileEdge); body.castShadow = true;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: .55 }));
  face.position.z = .0014; g.add(body, face);
  g.userData.w = w; g.userData.dispose = () => { tex.dispose(); face.material.dispose(); body.geometry.dispose(); face.geometry.dispose(); };
  return g;
}
const enamel = c => new THREE.MeshStandardMaterial({ color: c, roughness: .3, metalness: .05 });
function makeProp(kind) {
  const g = new THREE.Group(), m = { place: enamel('#c8372d'), who: enamel('#e8b23a'), thing: new THREE.MeshStandardMaterial({ color: '#c9a046', metalness: .85, roughness: .3 }), twist: enamel('#2f6fb3') }[kind];
  const add = (geo, x = 0, y = 0, z = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.z = rz; o.castShadow = true; g.add(o); return o; };
  if (kind === 'place') { add(new THREE.BoxGeometry(.046, .03, .016), 0, -.008, .008); const roof = add(new THREE.ConeGeometry(.036, .024, 4), 0, .019, .008); roof.rotation.y = Math.PI / 4; add(new THREE.BoxGeometry(.01, .016, .004), .008, -.015, .017).material = enamel('#3b2a20'); }
  if (kind === 'who') { add(new THREE.SphereGeometry(.011, 16, 12), 0, .02, .01); const b = add(new THREE.CylinderGeometry(.009, .016, .028, 16), 0, -.006, .01); }
  if (kind === 'thing') { const r = add(new THREE.TorusGeometry(.012, .004, 10, 24), -.022, 0, .006); add(new THREE.BoxGeometry(.04, .006, .006), .01, 0, .006); add(new THREE.BoxGeometry(.006, .01, .006), .024, -.007, .006); add(new THREE.BoxGeometry(.006, .008, .006), .014, -.006, .006); }
  if (kind === 'twist') {
    const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .01 : .024; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    add(new THREE.ExtrudeGeometry(st, { depth: .009, bevelEnabled: true, bevelSize: .0015, bevelThickness: .0015, bevelSegments: 1 }));
  }
  return g;
}
// door space: a group pinned to the door face, +x reads to the right (world +z), +y up, +z out toward you (world -x)
function buildFridge(root) {
  const pivot = new THREE.Group(); pivot.position.copy(FR.hinge); scene.add(pivot);
  for (const n of ['Fridge_Door', 'Fridge_Handle_Base', 'Fridge_Handle_Lever', 'Fridge_Handle_Tip', 'Fridge_Badge']) { const o = root.getObjectByName(n); if (o) pivot.attach(o); }
  const face = new THREE.Group(); face.rotation.y = -Math.PI / 2; face.position.set(FR.face - FR.hinge.x, 0, (FR.z0 + FR.z1) / 2 - FR.hinge.z);
  pivot.add(face);
  door = { pivot, face, angle: 0 };
  magnets = new THREE.Group(); face.add(magnets);
  placeIdea(idea, true);
}
const DOOR_W = FR.z1 - FR.z0;     // .597
const measureCtx = document.createElement('canvas').getContext('2d');
function wordAspect(word) { measureCtx.font = '600 46px Georgia, "Times New Roman", serif'; return Math.ceil(measureCtx.measureText(word).width + 32) / 64; }
function layoutWords(words) {
  // phones: words run the whole door (skipping the handle band) so they can be big; desktop: above the handle
  const tall = stops === STOPS_TALL;
  const left = -DOOR_W / 2 + .04, right = DOOR_W / 2 - .04, top = 1.415, bottom = tall ? .52 : 1.025, handle = [.915, 1.035];
  for (let h = tall ? .066 : .056; h >= .024; h -= .003) {
    const out = []; let x = left, y = top - h / 2, ok = true;
    for (const word of words) {
      const w = h * wordAspect(word);
      if (x + w > right && x > left) { x = left; y -= h * 1.42; }
      if (tall && y + h / 2 > handle[0] && y - h / 2 < handle[1]) y = handle[0] - h / 2 - .008;
      if (y - h / 2 < bottom) { ok = false; break; }
      out.push({ word, x: x + w / 2, y, h }); x += w + h * .2;
    }
    if (ok) return out;
  }
  return null;
}
let shaking = false, shake = null;
function placeIdea(next, instant) {
  const r = rng(Math.floor(Math.random() * 1e9));
  const words = next.concept.replace(/[“”"]/g, '').split(/\s+/).filter(Boolean);
  const spots = layoutWords(words) || layoutWords(words.slice(0, 26)) || [];
  const items = [];
  for (const sp of spots) {
    const t = makeTile(sp.word, sp.h);
    t.userData.target = { x: sp.x + (r() - .5) * .004, y: sp.y + (r() - .5) * .004, z: .002, rz: (r() - .5) * .08 };
    items.push(t);
  }
  const notes = next.rows.slice(0, 4), cols = [-.13, .13], rows = stops === STOPS_TALL ? [.36, .19] : [.8, .56];   // below the words
  const kinds = { Place: 'place', Who: 'who', Thing: 'thing', Twist: 'twist', Try: 'twist' };
  const colors = { place: '#b3301f', who: '#9a6a00', thing: '#7a5a12', twist: '#24589a' };
  notes.forEach(([label, text], i) => {
    const kind = kinds[label] || 'twist';
    const g = new THREE.Group();
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(.2, .152), new THREE.MeshStandardMaterial({ map: noteTexture(label, text, colors[kind]), roughness: .85 }));
    paper.position.set(0, -.07, .0012); paper.receiveShadow = true; g.add(paper);
    const prop = makeProp(kind); prop.position.set(0, .006, .004); g.add(prop);
    g.userData.target = { x: cols[i % 2] + (r() - .5) * .02, y: rows[Math.floor(i / 2)] + .07 + (r() - .5) * .015, z: 0, rz: (r() - .5) * .1 };
    g.userData.dispose = () => { paper.material.map.dispose(); paper.material.dispose(); };
    items.push(g);
  });
  items.forEach((it, i) => {
    const T = it.userData.target;
    magnets.add(it);
    if (instant) { it.position.set(T.x, T.y, T.z); it.rotation.z = T.rz; }
    else { it.visible = false; it.userData.at = i * 42; }
  });
  return items;
}
function shuffle() {
  if (shaking || !door) { if (!door) { idea = rollStory(); writeIdea(); } return; }
  const next = rollStory();
  if (quiet.matches) {   // straight swap: no swing, no tumbling
    for (const it of [...magnets.children]) { magnets.remove(it); it.traverse(o => o.userData.dispose?.()); }
    idea = next; placeIdea(idea, true); writeIdea(); needsFrame = true; return;
  }
  shaking = true; sound('door');
  shake = { t0: performance.now(), next, dropped: false, placed: null };
}
function stepFridge(now) {
  const dt = 1 / 60;
  if (shake && door) {
    const t = now - shake.t0;
    // yank open, hang, slam: the door angle is the whole performance
    let a;
    if (t < 220) a = .55 * (1 - Math.pow(1 - t / 220, 3));
    else if (t < 300) a = .55;
    else if (t < 500) a = .55 * (1 - Math.pow((t - 300) / 200, 2));
    else a = -.022 * Math.sin((t - 500) / 30) * Math.exp(-(t - 500) / 90);
    door.pivot.rotation.y = a;
    if (t >= 500 && !shake.dropped) {
      // the slam knocks the old words off: they tumble to the floor
      shake.dropped = true;
      for (const it of [...magnets.children]) {
        scene.attach(it);
        it.userData.v = new THREE.Vector3(-(.4 + Math.random() * 1.1), .2 + Math.random() * 1.1, (Math.random() - .7) * 1.2);
        it.userData.w = new THREE.Vector3((Math.random() - .5) * 14, (Math.random() - .5) * 14, (Math.random() - .5) * 14);
        it.userData.life = 0; debris.push(it);
      }
      idea = shake.next; writeIdea();
    }
    if (t >= 640 && !shake.placed) shake.placed = placeIdea(idea, false);
    if (shake.placed) {
      let busy = false;
      for (const it of shake.placed) {
        const k = clamp((t - 640 - it.userData.at) / 230, 0, 1), T = it.userData.target;
        if (k <= 0) { busy = true; continue; }
        if (!it.visible) it.visible = true;
        // fly in from your side, overshoot, slap flat
        const e = 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2);
        it.position.set(T.x + (1 - k) * .03, T.y + (1 - k) * .05, T.z + (1 - e) * .22 + .002);
        it.rotation.set((1 - k) * .5, (1 - k) * -.4, T.rz + (1 - k) * .6);
        it.scale.setScalar(.75 + .25 * Math.min(1, e));
        if (k >= 1 && !it.userData.slapped) { it.userData.slapped = true; if (Math.random() < .5) sound('slap'); }
        if (k < 1) busy = true;
      }
      if (!busy && t > 900) { shake = null; shaking = false; door.pivot.rotation.y = 0; }
    }
  }
  // tumbling words: gravity, a floor, a little bounce, then tidy away
  for (let i = debris.length - 1; i >= 0; i--) {
    const it = debris[i], u = it.userData; u.life += dt;
    u.v.y -= 9.8 * dt; it.position.addScaledVector(u.v, dt);
    it.rotation.x += u.w.x * dt; it.rotation.y += u.w.y * dt; it.rotation.z += u.w.z * dt;
    if (it.position.y < .012) { it.position.y = .012; u.v.y = Math.abs(u.v.y) * .3; u.v.x *= .6; u.v.z *= .6; u.w.multiplyScalar(.5); if (u.v.y < .05) { u.v.y = 0; u.w.set(0, 0, 0); it.rotation.set(-Math.PI / 2, 0, it.rotation.z); } }
    if (it.position.x < -2.9) { it.position.x = -2.9; u.v.x *= -.3; }
    if (u.life > 7) { scene.remove(it); it.traverse(o => o.userData.dispose?.()); debris.splice(i, 1); }
  }
}
$('shuffle').addEventListener('click', shuffle);
$('doorHit').addEventListener('click', shuffle);
$('tone').addEventListener('change', () => { const u = new URL(location.href); $('tone').value ? u.searchParams.set('tone', $('tone').value) : u.searchParams.delete('tone'); history.replaceState(null, '', u); shuffle(); });

function makeDust() {
  const n = 700, r = rng(17), pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos.set([-3 + r() * 4.5, .2 + r() * 2.8, -2.4 + r() * 4.8], i * 3); seed[i] = r(); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, toSun: { value: new THREE.Vector3() }, strength: { value: 0 }, px: { value: 1 } },
    vertexShader: `attribute float seed; uniform float time,px; uniform vec3 toSun; varying float vLit;
      void main(){ vec3 p=position; float t=time*.05+seed*40.;
        p+=vec3(sin(t*1.3)*.25,sin(t*.7+seed*9.)*.18-mod(time*.006+seed,1.)*.0,cos(t*1.1)*.25);
        float k=(${WIN.x.toFixed(2)}-p.x)/min(toSun.x,-.001); vec3 q=p+toSun*k;
        float inside=step(${WIN.y0.toFixed(2)},q.y)*step(q.y,${WIN.y1.toFixed(2)})*step(${WIN.z0.toFixed(2)},q.z)*step(q.z,${WIN.z1.toFixed(2)})*step(k,0.);
        vLit=inside; vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_PointSize=px*(1.2+seed*1.6)*(2.2/-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform float strength; varying float vLit; void main(){ vec2 c=gl_PointCoord-.5; float a=smoothstep(.5,0.,length(c));
      gl_FragColor=vec4(vec3(1.,.86,.62)*a*(vLit*strength*.9+.015),1.); }`,
  });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.renderOrder = 3;
  return pts;
}

/* camera marks: frame a target rectangle for the current aspect, leaving room for the UI */
const MARKS = {
  window: { wide: { t: [-3.0, 1.62, 0.05], size: [3.7, 3.0], dir: [-1, -.03, -.16] }, tall: { t: [-3.0, 1.45, 0.25], size: [2.6, 3.9], dir: [-1, -.1, -.22] } },
  events: { wide: { t: [-0.46, 1.6, -2.58], size: [2.25, 1.22], dir: [-.08, -.08, -1] } },
  calendar: { tall: { t: [CAL.c.x, CAL.c.y - .02, CAL.c.z], size: [0.88, 1.1], dir: [-.04, -.06, -1] } },
  board: { tall: { t: [0.55, 1.6, -2.56], size: [1.5, 1.05], dir: [.05, -.06, -1] } },
  // stand behind the cart: the picture big, the projector and its beam in the lower left
  // hand-placed: over the projector's shoulder, the beam leading to the picture
  projector: { wide: { pos: [-2.2, 1.36, 1.3], look: [2.99, 1.2, 1.52], vfov: 31 }, tall: { pos: [-1.6, 1.42, 1.42], look: [2.99, 1.22, 1.5], vfov: 45 } },
  // the screening seat: the picture fills the frame
  screen: { wide: { t: [2.99, 1.5, 1.5], size: [1.6, .9], dir: [1, -.02, .015] }, tall: { t: [2.99, 1.5, 1.5], size: [1.6, .9], dir: [1, -.02, .01] } },
  // walk up to the fridge: the magnet words fill the frame
  fridge: { wide: { t: [2.27, 1.1, -1.19], size: [1.3, 1.02], dir: [1, -.07, .1] }, tall: { t: [2.255, .98, -1.2005], size: [.62, .96], dir: [1, -.03, .03] } },
};
let insets = { top: 56, bottom: 150 };
function frameMark(name) {
  const key = stops === STOPS_TALL ? 'tall' : 'wide';
  const m = MARKS[name][key] || MARKS[name].wide || MARKS[name].tall;
  if (m.pos) { const pos = new THREE.Vector3(...m.pos); return { pos, dir: new THREE.Vector3(...m.look).sub(pos).normalize(), vfov: m.vfov }; }
  const W = innerWidth, H = innerHeight, avail = Math.max(.35, (H - insetsNow.top - insetsNow.bottom) / H);
  const vfov = name === 'screen' ? (stops === STOPS_TALL ? 50 : 34) : stops === STOPS_TALL ? 60 : 44;
  const tv = Math.tan(THREE.MathUtils.degToRad(vfov / 2)) * avail, th = Math.tan(THREE.MathUtils.degToRad(vfov / 2)) * W / H;
  const dir = new THREE.Vector3(...m.dir).normalize();
  let d = Math.max(m.size[0] / 2 / th, m.size[1] / 2 / tv);
  const target = new THREE.Vector3(...m.t);
  const back = dir.clone().negate();
  d = Math.min(d, hitRoom(target.clone().addScaledVector(back, .05), back) - .35);  // stay inside the room
  return { pos: target.clone().addScaledVector(back, d), dir, vfov };
}
function poseAt(v) {
  const i = clamp(Math.floor(v), 0, stops.length - 2), f = clamp(v - i, 0, 1);
  const a = frameMark(stops[i]), b = frameMark(stops[i + 1]);
  const pos = a.pos.clone().lerp(b.pos, f);
  // a head turn, not a slide: pull toward the middle of the room mid-move
  const mid = new THREE.Vector3(0.4, 1.5, 0.2);
  pos.lerp(mid, Math.sin(Math.PI * f) * (stops[i] === 'window' ? .28 : .08));
  const ya = Math.atan2(-a.dir.x, -a.dir.z), yb = Math.atan2(-b.dir.x, -b.dir.z);
  let dy = yb - ya; if (dy > Math.PI) dy -= 2 * Math.PI; if (dy < -Math.PI) dy += 2 * Math.PI;
  const yaw = ya + dy * f, pitch = mix(Math.asin(a.dir.y), Math.asin(b.dir.y), f) - Math.sin(Math.PI * f) * .02;
  const dir = new THREE.Vector3(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  return { pos, dir, vfov: mix(a.vfov, b.vfov, f), roll: Math.sin(Math.PI * f) * .012 * Math.sign(dy) };
}
function placeCamera() {
  const k = smooth(0, 1, cinema.v) * smooth(stops.length - 1.3, stops.length - 1, state.view);
  // during a screening the panels step away: the picture gets the whole screen
  insetsNow = { top: mix(insets.top, 12, k), bottom: mix(insets.bottom, 12, k) };
  const p = poseAt(state.view);
  if (k > 0) {
    const sc = frameMark('screen');
    p.pos.lerp(sc.pos, k); p.dir.lerp(sc.dir, k).normalize(); p.vfov = mix(p.vfov, sc.vfov, k);
  }
  camera.position.copy(p.pos);
  camera.up.set(Math.sin(p.roll), 1, 0).normalize();
  camera.lookAt(tmp.copy(p.pos).add(p.dir));
  camera.fov = p.vfov;
  const shift = (insetsNow.top - insetsNow.bottom) / 2;
  camera.setViewOffset(innerWidth, innerHeight, 0, -shift, innerWidth, innerHeight);
  camera.updateProjectionMatrix();
}

/* project a wall rectangle onto the screen and pin a DOM element to it */
function homography(w, h, pts) {
  // maps (0,0),(w,0),(w,h),(0,h) to pts[0..3]; returns CSS matrix3d
  const [p0, p1, p2, p3] = pts;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = p1.x - p0.x + g * p1.x, b = p3.x - p0.x + hh * p3.x, c = p0.x;
  const d = p1.y - p0.y + g * p1.y, e = p3.y - p0.y + hh * p3.y, f = p0.y;
  const A = a / w, Bq = b / h, D = d / w, E = e / h, G = g / w, Hh = hh / h;
  return `matrix3d(${A},${D},0,${G},${Bq},${E},0,${Hh},0,0,1,0,${c},${f},0,1)`;
}
function quad(center, w, h, wall = 'north') {
  // corners TL, TR, BR, BL as seen from inside the room
  const c = [[-w / 2, h / 2], [w / 2, h / 2], [w / 2, -h / 2], [-w / 2, -h / 2]];
  return wall === 'east'
    ? c.map(([x, y]) => new THREE.Vector3(center.x - .002, center.y + y, center.z + x))
    : c.map(([x, y]) => new THREE.Vector3(center.x + x, center.y + y, center.z + .002));
}
function toScreen(v) {
  const p = v.clone().applyMatrix4(camera.matrixWorldInverse);
  if (p.z > -0.05) return null;
  p.applyMatrix4(camera.projectionMatrix);
  return { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight };
}
function pin(el, center, w, h, pxW, pxH, wall) {
  const pts = quad(center, w, h, wall).map(toScreen);
  if (pts.some(p => !p) || pts.every(p => p.x < -innerWidth || p.x > innerWidth * 2)) { el.classList.remove('shown'); return null; }
  el.style.transform = homography(pxW, pxH, pts);
  el.classList.add('shown');
  return pts;
}

/* ------------------------------------------------------------------ lighting from the sun */
const C = (h) => new THREE.Color(h);
function applySun() {
  const t = instant(state.date, state.minute);
  const { azimuth, elevation } = LaBSun.position(t, PLACE.lat, PLACE.lon);
  state.sun = { azimuth, elevation };
  const e = elevation, toSun = sunVector(azimuth, elevation);
  $('clock').textContent = fmtClock.format(t);
  const phase = LaBSun.phaseAt(t, state.day).replace(/-/g, ' ');
  $('phase').textContent = `${phase} · sun ${Math.round(e)}° up, ${LaBSun.direction ? LaBSun.direction(azimuth) : Math.round(azimuth) + '°'}`;
  $('scrub').setAttribute('aria-valuetext', `${fmtClock.format(t)}, ${phase}, sun ${Math.round(e)} degrees up`);
  if (!renderer) return;

  const day = smooth(-2, 3, e), gold = 1 - smooth(4, 22, e), blue = smooth(-7, -1, e) * (1 - smooth(-1, 3, e));
  const dim = smooth(.15, .85, cinema.v), shut = smooth(0, .75, cinema.v);   // screening: shade closed, house lights down
  // the room's camera exposure; everything outside is divided by it so dusk lamps and screenings never touch the sky
  const ec = 1 / mix(mix(1.05, 1.55, 1 - smooth(-6, 12, e)), 1.6, dim);
  // sun
  sunLight.position.copy(toSun).multiplyScalar(14).add(sunLight.target.position);
  sunLight.intensity = day * mix(5.2, 3.6, gold) * (1 - smooth(1.5, -1, e) * .7);
  sunLight.color.copy(C('#fff4e6')).lerp(C('#ffb46a'), gold).lerp(C('#ff8a4a'), smooth(5, 0, e));
  // sky + fill
  const zen = C('#4f86c6').lerp(C('#6d83b4'), gold).lerp(C('#1d2a55'), 1 - day).lerp(C('#070a16'), 1 - smooth(-12, -5, e));
  const hor = C('#cfe0ec').lerp(C('#f2c08a'), gold * day).lerp(C('#6a5f88'), blue).lerp(C('#0d1020'), 1 - smooth(-12, -5, e));
  sky.material.uniforms.zenith.value.copy(zen); sky.material.uniforms.horizon.value.copy(hor);
  sky.material.uniforms.glow.value.copy(C('#ffb26b')).multiplyScalar(day * (.3 + gold * .9) + blue * .25);
  sky.material.uniforms.sunDir.value.copy(toSun); sky.material.uniforms.sunAmt.value = day;
  sky.material.uniforms.golden.value = day * gold; sky.material.uniforms.expComp.value = ec; sky.material.uniforms.night.value = 1 - smooth(-10, -2, e);
  const gu = ground.material.uniforms;
  gu.sunDir.value.copy(toSun); gu.sunCol.value.copy(sunLight.color).multiplyScalar(day); gu.sky.value.copy(zen).lerp(hor, .5).multiplyScalar(mix(.15, 1, smooth(-8, 10, e)));
  gu.haze.value.copy(hor).lerp(C('#ffb070'), gold * day * .35); gu.expComp.value = ec; gu.sunAmt.value = day;
  flareState.gold = day * gold * (1 - smooth(-1, 1.5, -e)); flareState.toSun.copy(toSun);
  // outside never takes the room's exposure: everything out there is divided by it
  treeLine.material.color.copy(hor).lerp(zen, .25).multiplyScalar(.5 * ec);
  farTrees.material.color.copy(hor).lerp(zen, .15).multiplyScalar(.78 * ec);
  country.userData.wood.color.copy(C('#2a2219')).lerp(hor, .12).multiplyScalar(ec);
  hemi.color.copy(zen).lerp(C('#ffffff'), .25); hemi.groundColor.copy(C('#6b4a33'));
  hemi.intensity = mix(.08, 1.1, smooth(-8, 18, e)) * (1 - .9 * shut);
  // bounce from the sunlit floor patch (documented fill: its source is the patch itself)
  const L = toSun.clone().negate(), from = new THREE.Vector3(WIN.x, 1.7, 0);
  const patch = from.clone().addScaledVector(L, Math.min(hitRoom(from, L), 8));
  bounce.position.copy(patch).add(new THREE.Vector3(0, .35, 0)).lerp(new THREE.Vector3(0, 1.4, 0), .25);
  bounce.color.copy(sunLight.color).lerp(C('#c98a5a'), .4);
  bounce.intensity = sunLight.intensity * 1.6 * (toSun.x < -0.05 ? 1 : 0.2) * (1 - shut);
  // practicals come up as the sun goes
  const prac = smooth(5, -3, e);
  practicalLights.forEach(l => l.intensity = prac * l.userData.full * (1 - .85 * dim));
  bulbMat.emissiveIntensity = prac * 6 * (1 - .85 * dim);
  // beam + dust: strongest low and warm, nothing once the sun is behind the wall or gone
  const facing = smooth(-0.02, -0.25, toSun.x);
  shafts.userData.mat.uniforms.strength.value = day * facing * mix(.45, 1.1, gold) * (1 - shut);
  shafts.userData.mat.uniforms.color.value.copy(sunLight.color);
  updateShafts(toSun);
  dust.material.uniforms.toSun.value.copy(toSun);
  dust.material.uniforms.strength.value = day * facing * mix(.6, 1.2, gold) * (1 - shut);
  renderer.toneMappingExposure = 1 / ec;
  projectorLight();
  needsFrame = true;
}

function projectorLight() {
  if (!projector) return;
  const e = state.sun.elevation, dark = Math.max(1 - smooth(-6, 20, e), smooth(.2, .9, cinema.v)), on = 1;
  // the lens throws a rectangle; outside it there is only a little spill, and less still once the room is dark
  projector.spot.intensity = on * mix(4, 1.6, dark) * (1 - .5 * smooth(.3, .9, cinema.v));
  // from the screening seat you sit inside the beam: fade it so it doesn't haze the picture
  projector.mat.uniforms.strength.value = on * mix(.35, 1.2, dark) * (1 - smooth(.15, .7, cinema.v));
  projector.glow.material.color.setScalar(on ? 1 : .15);
  document.documentElement.style.setProperty('--lamp', String(mix(.12, .2, dark) * (1 - smooth(.1, .6, cinema.v))));
  document.documentElement.style.setProperty('--throw-contrast', String(mix(1.04, 1.2, smooth(.2, .9, cinema.v))));
  document.documentElement.style.setProperty('--throw', String(mix(1.35, 1.05, dark)));
  needsFrame = true;
}

/* ------------------------------------------------------------------ screening: shade down, house lights down, push in */
const cinema = { v: 0, target: 0 };
const SHADE = { top: 3.05, drop: 2.62 };
function stepCinema(dt) {
  const plain = document.body.classList.contains('plain');
  cinema.target = !plain && stopName() === 'projector' && !filmPaused && !anim && !drag ? 1 : 0;
  const before = cinema.v;
  cinema.v = quiet.matches ? cinema.target : cinema.v + (cinema.target - cinema.v) * (1 - Math.pow(.18, dt));   // ~1.5 s to settle
  if (Math.abs(cinema.target - cinema.v) < .002) cinema.v = cinema.target;
  if (shade.fabric) {
    const k = smooth(0, .75, cinema.v);                       // the shade leads, the lights follow
    shade.fabric.scale.y = mix(.02, 1, k);
    if (shade.hem) shade.hem.position.y = SHADE.top - SHADE.drop * shade.fabric.scale.y;
  }
  document.body.classList.toggle('cinema', cinema.v > .5);
  document.body.dataset.cinema = cinema.v > .97 ? 'on' : cinema.v < .03 ? 'off' : 'moving';
  if (cinema.v !== before) applySun();
}

/* ------------------------------------------------------------------ lens flare: a cinema lens looking into a low sun */
const flareState = { gold: 0, toSun: new THREE.Vector3(), amt: 0 };
const flareEls = { root: $('flare') };
function stepFlare() {
  const root = flareEls.root; if (!root || !camera) return;
  const sunPt = camera.position.clone().addScaledVector(flareState.toSun, 200);
  const sp = toScreen(sunPt);
  let vis = 0;
  if (sp && flareState.toSun.x < -.05) {
    // does the line to the sun pass through the glass (and miss the mullions and the shade)?
    const t = (WIN.x - camera.position.x) / flareState.toSun.x;
    const q = camera.position.clone().addScaledVector(flareState.toSun, t);
    const inOpening = q.y > WIN.y0 && q.y < WIN.y1 && q.z > WIN.z0 && q.z < WIN.z1;
    if (inOpening) {
      const near = (v, list, w) => Math.min(...list.map(x => Math.abs(v - x))) / w;
      const bar = Math.min(near(q.z, [-1.5, -.75, 0, .75, 1.5], .03), near(q.y, [.45, 1.15, 1.85, 2.45, 3.0], .025));
      const shadeBottom = shade.fabric ? SHADE.top - SHADE.drop * shade.fabric.scale.y : 99;
      vis = smooth(.6, 1.6, bar) * (q.y < shadeBottom ? 1 : 0);
    }
  }
  const edge = sp ? smooth(-.15, .1, Math.min(sp.x / innerWidth, 1 - sp.x / innerWidth, sp.y / innerHeight, 1 - sp.y / innerHeight)) : 0;
  const target = vis * edge * flareState.gold * (1 - cinema.v) * (document.body.classList.contains('plain') ? 0 : 1);
  flareState.amt += (target - flareState.amt) * (quiet.matches ? 1 : .12);   // a lens breathes in and out of flare
  const a = flareState.amt;
  root.style.opacity = a.toFixed(3);
  if (a < .003 || !sp) return;
  const cx = innerWidth / 2, cy = innerHeight / 2, dx = cx - sp.x, dy = cy - sp.y;
  root.style.setProperty('--sx', sp.x + 'px'); root.style.setProperty('--sy', sp.y + 'px');
  root.querySelectorAll('.fl-ghost').forEach(gh => {
    const k = +gh.dataset.k;
    gh.style.transform = `translate(${sp.x + dx * k}px, ${sp.y + dy * k}px) translate(-50%, -50%)`;
  });
}

/* ------------------------------------------------------------------ boot */
let needsFrame = true, clock0 = performance.now(), anim = null;
async function boot3D() {
  const canvas = $('scene');
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (err) { console.warn('WebGL unavailable', err); setPlain(true, false); return; }
  const phone = Math.min(innerWidth, innerHeight) < 600;
  renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 2 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(44, innerWidth / innerHeight, .05, 900);

  sky = makeSky(); scene.add(sky);
  ground = makeGround(); scene.add(ground);
  farTrees = makeTreeLine(290, 77, 46); farTrees.renderOrder = -2; scene.add(farTrees);
  treeLine = makeTreeLine(); scene.add(treeLine);
  country = makeCountry(); scene.add(country);
  sunLight = new THREE.DirectionalLight('#fff', 3);
  sunLight.castShadow = true; sunLight.shadow.mapSize.setScalar(phone ? 1024 : 2048);
  Object.assign(sunLight.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 30 });
  sunLight.shadow.bias = -0.0004; sunLight.shadow.normalBias = 0.02; sunLight.shadow.radius = 2;
  sunLight.target.position.set(0, 1, 0); scene.add(sunLight, sunLight.target);
  hemi = new THREE.HemisphereLight('#bcd', '#543', .8); scene.add(hemi);
  bounce = new THREE.PointLight('#f0b080', 0, 7, 1.6); scene.add(bounce);
  for (const [p, full] of [[B(1.25, 2.24, 1.1), 2.2], [B(0, 0.2, 2.3), 5.5]]) {
    const l = new THREE.PointLight('#ffb36b', 0, 9, 1.8); l.position.copy(p); l.userData.full = full; scene.add(l); practicalLights.push(l);
  }
  shafts = makeShafts(); scene.add(shafts);
  projector = makeProjector(); scene.add(projector.group);
  dust = makeDust(); scene.add(dust);

  const mats = makeMaterials(); bulbMat = mats.M_Bulb;
  {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#fff6e8'); gr.addColorStop(.45, '#c9c0b0'); gr.addColorStop(.55, '#5b4a3a'); gr.addColorStop(1, '#2a221b');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 128); g.fillStyle = '#fffaf0'; g.fillRect(20, 30, 90, 26);   // the window
    const eq = new THREE.CanvasTexture(c); eq.mapping = THREE.EquirectangularReflectionMapping; eq.colorSpace = THREE.SRGBColorSpace;
    const env = new THREE.PMREMGenerator(renderer).fromEquirectangular(eq).texture;
    for (const k of ['M_Chrome', 'M_Stainless', 'M_Aluminium']) { mats[k].envMap = env; mats[k].envMapIntensity = .9; }
    new THREE.TextureLoader().load('assets/tex/art_studio_env.jpg', pano => {
      pano.mapping = THREE.EquirectangularReflectionMapping; pano.colorSpace = THREE.SRGBColorSpace;
      const real = new THREE.PMREMGenerator(renderer).fromEquirectangular(pano).texture;
      for (const m of [mats.M_Chrome, mats.M_Stainless, mats.M_Aluminium, mats.M_FridgeEnamel, mats.M_LabEmblem]) if (m) { m.envMap = real; m.needsUpdate = true; }
      mats.M_OakFloor.envMap = real; mats.M_OakFloor.envMapIntensity = .25;   // a little sheen in the worn finish
      pano.dispose(); needsFrame = true;
    });
    mats.M_FridgeEnamel.envMap = env; mats.M_FridgeEnamel.envMapIntensity = .35;
    // the LaB mark as a chrome emblem: the PNG's own alpha cuts the shape (the GLB stores it as JPEG, no alpha)
    const mark = new THREE.TextureLoader().load('../images/TheLaB-mark.png'); mark.flipY = false; mark.colorSpace = THREE.SRGBColorSpace; mark.anisotropy = 8;
    mats.M_LabEmblem = new THREE.MeshStandardMaterial({ map: mark, color: '#d8dbe0', metalness: 1, roughness: .2, envMap: env, envMapIntensity: .95, alphaTest: .45, polygonOffset: true, polygonOffsetFactor: -2 });
  }
  const gltf = await new GLTFLoader().loadAsync('assets/loft.glb');
  gltf.scene.traverse(o => {
    if (!o.isMesh) return;
    const name = o.material?.name;
    if (mats[name]) o.material = mats[name];
    if (name === 'M_Paper' && o.name.startsWith('Calendar')) { calPaperMat = o.material = new THREE.MeshStandardMaterial({ color: '#f1ece0', roughness: .9 }); }
    if (o.name === 'Flyer_Hero' || o.parent?.name === 'Flyer_Hero') flyerMesh = o;
    if (o.name === 'Reel_Front' || o.name === 'Reel_Rear') reels.push(o);
    if (o.name === 'Shade_Fabric') shade.fabric = o;
    if (o.name === 'Shade_Hem') shade.hem = o;
    o.castShadow = name !== 'M_WindowGlass' && name !== 'M_Bulb';
    o.receiveShadow = name !== 'M_WindowGlass';
  });
  scene.add(gltf.scene);
  gltf.scene.updateMatrixWorld(true);
  // baked ambient occlusion (Cycles, bake_ao.py): soft corners and contact shadows on the room's big surfaces.
  // AO only shades the sky/ambient light, as it should; the sun and lamps stay direct.
  const AO = ['Floor', 'Ceiling', 'Wall_North', 'Wall_South', 'Wall_East', 'Wall_West_Below', 'Wall_West_Head', 'Wall_West_Left', 'Wall_West_Right', 'Rug', 'Desk_Top', 'WindowSeat', 'Shelf_Case'];
  const aoLoader = new THREE.TextureLoader();
  for (const name of AO) {
    const o = gltf.scene.getObjectByName(name); if (!o) continue;
    const mesh = o.isMesh ? o : o.children.find(c => c.isMesh); if (!mesh) continue;
    const ch = ['uv3', 'uv2', 'uv1'].map((k, i) => mesh.geometry.attributes[k] ? 3 - i : 0).find(Boolean);
    if (!ch) continue;
    const tex = aoLoader.load(`assets/ao/${name}.jpg`); tex.flipY = false; tex.channel = ch;
    mesh.material = mesh.material.clone(); mesh.material.aoMap = tex; mesh.material.aoMapIntensity = 1.15;
  }
  buildReels(gltf.scene); buildFridge(gltf.scene);

  resize(); applySun(); placeCamera();
  document.body.classList.remove('loading');
  renderer.setAnimationLoop(frame);
  document.body.dataset.view = stopName(); document.body.dataset.ready = '1';
  if (params.has('debug')) window.__studio = { scene, camera, THREE };
}

/* ------------------------------------------------------------------ resize + overlays */
function resize() {
  const tall = innerWidth / innerHeight < 0.85;
  const before = stopName();
  stops = tall ? STOPS_TALL : STOPS_WIDE;
  if (document.body.classList.contains('portrait') !== tall || !resize.ran) $('ideaWrap').open = !tall;   // the notes are open on desktop, a tap away on phones
  const shapeChanged = resize.ran && document.body.classList.contains('portrait') !== tall;
  resize.ran = true;
  document.body.classList.toggle('portrait', tall);
  // keep the same wall when the shape changes
  const idx = stops.indexOf(alias(before));
  if (idx >= 0) state.view = idx;
  if (!renderer) return;
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  dust.material.uniforms.px.value = renderer.getPixelRatio() * (innerHeight / 700) * 2.4;
  measureInsets(); placeCamera(); needsFrame = true;
  if (shapeChanged && magnets && !shaking) {   // the door layout differs between phone and desktop: re-pin the words
    for (const it of [...magnets.children]) { magnets.remove(it); it.traverse(o => o.userData.dispose?.()); }
    placeIdea(idea, true);
  }
}
function dockFor(name) { return name === 'window' ? $('windowDock') : name === 'projector' ? $('projectorDock') : name === 'fridge' ? $('fridgeDock') : $('eventsDock'); }
function measureInsets() {
  // frame each wall in the space the header, the panel and the station bar leave free
  const name = stopName(), dock = dockFor(name);
  const was = dock.hidden; dock.hidden = false;
  insets = { top: 58, bottom: Math.round(innerHeight - dock.getBoundingClientRect().top + 10) };
  dock.hidden = was;
  insets.bottom = clamp(insets.bottom, 70, innerHeight * .45);
}
let insetsNow = { top: 58, bottom: 150 };
addEventListener('resize', resize);

function updateOverlays() {
  const name = stopName(), plain = document.body.classList.contains('plain');
  const settled = !anim && !drag && Math.abs(state.view - Math.round(state.view)) < .02;
  const atEvents = name === 'events' || name === 'calendar' || name === 'board';
  if (!plain) for (const d of [$('windowDock'), $('eventsDock'), $('fridgeDock'), $('projectorDock')]) d.hidden = d !== dockFor(name);
  const station = atEvents ? 'events' : name;
  if (updateOverlays.station !== station) {
    updateOverlays.station = station;
    document.querySelectorAll('#stations [data-station]').forEach(b => b.dataset.station === station ? b.setAttribute('aria-current', 'location') : b.removeAttribute('aria-current'));
  }
  $('segCal').setAttribute('aria-pressed', String(name === 'calendar'));
  $('segBoard').setAttribute('aria-pressed', String(name === 'board'));
  $('evHint').hidden = name === 'calendar';
  const cal = $('calendar'), hit = $('flyerHit'), doorHit = $('doorHit');
  if (plain) { cal.inert = hit.inert = false; return; }
  cal.inert = hit.inert = !atEvents; doorHit.inert = name !== 'fridge';
  pin(cal, CAL.c, CAL.w, CAL.h, 800, 1020);
  if (!lifting) pin(hit, FLY.c, FLY.w, FLY.h, 216, 279);
  pin($('screenLight'), PJ.c, PJ.w * 1.0667, PJ.h * 1.118, 1600, 944, 'east');
  pin(film, PJ.c, PJ.w, PJ.h, 1500, 844, 'east');
  pin(doorHit, new THREE.Vector3(FR.face, (FR.y0 + FR.y1) / 2, (FR.z0 + FR.z1) / 2), FR.z1 - FR.z0, FR.y1 - FR.y0, 650, 1410, 'east');
  doorHit.classList.toggle('live', name === 'fridge' && settled && !shaking);
  cal.classList.toggle('live', atEvents && settled); hit.classList.toggle('live', atEvents && settled);
}

/* ------------------------------------------------------------------ the move */
function go(name, { focus = false } = {}) {
  const to = Math.max(0, stops.indexOf(alias(name)));
  animateTo(to, () => {
    if (!focus) return;
    const at = stops[to];
    (at === 'window' ? $('scrub') : at === 'projector' ? document.querySelector('.reel[aria-pressed="true"]') : at === 'fridge' ? $('shuffle') : at === 'board' ? $('flyerHit') : $('calMonth')).focus({ preventScroll: true });
  });
}
function animateTo(to, done) {
  const from = state.view;
  if (quiet.matches || Math.abs(to - from) < .001) { state.view = to; anim = null; settle(); done?.(); return; }
  const dur = 1100 + 450 * Math.abs(to - from), t0 = performance.now();
  anim = { tick(now) {
    const k = clamp((now - t0) / dur, 0, 1);
    // fluid-head: slow to start, a long glide, a soft landing with a hair of overshoot
    const ease = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const over = Math.sin(Math.PI * clamp((k - .7) / .3, 0, 1)) * .012 * Math.sign(to - from);
    state.view = mix(from, to, ease) + over;
    if (k >= 1) { state.view = to; anim = null; settle(); done?.(); }
  } };
}
function settle() { measureInsets(); writeURL(); needsFrame = true; document.body.dataset.view = stopName(); syncFilm(); }
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go, { focus: true })));

/* drag to turn your head (pointer events; a held, paused drag does nothing but hold) */
let drag = null;
const stage = $('stage');
stage.addEventListener('pointerdown', e => {
  if (document.body.classList.contains('plain') || e.button > 0) return;
  if (e.target.closest('button,a,input,select,dialog,[contenteditable]')) return;
  drag = { x: e.clientX, y: e.clientY, v0: state.view, last: e.clientX, lt: e.timeStamp, vel: 0, on: false, id: e.pointerId };
  anim = null;
});
addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x;
  if (!drag.on) { if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return; drag.on = true; stage.setPointerCapture?.(e.pointerId); stage.classList.add('dragging'); }
  const span = Math.max(260, innerWidth * .62);
  state.view = clamp(drag.v0 - dx / span, -.08, stops.length - 1 + .08);
  const dt = Math.max(1, e.timeStamp - drag.lt);
  drag.vel = mix(drag.vel, -(e.clientX - drag.last) / span / dt * 1000, .35);
  drag.last = e.clientX; drag.lt = e.timeStamp;
  needsFrame = true;
});
function endDrag(e) {
  if (!drag || (e && e.pointerId !== drag.id)) return;
  const was = drag; drag = null; stage.classList.remove('dragging');
  if (!was.on) return;
  // a pause before letting go kills the fling
  const held = e && e.timeStamp - was.lt > 90 ? 0 : was.vel;
  const to = clamp(Math.round(state.view + clamp(held, -3, 3) * .18), 0, stops.length - 1);
  animateTo(to);
}
addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
stage.addEventListener('dragstart', e => e.preventDefault());
stage.addEventListener('contextmenu', e => { if (drag?.on) e.preventDefault(); });
addEventListener('keydown', e => {
  if (e.target.closest('input,dialog,textarea') || document.body.classList.contains('plain')) return;
  if (e.key === 'ArrowRight' && state.view < stops.length - 1) { animateTo(Math.round(state.view) + 1); }
  if (e.key === 'ArrowLeft' && state.view > 0) { animateTo(Math.round(state.view) - 1); }
});

/* time scrubbing */
$('scrub').addEventListener('input', e => { state.minute = +e.target.value; applySun(); writeURL(); });
$('date').addEventListener('change', e => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) return;
  const frac = (state.minute - $('scrub').min) / ($('scrub').max - $('scrub').min);
  state.date = e.target.value; const [lo, hi] = setDay();
  state.minute = Math.round(mix(lo, hi, frac)); $('scrub').value = state.minute;
  calYear = +state.date.slice(0, 4); calMonth = +state.date.slice(5, 7) - 1; renderCalendar();
  applySun(); writeURL();
});

/* lift the flyer off the board */
let lifting = false;
const dlg = $('flyerDialog'), sheet = $('sheet');
function cornersOfRect(r) { return [{ x: r.left, y: r.top }, { x: r.right, y: r.top }, { x: r.right, y: r.bottom }, { x: r.left, y: r.bottom }]; }
function liftPath(k, from, to, w, h, ox, oy) {
  const lift = Math.sin(Math.PI * k);
  return homography(w, h, from.map((p, i) => {
    const q = to[i];
    // the top edge leaves the pin first; the sheet bows toward you on the way
    const kk = clamp(k * (i < 2 ? 1.15 : .95), 0, 1);
    return { x: mix(p.x, q.x, kk) - ox + (i % 3 ? 1 : -1) * lift * 6, y: mix(p.y, q.y, kk) - oy - lift * (i < 2 ? 18 : 6) };
  }));
}
$('flyerHit').addEventListener('click', async () => {
  if (lifting) return; lifting = true;
  const from = !document.body.classList.contains('plain') && renderer ? quad(FLY.c, FLY.w, FLY.h).map(toScreen) : null;
  dlg.showModal();
  if (!from || from.some(p => !p) || quiet.matches) { lifting = false; return; }
  dlg.classList.add('lifting');
  const box = sheet.getBoundingClientRect(), w = sheet.offsetWidth, h = sheet.offsetHeight;
  // the paper on the board is just the image; start from it, then the details unfold
  const img = $('flyerImg').getBoundingClientRect();
  const sx = (from[1].x - from[0].x) / img.width, sy = (from[3].y - from[0].y) / img.height;
  const start = [from[0], { x: from[0].x + w * sx, y: from[1].y + (from[1].y - from[0].y) * 0 }, { x: from[0].x + w * sx, y: from[0].y + h * sy }, { x: from[0].x, y: from[0].y + h * sy }];
  if (flyerMesh) flyerMesh.visible = false; needsFrame = true;
  const to = cornersOfRect(box), t0 = performance.now(), dur = 620;
  await new Promise(res => {
    const step = now => {
      const k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
      sheet.style.transform = k < 1 ? liftPath(e, start, to, w, h, box.left, box.top) : '';
      k < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  });
  dlg.classList.remove('lifting');
  lifting = false;
});
async function pinBack() {
  if (lifting) return;
  const to = !document.body.classList.contains('plain') && renderer && !quiet.matches ? quad(FLY.c, FLY.w, FLY.h).map(toScreen) : null;
  if (to && !to.some(p => !p)) {
    lifting = true; dlg.classList.add('lifting');
    const box = sheet.getBoundingClientRect(), w = sheet.offsetWidth, h = sheet.offsetHeight, img = $('flyerImg').getBoundingClientRect();
    const sx = (to[1].x - to[0].x) / img.width, sy = (to[3].y - to[0].y) / img.height;
    const end = [to[0], { x: to[0].x + w * sx, y: to[1].y }, { x: to[0].x + w * sx, y: to[0].y + h * sy }, { x: to[0].x, y: to[0].y + h * sy }];
    const from = cornersOfRect(box), t0 = performance.now(), dur = 420;
    await new Promise(res => { const step = now => { const k = clamp((now - t0) / dur, 0, 1), e = k * k * (3 - 2 * k); sheet.style.transform = liftPath(e, from, end, w, h, box.left, box.top); sheet.style.opacity = String(1 - smooth(.8, 1, k)); k < 1 ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); });
    lifting = false;
  }
  dlg.close(); dlg.classList.remove('lifting'); sheet.style.transform = ''; sheet.style.opacity = '';
  if (flyerMesh) flyerMesh.visible = true; needsFrame = true;
  $('flyerHit').focus({ preventScroll: true });
}
$('flyerClose').onclick = pinBack;
dlg.addEventListener('cancel', e => { e.preventDefault(); pinBack(); });
dlg.addEventListener('click', e => { if (e.target === dlg) pinBack(); });

/* ------------------------------------------------------------------ loop */
function frame(now) {
  anim?.tick(now);
  const t = (now - clock0) / 1000;
  shafts.userData.mat.uniforms.time.value = quiet.matches ? 0 : t;
  dust.material.uniforms.time.value = quiet.matches ? 0 : t;
  if (projector) projector.mat.uniforms.time.value = quiet.matches ? 0 : t;
  sky.material.uniforms.time.value = quiet.matches ? 0 : t;
  stepFridge(now); stepReels(now); stepCinema(1 / 60);
  placeCamera();
  renderer.render(scene, camera);
  updateOverlays();
  stepFlare();
}
document.addEventListener('visibilitychange', () => { renderer?.setAnimationLoop(document.hidden ? null : frame); syncFilm(); });

/* ------------------------------------------------------------------ start */
const startHash = location.hash.slice(1);
let plainPref = null; try { plainPref = localStorage.getItem('lab-studio-plain'); } catch { }
applySun();
resize();
state.view = Math.max(0, stops.indexOf(alias(startHash || 'window')));
if (plainPref === '1') { setPlain(true, false); document.body.classList.remove('loading'); }
else boot3D().catch(err => { console.error(err); setPlain(true, false); document.body.classList.remove('loading'); });
