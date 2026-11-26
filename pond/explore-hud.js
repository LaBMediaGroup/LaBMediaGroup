/* Explore HUD v4 (Nov 26 2026): a game UI in LaB × toy-sticker style (see PINO-UI-NOTES.md).
   Needs strip · "right now" card · clock and sound · radar map · status line · two bottom sheets:
   "Leave him something" (Say hi, Note, Doodle, Swap, Yours) and "His things" (Art, Songs, Journal, Map).
   explore.js feeds it: set(hud, journalLine), mapDots(me, coonPos), clock(text, night), heard(song), …
   No accounts, no public wall: visitors' notes go only to him; "Yours" lives in this browser. */
const $ = s => document.querySelector(s);
const NEEDS = [['hunger', 'Hunger'], ['energy', 'Energy'], ['joy', 'Joy'], ['boredom', 'Boredom'], ['curiosity', 'Curiosity']];
const MOVE_WORDS = {walk_to: 'go to', swim_to: 'swim to', sit_and_watch: 'watch', hold_up_to_moon: 'hold it up to the moon', pick_up: 'pick something up',
  take_from_stash: 'dig in the stash', stash: 'stash it', wash: 'wash it', watch_fish: 'watch the fish', swat_at_fish: 'swat at a fish',
  check_mail: 'check the mail', pry_lid: 'pry the lid', dig_in: 'dig in', draw: 'draw', hand_paint: 'paw paint', draw_in_mud: 'draw in the mud',
  play_ocarina: 'play the ocarina', nap: 'nap', explore: 'explore', sniff: 'sniff around', write_on_board: 'write on the board', eat: 'eat it',
  eat_here: 'eat it here', note_for_bobby: 'make a note for Bobby', ask_bobby: 'ask Bobby something', wish: 'make a wish',
  build_sculpture: 'build a sculpture', drop: 'put it down', climb: 'climb'};
const I = {
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
  walk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="13" cy="4.5" r="2"/><path d="M11 21l2-6 3 3v3M13 15l-1-6-3 3H6M12 9l4 2 2-1"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z" fill="currentColor"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor"/></svg>',
  face: '<svg viewBox="0 0 40 40"><path d="M9 14 7 5l9 5M31 14l2-9-9 5" fill="#8d8f8c" stroke="#22302f" stroke-width="2" stroke-linejoin="round"/><ellipse cx="20" cy="22" rx="14" ry="12" fill="#b9bbb7" stroke="#22302f" stroke-width="2"/><path d="M7 20c4-3 9-3 13 0 4-3 9-3 13 0-2 5-8 6-13 2-5 4-11 3-13-2z" fill="#22302f"/><circle cx="14" cy="20" r="2.2" fill="#fffaf1"/><circle cx="26" cy="20" r="2.2" fill="#fffaf1"/><ellipse cx="20" cy="28" rx="7" ry="5" fill="#f5ecdc"/><circle cx="20" cy="26.5" r="2" fill="#22302f"/></svg>',
};
// his journal is in the second person ("You dip your paws…"); the status line says it about him ("dips his paws")
const verb = v => /(s|sh|ch|x|z)$/.test(v) ? v + 'es' : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + 'ies' : v === 'have' ? 'has' : v + 's';
function third(text) {
  let s = text.replace(/\.$/, '');
  if (!/^You\b/.test(s)) return s.charAt(0).toLowerCase() + s.slice(1);
  s = s.replace(/^You (\w+)/, (_, v) => verb(v)).replace(/(,? and )(\w+)/, (m, a, v) => /^(the|a|an|his|your|it)$/.test(v) ? m : a + verb(v));
  return s.replace(/\byourself\b/g, 'himself').replace(/\byour\b/g, 'his').replace(/\byou\b/g, 'him');
}
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);

/* ---------------- his instruments: a tiny synth ---------------- */
const NOTE_HZ = {C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66};
let actx = null;
function audio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch {} return actx; }
export function playTune(song, volume = .35) {
  const ac = audio(); if (!ac) return 0;
  const beat = .34, inst = song.instrument || 'ocarina'; let t = ac.currentTime + .05;
  const out = ac.createGain(); out.gain.value = volume; out.connect(ac.destination);
  for (const [n, beats] of song.notes || []) {
    const d = beat * beats;
    if (n !== 'rest' && NOTE_HZ[n]) {
      const f = NOTE_HZ[n] * (inst === 'harmonica' ? .5 : 1), o = ac.createOscillator(), g = ac.createGain();
      o.type = inst === 'harmonica' ? 'sawtooth' : inst === 'tin_whistle' ? 'triangle' : 'sine';
      o.frequency.value = f;
      if (inst === 'ocarina' || inst === 'tin_whistle') {        // breathy vibrato
        const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 5.2; lg.gain.value = f * .006;
        lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t + d + .1);
      }
      const plucked = inst === 'thumb_piano' || inst === 'toy_xylophone';
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(plucked ? .9 : .55, t + (plucked ? .005 : .05));
      if (plucked) g.gain.exponentialRampToValueAtTime(.001, t + Math.max(.25, d * 1.3));
      else { g.gain.setValueAtTime(.5, t + d * .8); g.gain.linearRampToValueAtTime(0, t + d); }
      let node = o;
      if (inst === 'harmonica') { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; o.connect(lp); node = lp; }
      node.connect(g).connect(out); o.start(t); o.stop(t + d + .4);
    }
    t += d;
  }
  return t - ac.currentTime;
}

export function createHud({places, onTakeMe, onFollow, onSayHi, ground, pond, live = false, api = null}) {
  const hud = $('#hud2');
  hud.innerHTML = `
    <div class="needs st-card pe" role="group" aria-label="How Labcoon feels"><span class="who">Labcoon</span>
      ${NEEDS.map(([k, l]) => `<div class="need" style="--c:var(--${k})" data-k="${k}"><span><i></i>${l}</span><em><b></b></em></div>`).join('')}
    </div>
    <section class="nowcard st-card pe" id="lcCard" aria-live="polite">
      <div class="kicker">right now · <span id="lcMood"></span></div>
      <button class="st-round x" id="nowClose" type="button" aria-label="Hide">${I.x}</button>
      <h3 id="lcTitle">Finding him…</h3>
      <p class="where" id="lcPlace"></p>
      <p class="thought" id="lcThought"></p>
      <hr class="dash"><ol class="plan" id="lcPlan"></ol>
      <hr class="dash"><div class="foot"><span id="lcProject"></span><button type="button" id="journalLink">his journal</button></div>
    </section>
    <button class="st-pill now-chip" id="lcChip" type="button" aria-expanded="false" hidden>Right now · <span id="lcChipMood">…</span></button>
    <div class="tr">
      <span class="st-pill clock pe" id="clock">${I.sun}<span>—</span></span>
      <button class="st-round" id="soundBtn" type="button" aria-label="Sound on" aria-pressed="true">${I.sound}</button>
      <button class="st-round" id="thingsBtn" type="button" aria-label="His things">${I.menu}</button>
    </div>
    <div class="bl"><button class="st-round radar" id="mapBtn" type="button" aria-label="Open the map"><svg viewBox="-29 -36 56 50" id="radarSvg"></svg></button></div>
    <div class="status st-pill pe" role="status"><span class="face">${I.face}</span><span><b>Labcoon</b> <span id="labcoonDoing">is waking up…</span></span></div>
    <div class="br">
      <button class="st-round" id="followBtn" type="button" aria-label="Follow Labcoon">${I.eye}</button>
      <button class="st-pill primary" id="leaveBtn" type="button">Leave him something</button>
    </div>
    <div class="bubble" id="lcBubble" hidden></div>
    <div class="scrim pe" id="scrim" hidden></div>
    <section class="sheet st-card pe" id="lcSheet" hidden role="dialog" aria-label="Leave Labcoon something">
      <div class="grab"></div>
      <header><span class="title">Leave Labcoon something</span><button class="st-round x" type="button" data-close aria-label="Close">${I.x}</button></header>
      <div class="tabs" role="tablist">${[['hi', 'Say hi'], ['note', 'Note'], ['doodle', 'Doodle'], ['swap', 'Swap'], ['yours', 'Yours']].map(([k, l], i) => `<button role="tab" data-tab="${k}" aria-selected="${!i}">${l}</button>`).join('')}</div>
      <div class="pane" data-pane="hi"><p id="sheetText"></p>
        <form id="hiForm" class="row"><input class="field" id="hiInput" maxlength="120" placeholder="Say hi to Labcoon" autocomplete="off"><button class="st-pill primary" type="submit">Say hi</button></form>
        <div class="note-hint" id="hiLeft"></div></div>
      <div class="pane" data-pane="note" hidden><p>Leave a note in his mailbox. He reads his mail when he feels like it and might mention it in his own words. Nobody else sees it.</p>
        <textarea class="field" id="noteText" maxlength="240" rows="3" placeholder="Dear Labcoon…"></textarea>
        <div class="row" style="margin-top:10px;justify-content:space-between"><span class="note-hint" id="noteLeft">One note a day · 240 letters</span><button class="st-pill primary" id="noteSend" type="button">Mail it</button></div></div>
      <div class="pane" data-pane="doodle" hidden><div class="doodle"><canvas id="doodlePad" width="96" height="96"></canvas><div>
        <div class="swatches" id="swatches"></div>
        <div class="row"><button class="st-pill" id="doodleClear" type="button">Clear</button><button class="st-pill primary" id="doodleSend" type="button">Mail it</button></div>
        <div class="note-hint" id="doodleHint">One doodle a day. Draw, don't write: he can't read.</div></div></div></div>
      <div class="pane" data-pane="swap" hidden><div class="tile st-card"><span class="chip">coming soon</span><p style="margin-top:10px">Trade trinkets at the picnic table. Offer him one of four little finds; he washes it, holds it up to the moon, and keeps it or hands it back with a sniff. If he keeps it, he gives you one from his stash.</p></div></div>
      <div class="pane" data-pane="yours" hidden><ul class="journal" id="yoursList"></ul></div>
    </section>
    <section class="sheet st-card pe" id="thingsSheet" hidden role="dialog" aria-label="His things">
      <div class="grab"></div>
      <header><span class="title">His things</span><button class="st-round x" type="button" data-close aria-label="Close">${I.x}</button></header>
      <div class="tabs" role="tablist">${[['art', 'Art'], ['songs', 'Songs'], ['journal', 'Journal'], ['map', 'Map']].map(([k, l], i) => `<button role="tab" data-tab="${k}" aria-selected="${!i}">${l}</button>`).join('')}</div>
      <div class="pane" data-pane="art"><div class="grid" id="artGrid"></div><div class="big" id="artBig" hidden></div></div>
      <div class="pane" data-pane="songs" hidden><div id="songList"></div></div>
      <div class="pane" data-pane="journal" hidden><ul class="journal" id="journalList"></ul></div>
      <div class="pane mapbox" data-pane="map" hidden><svg id="mapSvg" viewBox="-29 -36 56 50" role="img" aria-label="Map of the field"></svg><div class="take" id="mapList"></div></div>
    </section>`;

  /* ---------- right now card / chip ---------- */
  const card = $('#lcCard'), chip = $('#lcChip'), small = matchMedia('(max-width: 760px)');
  const setOpen = open => { card.hidden = !open; chip.hidden = open; chip.setAttribute('aria-expanded', open); };
  setOpen(!small.matches);
  chip.addEventListener('click', () => setOpen(true));
  $('#nowClose').addEventListener('click', () => setOpen(false));

  /* ---------- sheets ---------- */
  const scrim = $('#scrim'), onTab = {};
  let openSheet = null;
  function show(el, tab) {
    if (openSheet && openSheet !== el) hideSheet(openSheet, true);
    el.hidden = false; scrim.hidden = false; openSheet = el;
    requestAnimationFrame(() => { el.classList.add('on'); scrim.classList.add('on'); });
    if (tab) selectTab(el, tab);
  }
  function hideSheet(el = openSheet, quick = false) {
    if (!el) return; el.classList.remove('on'); scrim.classList.remove('on');
    const done = () => { el.hidden = true; if (openSheet === el) { scrim.hidden = true; openSheet = null; } };
    quick ? done() : setTimeout(done, 300);
  }
  function selectTab(el, k) {
    for (const b of el.querySelectorAll('[role=tab]')) b.setAttribute('aria-selected', b.dataset.tab === k);
    for (const p of el.querySelectorAll('[data-pane]')) p.hidden = p.dataset.pane !== k;
    onTab[k]?.();
  }
  for (const el of [$('#lcSheet'), $('#thingsSheet')]) {
    el.querySelector('[data-close]').addEventListener('click', () => hideSheet(el));
    for (const b of el.querySelectorAll('[role=tab]')) b.addEventListener('click', () => selectTab(el, b.dataset.tab));
  }
  scrim.addEventListener('click', () => hideSheet());
  $('#leaveBtn').addEventListener('click', () => show($('#lcSheet'), 'hi'));
  $('#thingsBtn').addEventListener('click', () => show($('#thingsSheet'), 'art'));
  $('#mapBtn').addEventListener('click', () => show($('#thingsSheet'), 'map'));
  $('#journalLink').addEventListener('click', () => show($('#thingsSheet'), 'journal'));
  $('#followBtn').addEventListener('click', () => onFollow());

  /* ---------- sound ---------- */
  let soundOn = (() => { try { return localStorage.getItem('labcoon-sound') !== 'off'; } catch { return true; } })();
  const soundBtn = $('#soundBtn');
  const paintSound = () => { soundBtn.innerHTML = soundOn ? I.sound : I.mute; soundBtn.setAttribute('aria-pressed', soundOn); soundBtn.setAttribute('aria-label', soundOn ? 'Sound on' : 'Sound off'); };
  paintSound();
  soundBtn.addEventListener('click', () => { soundOn = !soundOn; try { localStorage.setItem('labcoon-sound', soundOn ? 'on' : 'off'); } catch {} if (soundOn) audio(); paintSound(); });
  addEventListener('pointerup', () => { if (soundOn) audio(); }, {once: true});   // phones unlock audio on a release, not a press

  /* ---------- "Yours": what you sent him and what he said, kept in this browser ---------- */
  const yoursKey = 'labcoon-yours';
  const yours = () => { try { return JSON.parse(localStorage.getItem(yoursKey) || '[]'); } catch { return []; } };
  function remember(item) { try { localStorage.setItem(yoursKey, JSON.stringify([{...item, at: Date.now()}, ...yours()].slice(0, 40))); } catch {} }
  onTab.yours = () => {
    const y = yours();
    $('#yoursList').innerHTML = y.length ? y.map(i => `<li><time>${new Date(i.at).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}</time><span>${i.kind === 'hi' ? `You: “${esc(i.text)}”${i.reply ? `<br><i>Labcoon: ${esc(i.reply)}</i>` : ''}` : i.kind === 'doodle' ? 'You mailed him a doodle.' : `You mailed him: “${esc(i.text)}”`}</span></li>`).join('') : '<li class="empty">Nothing yet. Say hi, or mail him a note.</li>';
  };

  /* ---------- say hi (5 a day) ---------- */
  const dayKey = 'labcoon-hi-' + new Date().toDateString();
  const used = () => { try { return +localStorage.getItem(dayKey) || 0; } catch { return 0; } };
  const updateLeft = () => { const n = 5 - used(); $('#hiLeft').textContent = n > 0 ? `${n} hellos left today${live ? '' : ' · offline preview: he answers for real when he’s live'}` : 'That’s your five for today. He’ll be here tomorrow.'; $('#hiInput').disabled = n <= 0; };
  onTab.hi = updateLeft;
  $('#hiForm').addEventListener('submit', async e => {
    e.preventDefault(); const v = $('#hiInput').value.trim(); if (!v || used() >= 5) return;
    try { localStorage.setItem(dayKey, used() + 1); } catch {}
    $('#hiInput').value = ''; updateLeft(); hideSheet();
    const reply = await onSayHi(v); remember({kind: 'hi', text: v, reply: reply || null});
  });

  /* ---------- mail: a note or a doodle ---------- */
  async function mail(body, hint, after) {
    if (!api) { hint.textContent = 'His mailbox opens when he’s live.'; return; }
    try { await api('/mail', body); hint.textContent = 'In the mailbox. The flag’s up.'; after(); } catch (e) { hint.textContent = e.message; }
  }
  $('#noteSend').addEventListener('click', () => {
    const t = $('#noteText').value.trim(); if (!t) return;
    mail({text: t}, $('#noteLeft'), () => { remember({kind: 'note', text: t}); $('#noteText').value = ''; });
  });
  const pad = $('#doodlePad'), pc = pad.getContext('2d'), COLORS = ['#22302f', '#f2a33a', '#5aa7d8', '#8cc58d', '#ef7fa8', '#fffaf1'];
  let ink = COLORS[0], drawing = false, last = null, inked = false;
  const sw = $('#swatches');
  COLORS.forEach((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', i === 5 ? 'eraser' : 'colour'); b.setAttribute('aria-pressed', !i);
    b.addEventListener('click', () => { ink = c; for (const x of sw.children) x.setAttribute('aria-pressed', x === b); }); sw.appendChild(b); });
  const clearPad = () => { pc.fillStyle = '#fffaf1'; pc.fillRect(0, 0, 96, 96); inked = false; };
  clearPad();
  const at = e => { const r = pad.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 96, (e.clientY - r.top) / r.height * 96]; };
  pad.addEventListener('pointerdown', e => { drawing = true; last = at(e); pad.setPointerCapture(e.pointerId); });
  pad.addEventListener('pointermove', e => { if (!drawing) return; const p = at(e); pc.strokeStyle = ink; pc.lineWidth = ink === '#fffaf1' ? 7 : 3; pc.lineCap = 'round';
    pc.beginPath(); pc.moveTo(...last); pc.lineTo(...p); pc.stroke(); last = p; inked = true; });
  pad.addEventListener('pointerup', () => { drawing = false; });
  $('#doodleClear').addEventListener('click', clearPad);
  $('#doodleSend').addEventListener('click', () => { if (!inked) return; mail({doodle: pad.toDataURL('image/png')}, $('#doodleHint'), () => { remember({kind: 'doodle'}); clearPad(); }); });

  /* ---------- his things: art, songs, journal ---------- */
  async function load(kind) {
    if (api) { try { const r = await api('/art?kind=' + kind); if (r.items?.length) return r.items; } catch {} }
    try { const s = await (await fetch('/pond/labcoon/art-sample.json')).json(); return s[kind] || []; } catch { return []; }
  }
  onTab.art = async () => {
    const grid = $('#artGrid'), big = $('#artBig'); big.hidden = true; grid.hidden = false;
    grid.innerHTML = '<div class="empty">Looking in the art shed…</div>';
    const items = await load('drawing');
    grid.innerHTML = items.length ? '' : '<div class="empty">Nothing pinned up yet. He draws when the itch hits.</div>';
    for (const a of items) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'art st-card';
      b.innerHTML = `<div class="frame">${a.svg}</div><b>${esc(a.title)}</b><small>${esc(a.medium === 'mud' ? 'stick in mud' : a.medium === 'paw_paint' ? 'paw paint' : 'crayon')}</small>`;
      b.addEventListener('click', () => { grid.hidden = true; big.hidden = false;
        big.innerHTML = `<div class="frame">${a.svg}</div><div class="row" style="justify-content:space-between"><b>${esc(a.title)}</b><button class="st-pill" type="button" id="artBack">Back to the wall</button></div>`;
        $('#artBack').addEventListener('click', () => { big.hidden = true; grid.hidden = false; }); });
      grid.appendChild(b);
    }
  };
  onTab.songs = async () => {
    const list = $('#songList'); list.innerHTML = '<div class="empty">Finding his tunes…</div>';
    const items = await load('song');
    list.innerHTML = items.length ? '' : '<div class="empty">No tunes yet. He plays his ocarina when he feels like it.</div>';
    for (const s of items) {
      const row = document.createElement('div'); row.className = 'song st-card';
      row.innerHTML = `<button class="st-round" type="button" aria-label="Play ${esc(s.title)}">${I.play}</button><div><b>${esc(s.title)}</b><small>${esc((s.instrument || 'ocarina').replace('_', ' '))} · ${s.notes.length} notes</small></div><div class="notes">${s.notes.slice(0, 18).map(([n, b]) => `<i style="height:${n === 'rest' ? 2 : 6 + 'CDEGA'.indexOf(n[0]) * 3 + (n[1] === '6' ? 8 : 0)}px;opacity:${.3 + Math.min(b, 2) * .3}"></i>`).join('')}</div>`;
      row.querySelector('button').addEventListener('click', () => playTune(s, .5));
      list.appendChild(row);
    }
  };
  const journal = [];
  onTab.journal = () => { $('#journalList').innerHTML = journal.length ? journal.map(j => `<li><time>${esc(j.time)}</time><span>${esc(j.text)}</span></li>`).join('') : '<li class="empty">His journal fills in as he goes about his night.</li>'; };

  /* ---------- map (sheet tab) and radar (corner) ---------- */
  const ns = 'http://www.w3.org/2000/svg';
  function drawMap(svg, labels) {
    const el = (tag, attrs, parent = svg) => { const n = document.createElementNS(ns, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); parent.appendChild(n); return n; };
    el('rect', {x: -42, y: -53.5, width: 84, height: 84, class: 'm-field'});
    el('ellipse', {cx: 0, cy: -8, rx: 27, ry: 25, class: 'm-clear'});
    el('path', {d: 'M-18.2 -53.5 V30.5 M-16.6 -53.5 V30.5', class: 'm-lane'});
    const pts = [];
    for (let k = 0; k < 96; k++) { const a = k / 96 * Math.PI * 2; let d = 2; while (d < 30 && ground(Math.cos(a) * d + pond.center.x, Math.sin(a) * d + pond.center.y) <= 0) d += .1; pts.push((Math.cos(a) * d + pond.center.x).toFixed(1) + ',' + (Math.sin(a) * d + pond.center.y).toFixed(1)); }
    el('polygon', {points: pts.join(' '), class: 'm-pond'});
    el('rect', {x: -14.6, y: -5.6, width: 3, height: 2.4, class: 'm-shed', transform: 'rotate(8.6 -13.1 -4.4)'});
    if (labels) {
      const SHORT = {culvert: 'culvert · home', washing_rock: 'washing rock', trash_can: 'trash can', drone_course: 'drone course', picnic_table: 'picnic table', bird_feeder: 'bird feeder', art_shed: 'art shed', cattails: 'cattails', oak: 'oak', mailbox: 'mailbox'};
      const NUDGE = {picnic_table: [1.2, -.6], drone_course: [1.2, 1.6], bird_feeder: [1.2, -.4], art_shed: [-6.8, 1.8], trash_can: [1.2, .6], mailbox: [1.2, .6]};
      for (const k of Object.keys(SHORT)) {
        const p = places[k]; if (!p) continue;
        const g = el('g', {class: 'm-place', 'data-k': k, transform: `translate(${p.at[0]} ${p.at[1]})`});
        el('circle', {r: k === 'culvert' ? .9 : .6}, g);
        const [nx, ny] = NUDGE[k] || [1.2, .5]; el('text', {x: nx, y: ny}, g).textContent = SHORT[k];
        g.addEventListener('click', () => { hideSheet(); onTakeMe(k); });
      }
    }
    const you = el('g', {class: 'm-you'}); el('circle', {r: labels ? .8 : 1.6}, you); el('path', {d: labels ? 'M0 -2 L.8 -.7 L-.8 -.7 Z' : 'M0 -3.6 L1.5 -1.3 L-1.5 -1.3 Z'}, you);
    const coon = el('g', {class: 'm-coon'}); el('circle', {r: labels ? .9 : 1.9}, coon);
    return {you, coon};
  }
  const bigMap = drawMap($('#mapSvg'), true), radar = drawMap($('#radarSvg'), false);
  for (const [k, text] of [['labcoon', 'Labcoon'], ['culvert', 'His culvert'], ['washing_rock', 'Washing rock'], ['art_shed', 'Art shed'], ['mailbox', 'Mailbox'], ['the_shed', 'The LaB shed'], ['drone_course', 'Drone course'], ['oak', 'The oak']]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'st-pill'; b.textContent = text;
    b.addEventListener('click', () => { hideSheet(); onTakeMe(k); }); $('#mapList').appendChild(b);
  }

  let state = {};
  return {
    set(h, line) {
      if (line) {
        const [time, ...rest] = line.split(' · '), text = rest.join(' · ') || line;
        $('#labcoonDoing').textContent = third(text);
        $('#lcTitle').textContent = text;
        if (!journal.length || journal[0].text !== text) { journal.unshift({time: rest.length ? time : '', text}); journal.length = Math.min(journal.length, 50); }
        if (!document.querySelector('#thingsSheet [data-pane=journal]').hidden) onTab.journal();
      }
      if (!h) return; state = h;
      const mood = h.asleep ? 'asleep · zz' : h.mood || 'content';
      $('#lcMood').textContent = mood; $('#lcChipMood').textContent = mood;
      $('#lcPlace').textContent = 'At ' + (places[h.place]?.label || h.place?.replace(/_/g, ' ') || 'the pond') + (h.holding ? ` · holding a ${h.holding}` : '');
      $('#lcThought').textContent = h.asleep ? 'Dreaming. Tap him to wake him (it takes a few pokes).' : h.thought ? '“' + h.thought + '”' : 'Just pottering.';
      const plan = $('#lcPlan'); plan.innerHTML = '';
      (h.asleep ? [] : h.plan || []).slice(0, 5).forEach((m, i) => {
        const li = document.createElement('li'), [mv, ...rest] = m.split(' '), arg = rest.join(' ');
        li.textContent = (MOVE_WORDS[mv] || mv.replace(/_/g, ' ')) + (arg ? ' ' + (places[arg]?.label || arg.replace(/_/g, ' ')) : '');
        li.className = i < h.step ? 'done' : i === h.step ? 'now' : ''; plan.appendChild(li);
      });
      plan.hidden = !plan.children.length; plan.previousElementSibling.hidden = plan.hidden;
      for (const [k] of NEEDS) { const b = hud.querySelector(`.need[data-k="${k}"] b`); if (b) b.style.width = Math.round((h.needs?.[k] ?? 0) * 100) + '%'; }
      $('#lcProject').textContent = h.project ? 'Lately: ' + h.project : 'Lately: pottering';
    },
    mapDots(me, coonPos) {
      for (const m of [radar, bigMap]) {
        m.you.setAttribute('transform', `translate(${me.pos.x.toFixed(1)} ${me.pos.z.toFixed(1)}) rotate(${(-me.yaw * 180 / Math.PI).toFixed(0)})`);
        m.coon.setAttribute('transform', `translate(${coonPos.x.toFixed(1)} ${coonPos.z.toFixed(1)})`);
      }
    },
    clock(text, night) { const c = $('#clock'); c.innerHTML = (night ? I.moon : I.sun) + `<span>${esc(text)}</span>`; c.classList.toggle('night', !!night); },
    following(on) { const b = $('#followBtn'); b.innerHTML = on ? I.walk : I.eye; b.setAttribute('aria-label', on ? 'Walk' : 'Follow Labcoon'); },
    sheet(text, canTalk) {
      if (text == null) { if (openSheet === $('#lcSheet')) hideSheet(); return; }
      show($('#lcSheet'), 'hi'); $('#sheetText').textContent = text; $('#hiForm').hidden = !canTalk; $('#hiLeft').hidden = !canTalk; if (canTalk) updateLeft();
    },
    bubble(text, x, y) {
      const b = $('#lcBubble');
      if (text === null) { b.hidden = true; return; }
      if (text !== undefined) { b.textContent = text; b.hidden = false; }
      if (x != null) b.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%)`;
    },
    heard(song, near) { if (soundOn && near && actx) playTune(song, .28); },
    remember,
    get state() { return state; },
  };
}
