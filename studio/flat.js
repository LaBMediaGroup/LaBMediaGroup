/* LaB studio, flat view: the same four stations as the 3D room, drawn in 2D and carried by motion.
   Window → wall → fridge → projector, one vertical walk with a station dock.
   No WebGL. Renders lazily on the first `lab:flat` {on:true}; stops everything on {on:false}.
   State lives in the URL (?date&minute&tone&film #station) so the trip to and from the 3D room keeps it. */

const PLACE = { lat: 42.67, lon: -83.03, tz: 'America/Detroit', label: 'Shelby Township, MI' };
const WINDOW_FACES = 232;               // the loft window looks south-west (same as build_loft.py / studio.js)
const STATIONS = ['window', 'events', 'fridge', 'projector'];
const ALIAS = { board: 'events', calendar: 'events', story: 'fridge', ideas: 'fridge', work: 'projector', films: 'projector' };
const quiet = matchMedia('(prefers-reduced-motion: reduce)');
const calm = () => quiet.matches;
const q = (sel, el = document) => el.querySelector(sel);
const qa = (sel, el = document) => [...el.querySelectorAll(sel)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plainText = html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent; };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ------------------------------------------------------------------ time (America/Detroit, same approach as studio.js) */
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
const clockOf = minute => { const h = Math.floor(minute / 60) % 24, m = Math.round(minute % 60); return `${(h % 12) || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const dayLabel = ds => new Date(ds + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

/* ------------------------------------------------------------------ colour */
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mixC = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => mix(v, y[i], t))); };
function ramp(stops, v) {          // stops: [[at, colour, colour...]]
  if (v <= stops[0][0]) return stops[0].slice(1);
  for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) {
    const a = stops[i - 1], b = stops[i], t = smooth(0, 1, (v - a[0]) / (b[0] - a[0]));
    return a.slice(1).map((c, k) => mixC(c, b[k + 1], t));
  }
  return stops[stops.length - 1].slice(1);
}
const SKY = [ // elevation°, top, middle, horizon
  [-14, '#05070f', '#0a0f1f', '#111a30'], [-8, '#0b1230', '#18224a', '#2c3566'], [-4, '#16224d', '#3a3f78', '#8a6a8e'],
  [-1, '#25356a', '#6f6a9a', '#e08a68'], [2, '#33508a', '#a08ea0', '#f6a359'], [6, '#4a6fa6', '#bdb2a8', '#f8c88a'],
  [12, '#5288c2', '#9fc0db', '#e3e6df'], [40, '#3f7cc0', '#8fb8de', '#d4e4ee']];
const SUN = [[-2, '#ff6a26'], [2, '#ff9a3c'], [6, '#ffc56e'], [14, '#fff0cf'], [40, '#fffaf0']];
const PATCH = [[0, '#ff8a3a'], [4, '#ffb05a'], [10, '#ffd9a0'], [25, '#fff3dc']];
const TREES = [[-10, '#04060b'], [-3, '#0e111a'], [1, '#221b18'], [6, '#29281c'], [14, '#2b3725']];
const FIELD = [[-10, '#07090f'], [-3, '#141724'], [1, '#5a3f2a'], [5, '#86683a'], [14, '#68714a']];

/* ------------------------------------------------------------------ data */
const records = (window.SPOTLIGHT || []).slice().sort((a, b) => a.date.localeCompare(b.date));
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const flyer = records.find(r => r.photos?.length) || records[records.length - 1];
const FLYER_ART = '../room/light/kickoff-art.webp';
const TONES = [[null, 'Any'], ['drama', 'Drama'], ['comedy', 'Comedy'], ['dark', 'Dark'], ['thriller', 'Thriller'], ['mystery', 'Mystery'], ['horror', 'Horror'], ['tender', 'Tender'], ['experimental', 'Experimental'], ['scifi', 'Sci-Fi'], ['action', 'Action'], ['satire', 'Satire'], ['docu', 'Documentary'], ['noir', 'Neo-Noir']];
const FILMS = {
  moz: { title: 'MOZ Interiors', kind: 'Commercial', year: '2024', src: '../assets/selected-work/moz-interior-v3.mp4', poster: '../assets/selected-work/moz-interior-v3.jpg', yt: 'https://www.youtube.com/watch?v=HtF4L9RpkaU',
    note: 'The textures, light and character of a Detroit-designed space. July 2024 · Bobby: A-camera and edit · Larry: B-camera · filmed in one day.' },
  brass: { title: 'Anthony Brass', kind: 'Artist portrait', year: '2024', src: '../assets/hero-v4/AnthonyBrass-Paintingclip.mp4', poster: '../assets/hero-v4/AnthonyBrass-Paintingclip.jpg', yt: 'https://www.youtube.com/watch?v=CPvxM8GrCg8',
    note: 'Inside Anthony’s home studio: his paintings, his process, his story in his own words. March 2024 · Bobby: A-camera and edit · Larry: B-camera.' },
};
const PHASES = { 'night': 'Night', 'blue-dawn': 'Blue hour', 'golden-morning': 'Golden hour', 'daylight': 'Daylight', 'golden-evening': 'Golden hour', 'blue-dusk': 'Blue hour' };

/* ------------------------------------------------------------------ state */
const S = { date: '', minute: 0, lo: 0, hi: 1439, day: null, tone: '', film: 'moz', station: 'window', idea: null };
let root = null, built = false, live = false;
const today = () => localParts(new Date()).date;

function readURL() {
  const p = new URLSearchParams(location.search), now = localParts(new Date());
  const prev = { date: S.date, minute: S.minute, tone: S.tone, film: S.film };
  S.date = /^\d{4}-\d{2}-\d{2}$/.test(p.get('date') || '') ? p.get('date') : now.date;
  setDay();
  const asked = parseInt(p.get('minute'), 10);
  const golden = minuteOf(S.day.eveningGoldenStart) + 10;
  let m = Number.isFinite(asked) ? asked : (S.date === now.date ? now.minute : golden);
  if (!Number.isFinite(asked) && (m < S.lo || m > S.hi)) m = golden;   // after dark with no time asked: open at the best light
  S.minute = clamp(m, S.lo, S.hi);
  const t = p.get('tone'); S.tone = t && TONES.some(([id]) => id === t) ? t : '';
  S.film = FILMS[p.get('film')] ? p.get('film') : 'moz';
  return prev;
}
let urlTimer = 0;
function writeURL(now) {
  clearTimeout(urlTimer);
  const go = () => {
    if (!live) return;
    const u = new URL(location.href);
    u.searchParams.set('date', S.date); u.searchParams.set('minute', String(Math.round(S.minute)));
    S.tone ? u.searchParams.set('tone', S.tone) : u.searchParams.delete('tone');
    u.searchParams.set('film', S.film);
    u.hash = S.station;
    if (u.href !== location.href) history.replaceState(history.state, '', u);
  };
  now ? go() : (urlTimer = setTimeout(go, 160));
}
function setDay() {
  S.day = LaBSun.getDay(S.date, PLACE.lat, PLACE.lon);
  S.lo = minuteOf(S.day.civilDawn) - 30; S.hi = minuteOf(S.day.civilDusk) + 45;
}

/* ------------------------------------------------------------------ sound (synthesised, quiet, only after a tap) */
let audio = null;
function sound(kind) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const t0 = audio.currentTime;
    const hit = (at, freq, len, gain, qv = 1.4) => {
      const buf = audio.createBuffer(1, Math.ceil(audio.sampleRate * len), audio.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      const src = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
      src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = qv; g.gain.value = gain;
      src.connect(f).connect(g).connect(audio.destination); src.start(t0 + at);
    };
    if (kind === 'door') { hit(0, 260, .08, .22); hit(.36, 120, .16, .5, .8); hit(.37, 1800, .04, .14); }
    else if (kind === 'flip') hit(0, 900, .09, .08, .7);
    else hit(0, 2600 + Math.random() * 900, .025, .07);
  } catch { /* no audio: everything still works */ }
}

/* ------------------------------------------------------------------ markup */
const ICONS = {
  window: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="1.2"/><path d="M12 2.5v19M5 9h14M5 15h14"/><circle class="dock-sun" cx="15.6" cy="5.9" r="1.9"/></svg>',
  events: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="1.5"/><path d="M3.5 10h17M8 2.8v4.4M16 2.8v4.4"/><ellipse class="dock-ring" cx="14.5" cy="15.2" rx="3.2" ry="2.4" transform="rotate(-10 14.5 15.2)"/></svg>',
  fridge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6.5Q6 2.5 10 2.5h4q4 0 4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20z"/><path d="M8.6 7v4.2"/><rect class="dock-mag" x="11.5" y="13" width="4.5" height="2.6" rx=".5"/></svg>',
  projector: '<svg viewBox="0 0 24 24" aria-hidden="true"><g class="dock-reels"><circle cx="7.5" cy="7" r="4"/><circle cx="15.5" cy="7" r="4"/></g><rect x="4" y="12.5" width="13" height="7.5" rx="1.5"/><path d="M17 14.5l4-1.5v6l-4-1.5"/></svg>',
};
const LABELS = { window: 'Window', events: 'Events', fridge: 'Fridge', projector: 'Projector' };

function trees(seed, base, amp, pine) {
  // a Michigan tree line: round crowns with the odd spruce, as one closed path across the window
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let d = `M84 ${base + 30}L84 ${base}`, x = 84;
  while (x < 280) {
    const w = 6 + r() * 12, h = amp * (.45 + r() * .7);
    if (r() < pine) d += `L${(x + w * .5).toFixed(1)} ${(base - h * 1.5).toFixed(1)}L${(x + w).toFixed(1)} ${base.toFixed(1)}`;
    else d += `Q${(x + w * .1).toFixed(1)} ${(base - h * 1.1).toFixed(1)} ${(x + w * .5).toFixed(1)} ${(base - h).toFixed(1)}Q${(x + w * .9).toFixed(1)} ${(base - h * 1.1).toFixed(1)} ${(x + w).toFixed(1)} ${base.toFixed(1)}`;
    x += w * (.7 + r() * .25);
  }
  return d + `L280 ${base}L280 ${base + 30}Z`;
}
function planks() {
  let d = '';
  for (let x = -4; x <= 4.01; x += .19) d += `M${(180 + 100 * x).toFixed(1)} 320L${(180 + 180 * x).toFixed(1)} 440`;
  for (const z of [.35, .9, 1.6, 2.4]) { const y = 170 + 900 / (6 - z); d += `M0 ${y.toFixed(1)}`; let x = 0; for (let i = 0; i < 9; i++) { x += 30 + (i * 37) % 23; d += `${i % 2 ? 'M' : 'L'}${x} ${y.toFixed(1)}`; } }
  return d;
}
function starField() {
  let s = 7, out = ''; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) out += `<circle cx="${(92 + r() * 176).toFixed(1)}" cy="${(44 + r() * 110).toFixed(1)}" r="${(.35 + r() * .7).toFixed(2)}"/>`;
  return out;
}

const roomSVG = () => `
<svg class="room-svg" viewBox="0 0 360 440" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="fxSky" x1="0" y1="40" x2="0" y2="180" gradientUnits="userSpaceOnUse"><stop id="fxSkyTop" offset="0"/><stop id="fxSkyMid" offset=".62"/><stop id="fxSkyHz" offset="1"/></linearGradient>
    <radialGradient id="fxHzGrad" cx=".5" cy=".5" r=".5"><stop id="fxHzC" offset="0" stop-opacity=".9"/><stop id="fxHzE" offset="1" stop-opacity="0"/></radialGradient>
    <radialGradient id="fxHaloGrad"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop id="fxHaloMid" offset=".3" stop-opacity=".55"/><stop id="fxHaloEnd" offset="1" stop-opacity="0"/></radialGradient>
    <radialGradient id="fxBloomGrad"><stop offset="0" stop-color="#fff7e6" stop-opacity=".9"/><stop id="fxBloomMid" offset=".22" stop-opacity=".45"/><stop id="fxBloomEnd" offset="1" stop-opacity="0"/></radialGradient>
    <linearGradient id="fxStreakGrad" x1="0" x2="1"><stop offset="0" stop-color="#ffb46a" stop-opacity="0"/><stop offset=".5" stop-color="#fff1d8" stop-opacity="1"/><stop offset="1" stop-color="#ffb46a" stop-opacity="0"/></linearGradient>
    <linearGradient id="fxWallGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfc5b3"/><stop offset="1" stop-color="#bfb29c"/></linearGradient>
    <linearGradient id="fxFloorGrad" x1="0" y1="320" x2="0" y2="440" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7a5a3e"/><stop offset="1" stop-color="#94704d"/></linearGradient>
    <linearGradient id="fxShaftGrad" x1="0" y1="40" x2="0" y2="440" gradientUnits="userSpaceOnUse"><stop id="fxShaftA" offset="0" stop-opacity=".55"/><stop id="fxShaftB" offset="1" stop-opacity=".08"/></linearGradient>
    <radialGradient id="fxLampGrad"><stop offset="0" stop-color="#ffd59a" stop-opacity=".95"/><stop offset=".25" stop-color="#ff9f4a" stop-opacity=".35"/><stop offset="1" stop-color="#ff8a3a" stop-opacity="0"/></radialGradient>
    <linearGradient id="fxFieldGrad" x1="0" y1="176" x2="0" y2="272" gradientUnits="userSpaceOnUse"><stop id="fxFieldA" offset="0"/><stop id="fxFieldB" offset="1"/></linearGradient>
    <filter id="fxSoft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.4"/></filter>
    <filter id="fxHaze" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
    <clipPath id="fxView"><rect x="90" y="40" width="180" height="230"/></clipPath>
  </defs>
  <rect width="360" height="320" fill="url(#fxWallGrad)"/>
  <rect y="316" width="360" height="5" fill="#a89a84"/>
  <rect y="320" width="360" height="120" fill="url(#fxFloorGrad)"/>
  <path d="${planks()}" stroke="#2a1d12" stroke-opacity=".45" stroke-width=".7" fill="none"/>
  <g clip-path="url(#fxView)">
    <rect x="90" y="40" width="180" height="150" fill="url(#fxSky)"/>
    <g id="fxStars" fill="#fff">${starField()}</g>
    <ellipse id="fxHz" cx="180" cy="172" rx="150" ry="58" fill="url(#fxHzGrad)"/>
    <circle id="fxHalo" cx="180" cy="140" r="30" fill="url(#fxHaloGrad)"/>
    <circle id="fxSun" cx="180" cy="140" r="7.5"/>
    <path id="fxFar" d="${trees(11, 176, 8, .25)}"/>
    <rect x="90" y="176" width="180" height="96" fill="url(#fxFieldGrad)"/>
    <path id="fxNear" d="${trees(29, 184, 15, .35)}"/>
  </g>
  <path d="M90 270h180l7 4H83z" fill="#d9cfbd"/><path d="M83 274h194v4H83z" fill="#a59882"/>
  <path d="M90 40l-5-4v238l5-4zM270 40l5-4v238l-5-4z" fill="#a39780"/>
  <g fill="none" stroke="#1b1a17">
    <rect x="90" y="40" width="180" height="230" stroke-width="5"/>
    <path d="M150 40v230M210 40v230M90 97.5h180M90 155h180M90 212.5h180" stroke-width="2.6"/>
  </g>
  <path d="M96 46l40 0-40 70z" fill="#fff" opacity=".05"/>
  <g class="props" fill="#17140f">
    <path d="M10 343h17l-2-3h-13zM17.6 341V184h1.6v157z"/><path d="M9 172h20l-4 12h-12z"/>
    <path d="M317 189l-19 168h2.6l17.6-162 17.4 162h2.6zM316 192h2.4l3 156h-2.2z"/>
    <path d="M301 172h30v19h-30z"/><path d="M286 175h15v13h-15z"/><path d="M281 171h6v21h-6z"/><circle cx="324" cy="168" r="6"/><circle cx="310" cy="168" r="5"/>
  </g>
  <path id="fxShade" fill="#0a0c18" fill-rule="evenodd" d="M0 0H360V440H0ZM90 40V270H270V40Z"/>
  <rect id="fxWarm" width="360" height="440" fill="#ff9a45" opacity="0" style="mix-blend-mode:soft-light"/>
  <g class="light" style="mix-blend-mode:screen">
    <ellipse id="fxBounce" cx="180" cy="318" rx="130" ry="46" filter="url(#fxHaze)" opacity="0"/>
    <path id="fxShaft" fill="url(#fxShaftGrad)" filter="url(#fxHaze)"/>
    <path id="fxPatch" filter="url(#fxSoft)"/>
  </g>
  <circle id="fxLamp" cx="19" cy="182" r="110" fill="url(#fxLampGrad)" style="mix-blend-mode:screen"/>
  <circle id="fxBulb" cx="19" cy="183" r="3" fill="#ffe2b0"/>
  <g id="fxFlare" style="mix-blend-mode:screen">
    <circle id="fxBloom" r="78" fill="url(#fxBloomGrad)"/>
    <rect id="fxStreak" x="-40" width="440" height="2.4" fill="url(#fxStreakGrad)"/>
    <rect id="fxStreak2" x="0" width="360" height="9" fill="url(#fxStreakGrad)" opacity=".25"/>
    <circle class="ghost" r="12" fill="#ffb36a" opacity=".12"/><circle class="ghost" r="6" fill="#9ad7ff" opacity=".14"/><circle class="ghost" r="20" fill="#ffcf8a" opacity=".07"/>
  </g>
</svg>`;

const MAGNETS = {
  place: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 19L20 6l14 13v15H6z" fill="#c8372d"/><path d="M6 19L20 6l14 13" fill="none" stroke="#8f2219" stroke-width="2"/><rect x="17" y="24" width="7" height="10" fill="#3b2a20"/><rect x="10" y="22" width="5" height="5" fill="#fbe7c4"/><path d="M9 18L20 8" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/></svg>',
  who: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="11" r="7" fill="#e8b23a"/><path d="M8 37c0-11 5-17 12-17s12 6 12 17z" fill="#e8b23a"/><path d="M15 8a5 5 0 0 1 4-3" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M8 37c0-11 5-17 12-17" stroke="#b9861b" stroke-width="1.5" fill="none"/></svg>',
  thing: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="11" cy="20" r="7" fill="none" stroke="#c9a046" stroke-width="5"/><path d="M17 18h19v4.5h-4v5h-4v-5h-3v4h-4v-4h-4z" fill="#c9a046"/><path d="M8 15a6 6 0 0 1 5-2" stroke="#fff6d8" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M19 19h16" stroke="#fff6d8" stroke-opacity=".6" stroke-width="1"/></svg>',
  twist: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3l4.9 10.6 11.6 1.4-8.6 7.9 2.3 11.5L20 28.6 9.8 34.4l2.3-11.5L3.5 15l11.6-1.4z" fill="#2f6fb3" stroke="#1d4f86" stroke-width="1.4" stroke-linejoin="round"/><path d="M14 15l4-1 2-5" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
};
const NOTE_KIND = { Place: 'place', Who: 'who', Thing: 'thing', Twist: 'twist', Try: 'twist' };

const projectorSVG = () => `
<svg class="pj-svg" viewBox="0 0 180 130" aria-hidden="true" focusable="false">
  <path d="M60 46L44 70M120 46L104 70" stroke="#2b2620" stroke-width="5" stroke-linecap="round"/>
  <g class="reel reel-a"><circle cx="60" cy="40" r="30" fill="#1f1b16" stroke="#3d362d" stroke-width="2"/><circle cx="60" cy="40" r="24" fill="none" stroke="#2c2620" stroke-width="7"/><path d="M60 16v48M39 28l42 24M39 52l42-24" stroke="#4a4136" stroke-width="3"/><circle cx="60" cy="40" r="5" fill="#8a7d69"/></g>
  <g class="reel reel-b"><circle cx="122" cy="40" r="24" fill="#1f1b16" stroke="#3d362d" stroke-width="2"/><circle cx="122" cy="40" r="18" fill="none" stroke="#2c2620" stroke-width="5"/><path d="M122 22v36M106 31l32 18M106 49l32-18" stroke="#4a4136" stroke-width="3"/><circle cx="122" cy="40" r="4" fill="#8a7d69"/></g>
  <rect x="30" y="68" width="106" height="44" rx="7" fill="#2a251f"/><rect x="30" y="68" width="106" height="8" rx="4" fill="#3a332a"/>
  <rect x="136" y="78" width="26" height="22" rx="3" fill="#221e19"/><rect class="pj-lens" x="160" y="81" width="10" height="16" rx="2" fill="#5b4f40"/>
  <circle cx="48" cy="90" r="5" fill="#14110d"/><rect x="62" y="86" width="40" height="3" rx="1.5" fill="#3d362d"/><rect x="62" y="94" width="28" height="3" rx="1.5" fill="#3d362d"/>
  <path d="M40 112l-8 16M126 112l8 16" stroke="#2b2620" stroke-width="4" stroke-linecap="round"/>
</svg>`;

function template() {
  const reelCards = Object.entries(FILMS).map(([id, f]) => `
      <button type="button" class="reel-card" data-film="${id}" aria-pressed="false">
        <span class="reel-thumb"><img src="${f.poster}" alt="" width="320" height="180" loading="lazy" draggable="false"></span>
        <span class="reel-text"><b>${esc(f.title)}</b><span>${esc(f.kind)} · ${f.year}</span></span>
      </button>`).join('');
  return `
<div class="fx-glow" aria-hidden="true"></div>
<nav class="fx-dock" aria-label="Studio stations">
  <ol>${STATIONS.map((s, i) => `<li><a href="#${s}" data-st="${s}"><span class="ic">${ICONS[s]}</span><span class="lb">${LABELS[s]}</span></a></li>`).join('')}</ol>
  <span class="fx-pill" aria-hidden="true"></span>
</nav>

<section class="st st-window" id="fx-window" data-st="window" aria-labelledby="fxWinTitle">
  <header class="st-head">
    <p class="kicker"><span>01</span> The window</p>
    <h2 id="fxWinTitle" tabindex="-1">Golden Hour</h2>
    <p class="lede">Scrub the day and watch where the light lands. Real sun times for ${PLACE.label}.</p>
  </header>
  <div class="win-grid">
    <figure class="room" id="fxRoom">${roomSVG()}</figure>
    <div class="win-ctl">
      <div class="readout">
        <output id="fxClock" class="clock" for="fxScrub">4:12 PM</output>
        <span class="phase" id="fxPhase">Golden hour</span>
      </div>
      <p class="sub" id="fxSub"></p>
      <div class="arc" id="fxArcBox">
        <svg class="arc-svg" viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <rect id="fxBandBlue" x="0" width="1000" fill="#5465a8" opacity=".22"/>
          <rect id="fxBandGold" x="0" width="1000" fill="#f0b46c" opacity=".2"/>
          <line id="fxHzLine" x1="0" x2="1000" stroke="#f3eee2" stroke-opacity=".35" stroke-dasharray="6 8" vector-effect="non-scaling-stroke"/>
          <path id="fxArcPath" fill="none" stroke="#f3eee2" stroke-opacity=".75" stroke-width="2" vector-effect="non-scaling-stroke"/>
        </svg>
        <span class="arc-key gold" aria-hidden="true">golden</span><span class="arc-key blue" aria-hidden="true">blue</span>
        <span class="arc-sun" id="fxArcSun" aria-hidden="true"></span>
        <input type="range" id="fxScrub" step="1" aria-label="Time of day">
      </div>
      <div class="marks" id="fxMarks" role="group" aria-label="Jump to a time"></div>
      <div class="dayrow">
        <label class="field">Date <input type="date" id="fxDate"></label>
        <button type="button" class="fx-btn" id="fxNow">Now</button>
      </div>
      <p class="more"><a href="../sun.html">Full light planner <span aria-hidden="true">→</span></a></p>
    </div>
  </div>
  <p class="fx-live fx-sr" id="fxSunLive" aria-live="polite"></p>
</section>

<section class="st st-events" id="fx-events" data-st="events" aria-labelledby="fxEvTitle">
  <header class="st-head">
    <p class="kicker"><span>02</span> The wall</p>
    <h2 id="fxEvTitle" tabindex="-1">Events</h2>
    <p class="lede">Michigan film events, as listed. Nothing on this wall is made up.</p>
  </header>
  <div class="ev-grid">
    <article class="cal" aria-labelledby="fxMonth">
      <span class="cal-nail" aria-hidden="true"></span>
      <div class="cal-pad">
        <div class="cal-sheet" id="fxSheet">
          <div class="cal-top">
            <button type="button" class="cal-nav" id="fxPrev" aria-label="Previous month">‹</button>
            <h3 id="fxMonth">November <span>2026</span></h3>
            <button type="button" class="cal-nav" id="fxNext" aria-label="Next month">›</button>
          </div>
          <div class="dow" aria-hidden="true"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>
          <ol class="grid" id="fxGrid" aria-label="Days"></ol>
        </div>
      </div>
    </article>
    <div class="ev-side">
      <div class="agenda" id="fxAgenda" aria-live="polite"></div>
      <div class="cork">
        <p class="cork-label">On the corkboard</p>
        <div class="cork-board">
          <button type="button" class="flyer" id="fxFlyerBtn" aria-haspopup="dialog">
            <span class="pin" aria-hidden="true"></span>
            <img id="fxFlyerThumb" src="${FLYER_ART}" alt="" width="589" height="488" loading="lazy" draggable="false">
            <span class="fx-sr">Lift the flyer to read it: </span><span class="flyer-cap">${esc(plainText(flyer?.title || ''))}</span>
          </button>
          <a class="card-link" href="../events.html"><span class="pin blue" aria-hidden="true"></span>Every listing,<br>past and coming <span aria-hidden="true">→</span></a>
        </div>
        <p class="hint">Tap the flyer to lift it off the board.</p>
      </div>
    </div>
  </div>
  <dialog class="fx-flyer" id="fxFlyerDlg" aria-labelledby="fxFlyerTitle">
    <div class="paper" id="fxPaper">
      <img id="fxFlyerImg" src="${FLYER_ART}" alt="" width="589" height="488" draggable="false">
      <div class="paper-body">
        <p class="kicker" id="fxFlyerWhen"></p>
        <h3 id="fxFlyerTitle" tabindex="-1" autofocus></h3>
        <p class="where" id="fxFlyerWhere"></p>
        <div class="paper-text" id="fxFlyerBody"></div>
        <p class="paper-links"><a id="fxFlyerLink" target="_blank" rel="noopener">Event page <span aria-hidden="true">↗</span></a><a href="../events.html">All events</a></p>
      </div>
      <button type="button" class="fx-btn primary pin-back" id="fxPinBack">Pin it back</button>
    </div>
  </dialog>
</section>

<section class="st st-fridge" id="fx-fridge" data-st="fridge" aria-labelledby="fxFrTitle">
  <header class="st-head">
    <p class="kicker"><span>03</span> The fridge</p>
    <h2 id="fxFrTitle" tabindex="-1">Story magnets</h2>
    <p class="lede">A whole film idea, spelled out in magnets. Shake the door for another.</p>
  </header>
  <div class="fr-grid">
    <div class="fr-ctl">
      <label class="field tone">Tone <select id="fxTone">${TONES.map(([id, l]) => `<option value="${id || ''}">${l}</option>`).join('')}</select></label>
      <button type="button" class="fx-btn primary shake" id="fxShake"><span class="shake-ic" aria-hidden="true">↻</span> Shake it up</button>
      <p class="hint fr-hint">Or tap the door.</p>
    </div>
    <div class="fr-stage" id="fxStage">
      <div class="fridge">
        <div class="door" id="fxDoor">
          <span class="badge" aria-hidden="true"><img src="../images/TheLaB-mark.png" alt="" draggable="false"></span>
          <span class="handle" aria-hidden="true"><i></i></span>
          <p class="fx-sr" id="fxConcept"></p>
          <div class="tiles" id="fxTiles" aria-hidden="true"></div>
          <p class="dymo" id="fxGenre" aria-hidden="true"></p>
          <dl class="notes" id="fxNotes"></dl>
        </div>
        <div class="kick" aria-hidden="true"><i></i><i></i></div>
      </div>
      <div class="debris" id="fxDebris" aria-hidden="true"></div>
    </div>
    <p class="more fr-after"><a href="../ideas.html">Full story generator <span aria-hidden="true">→</span></a><span class="more-sub">Locks, saving and 48-hour mode.</span></p>
  </div>
  <p class="fx-sr" id="fxIdeaLive" aria-live="polite"></p>
</section>

<section class="st st-projector" id="fx-projector" data-st="projector" aria-labelledby="fxPjTitle">
  <header class="st-head">
    <p class="kicker"><span>04</span> The projector</p>
    <h2 id="fxPjTitle" tabindex="-1">Selected work</h2>
    <p class="lede">Two short films from the LaB, on loop and silent. The full cuts are on YouTube.</p>
  </header>
  <div class="pj">
    <div class="pj-wall" id="fxWall">
      <svg class="beam" id="fxBeam" aria-hidden="true" focusable="false"><defs><linearGradient id="fxBeamGrad" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff2d6" stop-opacity=".55"/><stop offset="1" stop-color="#f0b46c" stop-opacity=".04"/></linearGradient><filter id="fxBeamBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter></defs><path id="fxBeamPath" fill="url(#fxBeamGrad)" filter="url(#fxBeamBlur)"/></svg>
      <div class="dust" aria-hidden="true">${'<i></i>'.repeat(14)}</div>
      <div class="screen" id="fxScreen">
        <div class="house" aria-hidden="true"></div>
        <div class="frame" id="fxFrame">
          <video id="fxVideo" muted playsinline loop preload="none" disablepictureinpicture aria-labelledby="fxFilmTitle"></video>
          <span class="flash" aria-hidden="true"></span>
          <button type="button" class="play-big" id="fxPlayBig" aria-label="Play the reel"><span aria-hidden="true"></span></button>
        </div>
        <div class="th-bar" role="group" aria-label="Screening controls">
          <span class="th-title"><span id="fxThTitle"></span><span class="th-turn">Turn your phone sideways for a bigger picture.</span></span>
          <button type="button" class="fx-btn ghost" id="fxThPlay">Pause</button>
          <button type="button" class="fx-btn ghost" id="fxThFull">Full screen</button>
          <button type="button" class="fx-btn primary" id="fxLightsUp">Lights up</button>
        </div>
      </div>
      <div class="pj-rig">
        <div class="pj-machine" id="fxMachine">${projectorSVG()}</div>
        <div class="pj-info">
          <h3 id="fxFilmTitle">MOZ Interiors</h3>
          <p class="pj-note" id="fxFilmNote"></p>
        </div>
      </div>
    </div>
    <div class="pj-ctl">
      <div class="pj-btns">
        <button type="button" class="fx-btn primary" id="fxWatch"><span class="watch-ic" aria-hidden="true"></span> Watch</button>
        <button type="button" class="fx-btn" id="fxPlay">Pause</button>
        <button type="button" class="fx-btn" id="fxFull">Full screen</button>
      </div>
      <p class="hint turn-hint">Turn your phone sideways for a bigger picture.</p>
      <div class="reels" role="group" aria-label="Choose a reel">${reelCards}</div>
      <p class="more"><a id="fxYT" href="#" target="_blank" rel="noopener">Watch the full film on YouTube <span aria-hidden="true">↗</span></a><a href="../tools-concept/work.html">All selected work <span aria-hidden="true">→</span></a></p>
    </div>
  </div>
</section>

<footer class="fx-foot">
  <img src="../images/TheLaB-mark.png" alt="" width="56" height="30" draggable="false">
  <p>The LaB · a creative studio in ${PLACE.label}.</p>
  <p class="foot-links"><a href="../sun.html">Light planner</a><a href="../events.html">Events</a><a href="../ideas.html">Story generator</a><a href="../index.html#directory">Directory</a></p>
</footer>`;
}

/* ================================================================== 1. the window */
const pane = (() => {   // the window's glass, in metres on the wall plane (x across, y up), 3 × 4 lites
  const xs = [[-.86, -.32], [-.28, .28], [.32, .86]], ys = [];
  for (let i = 0; i < 4; i++) ys.push([.53 + i * .5675 + .02, .53 + (i + 1) * .5675 - .02]);
  return xs.flatMap(x => ys.map(y => ({ x, y })));
})();
const proj = (x, z) => { const k = 600 / (6 - z); return [180 + k * x, 170 + 900 / (6 - z)]; };   // floor point → room picture
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const v of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], v) <= 0) lo.pop(); lo.push(v); }
  for (const v of p.reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], v) <= 0) up.pop(); up.push(v); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
const pathOf = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
let R = null;   // cached room nodes
function renderWindow() {
  if (!R) return;
  const m = S.minute, t = instant(S.date, m);
  const { azimuth: A, elevation: E } = LaBSun.position(t, PLACE.lat, PLACE.lon);
  const r = ((A - WINDOW_FACES + 540) % 360) - 180;
  const [top, mid, hz] = ramp(SKY, E), [sunC] = ramp(SUN, E), [patchC] = ramp(PATCH, E), [tree] = ramp(TREES, E), [field] = ramp(FIELD, E);
  const gold = smooth(-1.5, 1, E) * (1 - smooth(6, 11, E));
  const direct = smooth(-.3, 2.5, E) * (1 - smooth(70, 88, Math.abs(r)));
  const set = (el, a, v) => el.setAttribute(a, v);
  set(R.skyTop, 'stop-color', top); set(R.skyMid, 'stop-color', mid); set(R.skyHz, 'stop-color', hz);
  // the sun's place in the window: a wide view so the evening arc crosses the glass
  const sx = 180 + 90 * (r / 80), sy = 172 - E * 6.6;
  set(R.sun, 'cx', sx.toFixed(1)); set(R.sun, 'cy', sy.toFixed(1)); set(R.sun, 'fill', sunC); R.sun.style.opacity = smooth(-3, -.5, E);
  set(R.halo, 'cx', sx.toFixed(1)); set(R.halo, 'cy', sy.toFixed(1)); set(R.haloMid, 'stop-color', sunC); set(R.haloEnd, 'stop-color', sunC);
  R.halo.style.opacity = smooth(-4, 0, E) * (.55 + gold * .45);
  set(R.hz, 'cx', clamp(sx, 40, 320).toFixed(1)); set(R.hzC, 'stop-color', mixC(hz, sunC, .5)); set(R.hzE, 'stop-color', hz);
  R.hz.style.opacity = smooth(-9, -2, E) * (1 - smooth(8, 18, E)) * .9;
  R.stars.style.opacity = (1 - smooth(-10, -4, E)).toFixed(2);
  set(R.near, 'fill', tree); set(R.far, 'fill', mixC(tree, hz, .42));
  set(R.fieldA, 'stop-color', mixC(field, hz, .25)); set(R.fieldB, 'stop-color', field);
  R.shade.style.opacity = (.04 + .86 * (1 - smooth(-8, 8, E))).toFixed(3);
  R.warm.style.opacity = (gold * .75 * Math.max(.25, direct)).toFixed(3);
  const lamp = 1 - smooth(-6, 1, E);
  R.lamp.style.opacity = lamp.toFixed(2); R.bulb.style.opacity = (.2 + lamp * .8).toFixed(2);
  // the patch: every lite of the window thrown down onto the oak
  if (direct > .004) {
    const k = 1 / Math.tan(Math.max(E, .4) * Math.PI / 180), sr = Math.sin(r * Math.PI / 180), cr = Math.cos(r * Math.PI / 180);
    // the floor we can see is only ~2.6 m deep, so the throw is eased in: low sun still reaches toward you, high sun stays by the wall
    const onFloor = (x, y) => { const zt = Math.max(1e-3, y * cr * k), zd = 2.55 * (1 - Math.exp(-zt / 7.5)), s = zd / zt; return proj(x - y * sr * k * s, zd); };
    let d = '';
    for (const p of pane) d += pathOf([onFloor(p.x[0], p.y[1]), onFloor(p.x[1], p.y[1]), onFloor(p.x[1], p.y[0]), onFloor(p.x[0], p.y[0])]);
    set(R.patch, 'd', d); set(R.patch, 'fill', patchC);
    R.patch.style.opacity = (direct * (.55 + gold * .35)).toFixed(3);
    const outer = [[-.9, .5], [.9, .5], [.9, 2.8], [-.9, 2.8]];
    const win = outer.map(([x, y]) => [180 + 100 * x, 170 + 100 * (1.5 - y)]), fl = outer.map(([x, y]) => onFloor(x, y));
    set(R.shaft, 'd', pathOf(hull(win.concat(fl))));
    set(R.shaftA, 'stop-color', patchC); set(R.shaftB, 'stop-color', patchC);
    R.shaft.style.opacity = (direct * (.18 + gold * .55)).toFixed(3);
    const c = fl.reduce((a, p) => a + p[0], 0) / 4;
    set(R.bounce, 'cx', c.toFixed(1)); set(R.bounce, 'fill', patchC); R.bounce.style.opacity = (direct * (.22 + gold * .3)).toFixed(3);
  } else { R.patch.style.opacity = 0; R.shaft.style.opacity = 0; R.bounce.style.opacity = 0; }
  // lens bloom: only when the sun sits in the glass, strongest at golden hour
  const inView = 1 - smooth(78, 100, Math.abs(sx - 180)), flare = smooth(-1.2, 1.2, E) * (1 - smooth(9, 24, E)) * inView * (sy < 268 ? 1 : 0);
  R.flare.style.opacity = flare.toFixed(3);
  if (flare > .01) {
    set(R.bloom, 'cx', sx.toFixed(1)); set(R.bloom, 'cy', sy.toFixed(1)); set(R.bloomMid, 'stop-color', sunC); set(R.bloomEnd, 'stop-color', sunC);
    set(R.streak, 'y', (sy - 1.2).toFixed(1)); set(R.streak2, 'y', (sy - 4.5).toFixed(1));
    R.ghosts.forEach((g, i) => { const kx = [1.5, 1.9, 2.4][i]; set(g, 'cx', (sx + (180 - sx) * kx).toFixed(1)); set(g, 'cy', (sy + (205 - sy) * kx).toFixed(1)); });
  }
  // readouts
  const phase = PHASES[LaBSun.phaseAt(t, S.day)] || 'Night', clock = clockOf(m);
  R.clock.textContent = clock; R.phase.textContent = phase; R.phase.dataset.phase = phase.split(' ')[0].toLowerCase();
  R.sub.textContent = `${dayLabel(S.date)} · sun ${Math.abs(E).toFixed(0)}° ${E >= 0 ? 'up' : 'below the horizon'}, ${LaBSun.direction(A)}`;
  R.scrub.value = String(Math.round(m)); R.scrub.setAttribute('aria-valuetext', `${clock}, ${phase.toLowerCase()}`);
  const pct = (m - S.lo) / (S.hi - S.lo);
  R.arcSun.style.left = `calc(16px + (100% - 32px) * ${pct.toFixed(4)})`;
  R.arcSun.style.top = `${(arcY(E) / 160 * ARC_H).toFixed(1)}px`;
  R.arcSun.style.background = E > -1 ? sunC : '#9fb0e8';
  R.arcSun.classList.toggle('down', E < 0);
  // the light spills onto the whole page, and into the dock icon
  root.style.setProperty('--fx-sky', E > 4 ? mixC('#1d1a14', top, .25) : mixC(top, sunC, gold * .6));
  root.style.setProperty('--fx-glow-a', (.1 + gold * .22 + lamp * .04).toFixed(3));
  root.style.setProperty('--fx-sun', E > -1 ? sunC : '#9fb0e8');
  qa('.fx-marks-btn', R.marks).forEach(b => b.classList.toggle('on', b.dataset.phase === phase.split(' ')[0].toLowerCase()));
}
let arcRange = [-12, 30];
const ARC_H = 112;   // px height of the arc plot (matches flat.css .arc-svg)
const arcY = E => 150 - (E - arcRange[0]) / (arcRange[1] - arcRange[0]) * 136;
function drawArc() {
  if (!R) return;
  const pts = [];
  let lo = 90, hi = -90;
  for (let m = S.lo; m <= S.hi; m += 5) { const E = LaBSun.position(instant(S.date, m), PLACE.lat, PLACE.lon).elevation; pts.push([m, E]); lo = Math.min(lo, E); hi = Math.max(hi, E); }
  arcRange = [Math.min(lo, -9), Math.max(hi, 10) + 3];
  const X = m => (m - S.lo) / (S.hi - S.lo) * 1000;
  R.arcPath.setAttribute('d', 'M' + pts.map(([m, E]) => `${X(m).toFixed(1)} ${arcY(E).toFixed(1)}`).join('L'));
  const y0 = arcY(0), y6 = arcY(6), yn6 = arcY(-6);
  R.bandGold.setAttribute('y', y6.toFixed(1)); R.bandGold.setAttribute('height', (y0 - y6).toFixed(1));
  R.bandBlue.setAttribute('y', y0.toFixed(1)); R.bandBlue.setAttribute('height', (yn6 - y0).toFixed(1));
  R.hzLine.setAttribute('y1', y0.toFixed(1)); R.hzLine.setAttribute('y2', y0.toFixed(1));
  root.querySelector('.arc-key.gold').style.top = `${(y6 / 160 * ARC_H).toFixed(1)}px`;
  root.querySelector('.arc-key.blue').style.top = `${(y0 / 160 * ARC_H).toFixed(1)}px`;
  R.scrub.min = String(S.lo); R.scrub.max = String(S.hi);
  // the slider track is painted with the day's light, like the 3D dock
  const d = S.day, at = t => clamp((minuteOf(t) - S.lo) / (S.hi - S.lo) * 100, 0, 100).toFixed(1);
  R.scrub.style.setProperty('--track', `linear-gradient(90deg,#1d2950 0%,#3c4c86 ${at(d.civilDawn)}%,#e8a35c ${at(d.sunrise)}%,#f1c98a ${at(d.morningGoldenEnd)}%,#cfd9e0 ${+at(d.morningGoldenEnd) + 2}%,#cfd9e0 ${+at(d.eveningGoldenStart) - 2}%,#f1c98a ${at(d.eveningGoldenStart)}%,#e8873f ${at(d.sunset)}%,#3c4c86 ${at(d.civilDusk)}%,#1d2950 100%)`);
  const f = x => fmtClock.format(x);
  const marks = [
    ['sunrise', 'Sunrise', f(d.sunrise), minuteOf(d.sunrise)],
    ['golden', 'Golden hour', f(d.eveningGoldenStart), minuteOf(d.eveningGoldenStart)],
    ['sunset', 'Sunset', f(d.sunset), minuteOf(d.sunset)],
    ['blue', 'Blue hour', `${f(d.sunset).replace(/ [AP]M/, '')}–${f(d.civilDusk)}`, Math.round((minuteOf(d.sunset) + minuteOf(d.civilDusk)) / 2)],
  ];
  R.marks.innerHTML = marks.map(([id, label, time, to]) => `<button type="button" class="fx-marks-btn" data-phase="${id}" data-to="${to}"><span>${label}</span><b>${time}</b></button>`).join('');
}
let travel = 0;
function travelTo(target, ms = 1300, announce = '') {
  cancelAnimationFrame(travel);
  target = clamp(target, S.lo, S.hi);
  const done = () => { writeURL(); if (announce) R.live.textContent = announce; };
  if (calm()) { S.minute = target; renderWindow(); return done(); }
  const from = S.minute, t0 = performance.now(), dur = clamp(ms * Math.sqrt(Math.abs(target - from) / 240), 450, ms);
  const step = now => {
    const k = clamp((now - t0) / dur, 0, 1), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    S.minute = from + (target - from) * e; renderWindow();
    if (k < 1 && live) travel = requestAnimationFrame(step); else { S.minute = Math.round(S.minute); done(); }
  };
  travel = requestAnimationFrame(step);
}
function wireWindow() {
  const g = id => root.querySelector('#' + id);
  R = {
    skyTop: g('fxSkyTop'), skyMid: g('fxSkyMid'), skyHz: g('fxSkyHz'), sun: g('fxSun'), halo: g('fxHalo'), haloMid: g('fxHaloMid'), haloEnd: g('fxHaloEnd'),
    hz: g('fxHz'), hzC: g('fxHzC'), hzE: g('fxHzE'), stars: g('fxStars'), near: g('fxNear'), far: g('fxFar'), fieldA: g('fxFieldA'), fieldB: g('fxFieldB'),
    shade: g('fxShade'), warm: g('fxWarm'), lamp: g('fxLamp'), bulb: g('fxBulb'), patch: g('fxPatch'), shaft: g('fxShaft'), shaftA: g('fxShaftA'), shaftB: g('fxShaftB'), bounce: g('fxBounce'),
    flare: g('fxFlare'), bloom: g('fxBloom'), bloomMid: g('fxBloomMid'), bloomEnd: g('fxBloomEnd'), streak: g('fxStreak'), streak2: g('fxStreak2'), ghosts: qa('.ghost', g('fxFlare')),
    clock: g('fxClock'), phase: g('fxPhase'), sub: g('fxSub'), scrub: g('fxScrub'), arcSun: g('fxArcSun'), arcPath: g('fxArcPath'), bandGold: g('fxBandGold'), bandBlue: g('fxBandBlue'), hzLine: g('fxHzLine'),
    marks: g('fxMarks'), date: g('fxDate'), live: g('fxSunLive'),
  };
  R.scrub.addEventListener('input', () => { cancelAnimationFrame(travel); S.minute = +R.scrub.value; renderWindow(); writeURL(); });
  R.marks.addEventListener('click', e => {
    const b = e.target.closest('[data-to]'); if (!b) return;
    travelTo(+b.dataset.to, 1500, `${b.querySelector('span').textContent}: ${b.querySelector('b').textContent}`);
  });
  R.date.addEventListener('change', () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(R.date.value)) return;
    S.date = R.date.value; setDay(); S.minute = clamp(S.minute, S.lo, S.hi); drawArc(); renderWindow(); writeURL();
    syncCalendarToDate();
  });
  g('fxNow').addEventListener('click', () => {
    const now = localParts(new Date());
    if (S.date !== now.date) { S.date = now.date; R.date.value = S.date; setDay(); drawArc(); syncCalendarToDate(); }
    travelTo(now.minute, 1500, `Now: ${clockOf(clamp(now.minute, S.lo, S.hi))}`);
  });
}

/* ================================================================== 2. the wall */
const ended = r => (r.until || r.date) < today();
let calY = 2026, calM = 10, flipping = false;
function eventsIn(y, m) {
  const key = `${y}-${String(m + 1).padStart(2, '0')}`;
  return records.filter(r => r.date.startsWith(key) || (r.until && r.date <= `${key}-31` && r.until >= `${key}-01`));
}
const fmtDay = ds => new Date(ds + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fmtWeek = ds => new Date(ds + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
function drawCalendar() {
  const tdy = today();
  q('#fxMonth', root).innerHTML = `${MONTHS[calM]} <span>${calY}</span>`;
  const first = new Date(Date.UTC(calY, calM, 1)).getUTCDay(), days = new Date(Date.UTC(calY, calM + 1, 0)).getUTCDate();
  const list = eventsIn(calY, calM), cells = [];
  for (let i = 0; i < 42; i++) {
    const n = i - first + 1;
    if (i >= 35 && n > days) break;
    if (n < 1 || n > days) { cells.push('<li class="out" aria-hidden="true"></li>'); continue; }
    const ds = `${calY}-${String(calM + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
    const hits = list.filter(r => r.date === ds || (r.until && r.date <= ds && r.until >= ds));
    const cls = [ds === tdy ? 'today' : '', hits.length ? 'has' : '', hits.length && hits.every(ended) ? 'past' : ''].join(' ').trim();
    cells.push(hits.length
      ? `<li class="${cls}"><button type="button" data-id="${hits[0].id}" aria-label="${MONTHS[calM]} ${n}: ${esc(plainText(hits[0].title))}${hits.length > 1 ? ` and ${hits.length - 1} more` : ''}"><span class="n">${n}</span><span class="ring" aria-hidden="true"></span><span class="tag" aria-hidden="true">${esc(plainText(hits[0].title).split(':')[0])}</span></button></li>`
      : `<li class="${cls}"${ds === tdy ? ' aria-current="date"' : ''}><span class="n">${n}</span></li>`);
  }
  q('#fxGrid', root).innerHTML = cells.join('');
  const ag = q('#fxAgenda', root);
  if (list.length) {
    ag.innerHTML = `<h3 class="ag-head">In ${MONTHS[calM]}</h3><ul>${list.map(r => `
      <li class="ag ${ended(r) ? 'past' : ''}" id="fxag-${r.id}">
        <span class="ag-date"><b>${+r.date.slice(8)}</b><span>${fmtWeek(r.date)}</span></span>
        <span class="ag-body">
          <a href="${esc(r.url || r.byUrl)}" target="_blank" rel="noopener">${r.title}<span class="fx-sr"> (opens in a new tab)</span></a>
          <span class="ag-meta">${esc(plainText(r.time || ''))}${r.time ? ' · ' : ''}${esc(r.venue || r.where || r.by || '')}</span>
          <span class="ag-tags">${ended(r) ? '<span class="chip">Happened</span>' : '<span class="chip up">Coming up</span>'}${r === flyer ? '<button type="button" class="chip flyer-chip" data-flyer>See the flyer</button>' : ''}</span>
        </span>
      </li>`).join('')}</ul>`;
  } else {
    const mk = `${calY}-${String(calM + 1).padStart(2, '0')}`;
    const next = records.find(r => r.date > `${mk}-31`), last = [...records].reverse().find(r => r.date < `${mk}-01`);
    const jump = next || last;
    ag.innerHTML = `<h3 class="ag-head">In ${MONTHS[calM]}</h3><p class="empty">Nothing pinned for ${MONTHS[calM]} yet.</p>${jump ? `<button type="button" class="fx-btn jump" data-jump="${jump.date}">${next ? 'Next' : 'Latest'}: ${esc(plainText(jump.title))}, ${fmtDay(jump.date)} <span aria-hidden="true">${next ? '→' : '←'}</span></button>` : ''}`;
  }
}
function flipTo(y, m) {
  const delta = (y - calY) * 12 + (m - calM);
  if (!delta) return;
  const sheet = q('#fxSheet', root);
  if (calm() || flipping || !live) { calY = y; calM = m; drawCalendar(); return; }
  flipping = true; sound('flip');
  // the old page stays in place as a paper ghost while the real sheet takes the new month
  const ghost = sheet.cloneNode(true);
  ghost.removeAttribute('id'); qa('[id]', ghost).forEach(n => n.removeAttribute('id')); ghost.inert = true; ghost.classList.add('ghost');
  ghost.setAttribute('aria-hidden', 'true');
  sheet.parentNode.appendChild(ghost);
  calY = y; calM = m; drawCalendar();
  let a;
  if (delta > 0) {   // tear-off: the old page lifts toward you and over the top rail
    ghost.style.zIndex = 2;
    a = ghost.animate([
      { transform: 'perspective(1100px) rotateX(0deg)', filter: 'brightness(1)' },
      { transform: 'perspective(1100px) rotateX(38deg) translateY(-2%)', filter: 'brightness(1.06)', offset: .35 },
      { transform: 'perspective(1100px) rotateX(96deg) translateY(-6%)', filter: 'brightness(.7)' }],
    { duration: 620, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' });
    sheet.animate([{ filter: 'brightness(.82)' }, { filter: 'brightness(1)' }], { duration: 620, easing: 'ease-out' });
  } else {           // back a month: the page falls down from over the rail and settles
    ghost.style.zIndex = 0; sheet.style.zIndex = 2; sheet.style.position = 'relative';
    a = sheet.animate([
      { transform: 'perspective(1100px) rotateX(100deg)', filter: 'brightness(.7)' },
      { transform: 'perspective(1100px) rotateX(-9deg)', filter: 'brightness(1)', offset: .62 },
      { transform: 'perspective(1100px) rotateX(4deg)', offset: .82 },
      { transform: 'perspective(1100px) rotateX(0deg)' }],
    { duration: 700, easing: 'cubic-bezier(.3,.6,.4,1)' });
  }
  a.onfinish = a.oncancel = () => { ghost.remove(); sheet.style.zIndex = ''; flipping = false; };
}
function syncCalendarToDate() { const y = +S.date.slice(0, 4), m = +S.date.slice(5, 7) - 1; if (y !== calY || m !== calM) { calY = y; calM = m; drawCalendar(); } }

let lifting = false;
function fillFlyer() {
  if (!flyer) return;
  q('#fxFlyerImg', root).alt = typeof flyer.photos?.[0] === 'object' ? flyer.photos[0].alt : `Flyer for ${plainText(flyer.title)}`;
  q('#fxFlyerWhen', root).textContent = new Date(flyer.date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) + (flyer.time ? ' · ' + plainText(flyer.time) : '') + (ended(flyer) ? ' · happened' : '');
  q('#fxFlyerTitle', root).innerHTML = flyer.title;
  q('#fxFlyerWhere', root).textContent = [flyer.venue, flyer.address].filter(Boolean).join(' · ');
  q('#fxFlyerBody', root).innerHTML = flyer.body || '';
  q('#fxFlyerLink', root).href = flyer.url || flyer.byUrl;
}
async function liftFlyer() {
  const dlg = q('#fxFlyerDlg', root), paper = q('#fxPaper', root), thumb = q('#fxFlyerThumb', root), btn = q('#fxFlyerBtn', root);
  if (lifting || dlg.open) return;
  lifting = true;
  const from = thumb.getBoundingClientRect();
  dlg.showModal(); paper.scrollTop = 0;
  btn.classList.add('lifted');
  if (calm()) { lifting = false; return; }
  dlg.classList.add('lifting');
  const img = q('#fxFlyerImg', root).getBoundingClientRect(), box = paper.getBoundingClientRect();
  const s = from.width / img.width, dx = from.left - (box.left + (img.left - box.left) * s), dy = from.top - (box.top + (img.top - box.top) * s);
  const text = qa('.paper-body, .pin-back', paper);
  // the top edge leaves the pin first, the sheet bows toward you, then lands square in front of you
  const a = paper.animate([
    { transform: `translate(${dx}px,${dy}px) scale(${s}) rotate(-2.5deg)`, boxShadow: '0 2px 4px #0006', clipPath: `inset(0 0 ${((1 - (img.height / box.height)) * 100).toFixed(1)}% 0)` },
    { transform: `translate(${dx * .45}px,${dy * .45 - 40}px) scale(${mix(s, 1, .6)}) perspective(900px) rotateX(16deg) rotate(1deg)`, boxShadow: '0 40px 60px #000a', offset: .5 },
    { transform: 'none', boxShadow: '0 24px 60px #000b', clipPath: 'inset(0 0 0% 0)' }],
  { duration: 720, easing: 'cubic-bezier(.2,.75,.25,1)' });
  text.forEach(t => t.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 0, offset: .55 }, { opacity: 1, transform: 'none' }], { duration: 760, easing: 'ease-out' }));
  await a.finished.catch(() => { });
  dlg.classList.remove('lifting'); lifting = false;
}
async function pinBack() {
  const dlg = q('#fxFlyerDlg', root), paper = q('#fxPaper', root), thumb = q('#fxFlyerThumb', root), btn = q('#fxFlyerBtn', root);
  if (lifting || !dlg.open) return;
  if (!calm() && live) {
    lifting = true; dlg.classList.add('lifting');
    paper.scrollTop = 0;
    const to = thumb.getBoundingClientRect(), img = q('#fxFlyerImg', root).getBoundingClientRect(), box = paper.getBoundingClientRect();
    const s = to.width / img.width, dx = to.left - (box.left + (img.left - box.left) * s), dy = to.top - (box.top + (img.top - box.top) * s);
    qa('.paper-body, .pin-back', paper).forEach(t => t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }));
    const a = paper.animate([
      { transform: 'none', clipPath: 'inset(0 0 0% 0)' },
      { transform: `translate(${dx}px,${dy}px) scale(${s}) rotate(-2.5deg)`, clipPath: `inset(0 0 ${((1 - (img.height / box.height)) * 100).toFixed(1)}% 0)` }],
    { duration: 480, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
    await a.finished.catch(() => { });
    a.cancel(); qa('.paper-body, .pin-back', paper).forEach(t => t.getAnimations().forEach(x => x.cancel()));
    dlg.classList.remove('lifting'); lifting = false;
  }
  dlg.close(); btn.classList.remove('lifted');
  if (!calm()) btn.animate([{ transform: 'rotate(-2.5deg)' }, { transform: 'rotate(1.8deg)' }, { transform: 'rotate(-3.6deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(-2.5deg)' }], { duration: 700, easing: 'ease-out' });
  btn.focus({ preventScroll: true });
}
function wireEvents() {
  q('#fxPrev', root).onclick = () => { let y = calY, m = calM - 1; if (m < 0) { m = 11; y--; } flipTo(y, m); };
  q('#fxNext', root).onclick = () => { let y = calY, m = calM + 1; if (m > 11) { m = 0; y++; } flipTo(y, m); };
  q('.ev-grid', root).addEventListener('click', e => {
    const jump = e.target.closest('[data-jump]');
    if (jump) { const [y, m] = jump.dataset.jump.split('-').map(Number); flipTo(y, m - 1); setTimeout(() => q('#fxMonth', root).focus?.(), 50); return; }
    const day = e.target.closest('[data-id]');
    if (day) {
      const row = q('#fxag-' + CSS.escape(day.dataset.id), root);
      if (row) {
        row.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'nearest' });
        if (!calm()) row.animate([{ backgroundColor: '#f0b46c44' }, { backgroundColor: '#f0b46c00' }], { duration: 1400, easing: 'ease-out' });
        row.querySelector('a')?.focus({ preventScroll: true });
      }
    }
    if (e.target.closest('[data-flyer]')) liftFlyer();
  });
  q('#fxMonth', root).tabIndex = -1;
  q('#fxFlyerBtn', root).addEventListener('click', liftFlyer);
  q('#fxPinBack', root).addEventListener('click', pinBack);
  const dlg = q('#fxFlyerDlg', root);
  dlg.addEventListener('cancel', e => { e.preventDefault(); pinBack(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) pinBack(); });
  fillFlyer();
}

/* ================================================================== 3. the fridge */
function rollStory() {
  if (!window.rollIdea || !window.ideasData) return { concept: 'The magnet tin is empty.', genre: '', rows: [['Try', 'the full story generator']] };
  const r = window.rollIdea(window.ideasData, S.tone ? { tone: S.tone } : {}), t = r.text;
  return { concept: t.concept, genre: t.genre, rows: [r.picks.place?.fromConcept ? null : ['Place', t.place], ['Who', t.character], ['Thing', t.object], ['Twist', t.twist]].filter(x => x && x[1]) };
}
const jitter = (i, k) => (((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1) + 1) % 1;
function placeIdea(idea, seed = Math.random() * 100) {
  // magnetic poetry: one tile per word, the odd comma on its own little tile
  const words = idea.concept.replace(/[“”"]/g, '').split(/\s+/).filter(Boolean);
  const tiles = [];
  words.forEach((w, i) => {
    const m = w.match(/^(.*?)([.,;:!?]+)$/);
    const parts = m && m[1] ? [m[1], m[2]] : [w];
    parts.forEach((p, j) => tiles.push(`<span class="tile${j ? ' punct' : ''}" style="--r:${((jitter(i + j * .5, seed) - .5) * 5).toFixed(2)}deg;--y:${((jitter(i, seed + 3) - .5) * 4).toFixed(1)}px">${esc(p)}</span>`));
  });
  q('#fxTiles', root).innerHTML = tiles.join('');
  q('#fxConcept', root).textContent = idea.concept;
  const g = q('#fxGenre', root); g.textContent = idea.genre || ''; g.hidden = !idea.genre;
  q('#fxNotes', root).innerHTML = idea.rows.slice(0, 4).map(([label, text], i) => {
    const kind = NOTE_KIND[label] || 'twist';
    return `<div class="note n-${kind}" style="--r:${((jitter(i, seed + 9) - .5) * 5).toFixed(2)}deg"><span class="magnet">${MAGNETS[kind]}</span><dt>${label}</dt><dd>${esc(text)}</dd></div>`;
  }).join('');
}
let shaking = false, debrisRAF = 0;
async function shake() {
  if (shaking || !live) return;
  const next = rollStory();
  const live$ = q('#fxIdeaLive', root);
  if (calm()) { S.idea = next; placeIdea(next); live$.textContent = 'New idea: ' + next.concept; return; }
  shaking = true;
  const door = q('#fxDoor', root), stage = q('#fxStage', root), tilesEl = q('#fxTiles', root);
  sound('door');
  // yank the door open on its right hinge, then slam it
  door.animate([
    { transform: 'perspective(1400px) rotateY(0deg)' },
    { transform: 'perspective(1400px) rotateY(17deg)', offset: .38 },
    { transform: 'perspective(1400px) rotateY(16deg)', offset: .5 },
    { transform: 'perspective(1400px) rotateY(-1.6deg)', offset: .78 },
    { transform: 'perspective(1400px) rotateY(.6deg)', offset: .9 },
    { transform: 'perspective(1400px) rotateY(0deg)' }], { duration: 640, easing: 'cubic-bezier(.3,.1,.3,1)' });
  await wait(440);
  if (!live) { shaking = false; return; }
  // the slam knocks everything off: clone each tile and note into the debris layer and let gravity have it
  const sr = stage.getBoundingClientRect(), floorY = sr.height - 6;
  const bodies = [];
  for (const el of qa('.tile, .note', door)) {
    const r = el.getBoundingClientRect();
    const c = el.cloneNode(true); c.style.position = 'absolute'; c.style.left = '0'; c.style.top = '0'; c.style.width = r.width + 'px'; c.style.margin = '0';
    c.style.setProperty('--r', '0deg'); c.style.setProperty('--y', '0px');
    q('#fxDebris', root).appendChild(c);
    const note = el.classList.contains('note');
    bodies.push({ el: c, x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height, vx: (Math.random() - .45) * (note ? 160 : 320), vy: -60 - Math.random() * (note ? 120 : 280),
      a: parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 0, va: (Math.random() - .5) * (note ? 260 : 900), rest: 0, floor: floorY - Math.random() * 26, bounce: note ? .22 : .42 });
  }
  const oldH = tilesEl.offsetHeight;
  S.idea = next; placeIdea(next);
  qa('.tile, .note', door).forEach(el => { el.style.opacity = '0'; });
  const newH = tilesEl.offsetHeight;
  if (Math.abs(newH - oldH) > 2) tilesEl.animate([{ height: oldH + 'px' }, { height: newH + 'px' }], { duration: 420, easing: 'cubic-bezier(.3,.8,.3,1)' });
  runDebris(bodies, sr.width);
  live$.textContent = 'New idea: ' + next.concept;
  await wait(160);
  // the new words slap on one by one, then the prop magnets pin the brief
  const tiles = qa('.tile', door);
  tiles.forEach((t, i) => {
    const r = getComputedStyle(t).getPropertyValue('--r').trim() || '0deg';
    t.style.opacity = '';
    t.animate([
      { opacity: 0, transform: `translate(${(Math.random() * 30 - 8).toFixed(0)}px,-34px) scale(1.5) rotate(calc(${r} + 9deg))`, boxShadow: '0 22px 22px #0004' },
      { opacity: 1, transform: `translateY(var(--y)) scale(.94) rotate(${r})`, boxShadow: '0 1px 1px #0005', offset: .62 },
      { transform: `translateY(var(--y)) scale(1.03) rotate(${r})`, offset: .82 },
      { transform: `translateY(var(--y)) scale(1) rotate(${r})` }],
    { duration: 300, delay: i * 48, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'backwards' })
      .finished.then(() => { if (i % 2 === 0) sound('slap'); }).catch(() => { });
  });
  const notesAt = tiles.length * 48 + 160;
  qa('.note', door).forEach((n, i) => {
    const r = getComputedStyle(n).getPropertyValue('--r').trim() || '0deg';
    n.style.opacity = '';
    const mag = n.querySelector('.magnet');
    mag.animate([{ opacity: 0, transform: 'translate(-50%,-26px) scale(1.7)' }, { opacity: 1, transform: 'translate(-50%,0) scale(.9)', offset: .6 }, { transform: 'translate(-50%,0) scale(1)' }],
      { duration: 260, delay: notesAt + i * 140, easing: 'ease-in', fill: 'backwards' });
    n.animate([
      { opacity: 0, transform: `rotate(calc(${r} - 24deg)) translateY(-8px)` },
      { opacity: 1, transform: `rotate(calc(${r} + 9deg))`, offset: .4 },
      { transform: `rotate(calc(${r} - 5deg))`, offset: .62 },
      { transform: `rotate(calc(${r} + 2deg))`, offset: .82 },
      { transform: `rotate(${r})` }],
    { duration: 900, delay: notesAt + i * 140 + 120, easing: 'ease-out', fill: 'backwards' });
  });
  await wait(notesAt + 4 * 140 + 400);
  shaking = false;
}
function runDebris(bodies, width) {
  cancelAnimationFrame(debrisRAF);
  let last = performance.now(), age = 0;
  const step = now => {
    const dt = Math.min(.033, (now - last) / 1000); last = now; age += dt;
    for (const b of bodies) {
      if (b.rest < 1) {
        b.vy += 2600 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.va * dt;
        if (b.x < -b.w * .3) { b.x = -b.w * .3; b.vx = Math.abs(b.vx) * .4; }
        if (b.x + b.w * .7 > width) { b.x = width - b.w * .7; b.vx = -Math.abs(b.vx) * .4; }
        if (b.y + b.h * .5 > b.floor) {   // hit the floor: bounce, lose spin, settle flat-ish
          b.y = b.floor - b.h * .5; b.vy = -Math.abs(b.vy) * b.bounce; b.vx *= .62; b.va *= -.45;
          if (Math.abs(b.vy) < 70) { b.vy = 0; b.va = 0; b.rest = 1; b.a = Math.round(b.a / 180) * 180 + (Math.random() - .5) * 14; }
        }
      }
      b.el.style.transform = `translate3d(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px,0) rotate(${b.a.toFixed(1)}deg)`;
      if (age > 1.5) b.el.style.opacity = String(Math.max(0, 1 - (age - 1.5) / .5));
    }
    if (age < 2.05 && live) debrisRAF = requestAnimationFrame(step);
    else bodies.forEach(b => b.el.remove());
  };
  debrisRAF = requestAnimationFrame(step);
}
function wireFridge() {
  const tone = q('#fxTone', root);
  tone.value = S.tone;
  tone.addEventListener('change', () => { S.tone = tone.value; writeURL(true); shake(); });
  q('#fxShake', root).addEventListener('click', shake);
  q('#fxDoor', root).addEventListener('click', e => { if (!e.target.closest('a,button')) shake(); });
  S.idea = rollStory(); placeIdea(S.idea, 1);
}
function enterFridge() {   // first visit: the magnets land as you walk up
  if (calm()) return;
  qa('.tile', root.querySelector('#fxDoor')).forEach((t, i) => {
    const r = getComputedStyle(t).getPropertyValue('--r').trim() || '0deg';
    t.animate([{ opacity: 0, transform: `translateY(-18px) scale(1.25) rotate(${r})` }, { opacity: 1, transform: `translateY(var(--y)) scale(1) rotate(${r})` }], { duration: 280, delay: 120 + i * 35, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
  });
  qa('.note', root).forEach((n, i) => n.animate([{ opacity: 0, transform: 'rotate(-14deg)' }, { opacity: 1, transform: 'rotate(var(--r))' }], { duration: 700, delay: 500 + i * 110, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' }));
}

/* ================================================================== 4. the projector */
let V = null, userPaused = false, inView = false, theatre = false, loaded = false, idleTimer = 0;
function loadFilm(id, keepSrc) {
  S.film = id; const f = FILMS[id];
  V.poster = f.poster;
  if (loaded && !keepSrc) V.src = f.src;
  q('#fxFilmTitle', root).textContent = f.title;
  q('#fxThTitle', root).textContent = `${f.title} · ${f.kind}`;
  q('#fxFilmNote', root).textContent = f.note;
  q('#fxYT', root).href = f.yt;
  qa('.reel-card', root).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.film === id)));
}
function ensureSrc() { if (!loaded) { loaded = true; V.preload = 'auto'; V.src = FILMS[S.film].src; } }
function syncVideo() {
  if (!V) return;
  const want = live && !userPaused && (inView || theatre) && !document.hidden;
  if (want) { ensureSrc(); if (V.paused) V.play().catch(() => { userPaused = true; labelPlay(); }); }
  else if (!V.paused) V.pause();
  labelPlay();
}
function labelPlay() {
  const on = !userPaused;
  for (const id of ['fxPlay', 'fxThPlay']) q('#' + id, root).textContent = on ? 'Pause' : 'Play';
  root.querySelector('.pj').classList.toggle('rolling', !!V && !V.paused);
  q('#fxPlayBig', root).hidden = on;
}
function placeBeam() {
  const wall = q('#fxWall', root), frame = q('#fxFrame', root), lens = q('.pj-lens', root);
  if (!wall || theatre) return;
  const w = wall.getBoundingClientRect(), f = frame.getBoundingClientRect(), l = lens.getBoundingClientRect();
  const svg = q('#fxBeam', root); svg.setAttribute('viewBox', `0 0 ${w.width.toFixed(0)} ${w.height.toFixed(0)}`);
  const L = [l.right - w.left, l.top + l.height / 2 - w.top];
  const pts = [[L[0], L[1] - 5], [L[0] + 2, L[1] + 5], [f.left - w.left - 6, f.top - w.top - 6], [f.right - w.left + 6, f.top - w.top - 6], [f.right - w.left + 6, f.bottom - w.top + 6], [f.left - w.left - 6, f.bottom - w.top + 6]];
  q('#fxBeamPath', root).setAttribute('d', pathOf(hull(pts)));
  const g = q('#fxBeamGrad', root); g.setAttribute('x1', L[0]); g.setAttribute('y1', L[1]); g.setAttribute('x2', (f.left + f.width / 2 - w.left).toFixed(0)); g.setAttribute('y2', (f.top + f.height / 2 - w.top).toFixed(0));
}
function flipRect(el, first, dur = 560, ease = 'cubic-bezier(.2,.8,.2,1)') {
  const last = el.getBoundingClientRect();
  if (!last.width) return null;
  const s = first.width / last.width;
  return el.animate([{ transformOrigin: '0 0', transform: `translate(${first.left - last.left}px,${first.top - last.top}px) scale(${s})` }, { transformOrigin: '0 0', transform: 'none' }], { duration: dur, easing: ease });
}
function setTheatre(on) {
  if (on === theatre || !V) return;
  const frame = q('#fxFrame', root), first = frame.getBoundingClientRect();
  theatre = on;
  root.classList.toggle('theatre', on);
  document.documentElement.classList.toggle('fx-lock', on);
  const top = document.querySelector('.top');
  if (top) top.inert = on;
  const keep = q('#fxScreen', root);
  for (const el of [...root.children, ...q('#fx-projector', root).children, ...q('.pj', root).children, ...q('#fxWall', root).children]) if (!el.contains(keep)) el.inert = on;
  if (on) { userPaused = false; ensureSrc(); }
  syncVideo();
  if (!calm()) {
    flipRect(frame, first, on ? 640 : 520);
    q('.house', root).animate(on ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], { duration: on ? 700 : 450, easing: 'ease-out' });
  }
  if (on) { q('#fxLightsUp', root).focus({ preventScroll: true }); wakeBar(); }
  else { clearTimeout(idleTimer); root.classList.remove('th-idle'); q('#fxWatch', root).focus({ preventScroll: true }); requestAnimationFrame(placeBeam); }
}
function wakeBar() {
  root.classList.remove('th-idle'); clearTimeout(idleTimer);
  if (theatre && !V.paused) idleTimer = setTimeout(() => { if (theatre && !V.paused && !q('.th-bar', root).contains(document.activeElement)) root.classList.add('th-idle'); }, 2600);
}
function bigScreen() {
  ensureSrc(); userPaused = false; syncVideo();
  V.controls = true;
  const done = () => { V.controls = false; };
  if (V.requestFullscreen) V.requestFullscreen().catch(() => { if (V.webkitEnterFullscreen) V.webkitEnterFullscreen(); else done(); });
  else if (V.webkitEnterFullscreen) V.webkitEnterFullscreen();
  else done();
}
async function switchReel(id, fromCard) {
  if (id === S.film) { if (theatre) return; return; }
  const frame = q('#fxFrame', root);
  writeURL(true);
  if (calm() || !fromCard) { loadFilm(id); writeURL(true); syncVideo(); return; }
  // the poster lifts off its card and flies onto the screen while the lamp flares
  const img = fromCard.querySelector('img'), from = img.getBoundingClientRect(), to = frame.getBoundingClientRect();
  const fly = img.cloneNode(); fly.className = 'reel-fly'; fly.removeAttribute('loading');
  Object.assign(fly.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' });
  document.body.appendChild(fly);
  const sx = to.width / from.width;
  const a = fly.animate([{ transform: 'none', opacity: 1, borderRadius: '8px' }, { transform: `translate(${to.left - from.left}px,${to.top - from.top}px) scale(${sx})`, opacity: 1, borderRadius: '2px' }],
    { duration: 520, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' });
  q('.flash', frame).animate([{ opacity: 0 }, { opacity: .9, offset: .5 }, { opacity: 0 }], { duration: 760, easing: 'ease-out' });
  root.querySelector('.pj').classList.add('whip');
  sound('slap');
  await a.finished.catch(() => { });
  loadFilm(id); S.film = id; writeURL(true); syncVideo();
  fly.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, fill: 'forwards' }).finished.then(() => fly.remove()).catch(() => fly.remove());
  setTimeout(() => root.querySelector('.pj')?.classList.remove('whip'), 600);
}
function wireProjector() {
  V = q('#fxVideo', root); V.muted = true; V.defaultMuted = true;
  userPaused = calm();
  loadFilm(S.film);
  q('.reels', root).addEventListener('click', e => { const b = e.target.closest('[data-film]'); if (b) switchReel(b.dataset.film, b); });
  const toggle = () => { userPaused = !userPaused; syncVideo(); wakeBar(); };
  q('#fxPlay', root).addEventListener('click', toggle);
  q('#fxThPlay', root).addEventListener('click', toggle);
  q('#fxPlayBig', root).addEventListener('click', () => { userPaused = false; syncVideo(); });
  q('#fxWatch', root).addEventListener('click', () => setTheatre(true));
  q('#fxLightsUp', root).addEventListener('click', () => setTheatre(false));
  q('#fxFull', root).addEventListener('click', bigScreen);
  q('#fxThFull', root).addEventListener('click', bigScreen);
  q('#fxFrame', root).addEventListener('click', e => {
    if (e.target.closest('button')) return;
    if (theatre) { if (root.classList.contains('th-idle')) wakeBar(); else toggle(); }
    else setTheatre(true);
  });
  q('#fxScreen', root).addEventListener('pointermove', () => theatre && wakeBar());
  for (const ev of ['play', 'pause', 'playing']) V.addEventListener(ev, () => { labelPlay(); if (theatre) wakeBar(); });
  for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(ev, () => { if (!document.fullscreenElement && !document.webkitFullscreenElement) V.controls = false; });
  V.addEventListener('webkitendfullscreen', () => { V.controls = false; syncVideo(); });
  new IntersectionObserver(es => { for (const e of es) { inView = e.intersectionRatio >= .35; if (e.isIntersecting) ensureSrcSoon(); } syncVideo(); }, { threshold: [0, .35, .6] }).observe(q('#fxFrame', root));
  new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) ensureSrcSoon(); }, { rootMargin: '400px 0px' }).observe(q('#fx-projector', root));
  new ResizeObserver(() => requestAnimationFrame(placeBeam)).observe(q('#fxWall', root));
}
function ensureSrcSoon() { if (live && !calm()) ensureSrc(); }
function enterProjector() {   // the lamp strikes, flickers and warms up
  if (calm()) return;
  q('#fxFrame', root).animate([{ filter: 'brightness(0) sepia(1)' }, { filter: 'brightness(.5) sepia(.6)', offset: .18 }, { filter: 'brightness(.12) sepia(.6)', offset: .26 }, { filter: 'brightness(.9) sepia(.3)', offset: .45 }, { filter: 'brightness(.7) sepia(.2)', offset: .55 }, { filter: 'brightness(1) sepia(0)' }], { duration: 1200, easing: 'ease-out' });
  q('#fxBeam', root).animate([{ opacity: 0 }, { opacity: 0, offset: .15 }, { opacity: .5, offset: .3 }, { opacity: .1, offset: .4 }, { opacity: 1 }], { duration: 1200, easing: 'ease-out' });
}

/* ================================================================== stations, dock, scroll */
const seen = new Set();
function setStation(name, write = true) {
  if (!STATIONS.includes(name)) return;
  const changed = name !== S.station;
  S.station = name;
  const i = STATIONS.indexOf(name);
  root.style.setProperty('--st', i);
  qa('.fx-dock a', root).forEach(a => a.dataset.st === name ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
  if (write && changed) writeURL();
  if (!seen.has(name)) {
    seen.add(name);
    if (name === 'window' && !calm()) { const target = S.minute; S.minute = clamp(target - 80, S.lo, S.hi); renderWindow(); travelTo(target, 1800); }
    if (name === 'events' && !calm()) {
      q('#fxSheet', root).animate([{ transform: 'perspective(1100px) rotateX(-70deg)', opacity: 0 }, { transform: 'perspective(1100px) rotateX(8deg)', opacity: 1, offset: .6 }, { transform: 'perspective(1100px) rotateX(-3deg)', offset: .8 }, { transform: 'none' }], { duration: 900, easing: 'ease-out', fill: 'backwards', delay: 120 });
      q('#fxFlyerBtn', root).animate([{ transform: 'rotate(-12deg)', transformOrigin: '50% 8px' }, { transform: 'rotate(4deg)', transformOrigin: '50% 8px' }, { transform: 'rotate(-4deg)', transformOrigin: '50% 8px' }, { transform: 'rotate(-2.5deg)', transformOrigin: '50% 8px' }], { duration: 1100, delay: 400, easing: 'ease-out' });
    }
    if (name === 'fridge') enterFridge();
    if (name === 'projector') enterProjector();
  }
}
function stationInView() {
  const line = innerHeight * .42;
  let cur = STATIONS[0];
  for (const s of STATIONS) { const el = q('#fx-' + s, root); if (el && el.getBoundingClientRect().top <= line) cur = s; }
  // at the very bottom of the page, the last station is the one you're on
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = STATIONS[STATIONS.length - 1];
  return cur;
}
let scrollRAF = 0;
function onScroll() { if (!live || scrollRAF || theatre) return; scrollRAF = requestAnimationFrame(() => { scrollRAF = 0; setStation(stationInView()); }); }
function goTo(name, smoothly = true) {
  const el = q('#fx-' + name, root); if (!el) return;
  el.scrollIntoView({ behavior: smoothly && !calm() ? 'smooth' : 'auto', block: 'start' });
  q('h2', el).focus({ preventScroll: true });
  setStation(name);
}
function wireDock() {
  q('.fx-dock', root).addEventListener('click', e => {
    const a = e.target.closest('a[data-st]'); if (!a) return;
    e.preventDefault(); goTo(a.dataset.st);
  });
}

/* ================================================================== mount / on / off */
function build() {
  root.innerHTML = template();
  wireWindow(); wireEvents(); wireFridge(); wireProjector(); wireDock();
  built = true;
}
function onKey(e) {
  if (!live) return;
  if (e.key === 'Escape' && theatre) { e.preventDefault(); setTheatre(false); }
}
function on(hash) {
  root = document.getElementById('flat'); if (!root) return;
  const prev = readURL();
  live = true;
  if (!built) build();
  else {
    if (prev.tone !== S.tone) { q('#fxTone', root).value = S.tone; S.idea = rollStory(); placeIdea(S.idea); }
    if (prev.film !== S.film) loadFilm(S.film);
  }
  R.date.value = S.date;
  drawArc(); renderWindow();
  calY = +S.date.slice(0, 4); calM = +S.date.slice(5, 7) - 1; drawCalendar();
  const want = ALIAS[hash] || hash;
  const name = STATIONS.includes(want) ? want : 'window';
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', syncVideo);
  // open where the 3D room was standing
  requestAnimationFrame(() => {
    if (!live) return;
    if (name === 'window') window.scrollTo(0, 0);
    else q('#fx-' + name, root).scrollIntoView({ block: 'start' });
    seen.clear(); S.station = '';
    setStation(name, false);
    writeURL(true);
    const ae = document.activeElement;
    if (!ae || ae === document.body || ae.id === 'plainToggle' || ae.closest?.('[data-plain]')) q(`#fx-${name} h2`, root).focus({ preventScroll: true });
    placeBeam(); syncVideo();
  });
}
function off() {
  if (!built) { live = false; return; }
  if (theatre) setTheatre(false);
  writeURL(true);
  live = false;
  cancelAnimationFrame(travel); cancelAnimationFrame(debrisRAF); cancelAnimationFrame(scrollRAF); scrollRAF = 0; clearTimeout(urlTimer);
  qa('#fxDebris > *', root).forEach(n => n.remove());
  const dlg = q('#fxFlyerDlg', root); if (dlg.open) { dlg.close(); q('#fxFlyerBtn', root).classList.remove('lifted'); }
  shaking = false; lifting = false; flipping = false;
  V?.pause();
  removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); removeEventListener('keydown', onKey);
  document.removeEventListener('visibilitychange', syncVideo);
}
document.addEventListener('lab:flat', e => { e.detail?.on ? on(e.detail.hash || location.hash.slice(1)) : off(); });
quiet.addEventListener?.('change', () => { if (live) { userPaused = calm() ? true : userPaused; syncVideo(); } });
