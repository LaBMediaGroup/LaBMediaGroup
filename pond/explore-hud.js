import {swapTable} from './swap-table.js';
import {fieldNotebook} from './field-notebook.js?v=5';
import {brainView} from './brain-view.js?v=1';
import {openGallery} from './gallery.js?v=1';
/* Explore HUD v4 (Nov 26 2026): a game UI in LaB × toy-sticker style (see PINO-UI-NOTES.md).
   Needs strip · "right now" card · clock and sound · radar map · status line · two bottom sheets:
   "Leave him something" (Say hi, Note, Doodle, Swap, Yours) and "His things" (Art, Songs, Journal, Map).
   explore.js feeds it: set(hud, journalLine), mapDots(me, coonPos), clock(text, night), heard(song), …
   No accounts, no public wall: visitors' notes go only to him; "Yours" lives in this browser. */
import {openGame} from './games/games-ui.js?v=6';
import {sound, sfx, playTune, ensure} from './explore-audio.js?v=4';
export {playTune};
const $ = s => document.querySelector(s);
const NEEDS = [['hunger', 'Full'], ['energy', 'Energy'], ['joy', 'Joy'], ['boredom', 'Boredom'], ['curiosity', 'Curiosity']];
const MOVE_WORDS = {walk_to: 'go to', swim_to: 'swim to', sit_and_watch: 'watch', hold_up_to_moon: 'hold it up to the moon', pick_up: 'pick something up',
  take_from_stash: 'dig in the stash', stash: 'stash it', wash: 'wash it', watch_fish: 'watch the fish', swat_at_fish: 'swat at a fish',
  check_mail: 'check the mail', pry_lid: 'pry the lid', dig_in: 'dig in', draw: 'draw', hand_paint: 'paw paint', draw_in_mud: 'draw in the mud',
  play_ocarina: 'play the ocarina', nap: 'nap', explore: 'explore', sniff: 'sniff around', write_on_board: 'write on the board', eat: 'eat it',
  eat_here: 'eat it here', note_for_bobby: 'make a note for Bobby', ask_bobby: 'ask Bobby something', wish: 'make a wish',
  build_sculpture: 'build a sculpture', drop: 'put it down', climb: 'climb'};
const I = {
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
  paw: '<svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="15.5" rx="5" ry="4.2"/><circle cx="6" cy="10" r="2.1"/><circle cx="9.6" cy="6.6" r="2.1"/><circle cx="14.4" cy="6.6" r="2.1"/><circle cx="18" cy="10" r="2.1"/></svg>',
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

/* sound lives in explore-audio.js (one engine for the field, the HUD, his tunes and the games) */
const blip = k => sfx(k);
export function createHud({places, onTakeMe, onWalkTo, onFollow, onSayHi, onPet, brainWorld = () => ({}), ground, pond, live = false, api = null, onGame = null}) {
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
      <hr class="dash"><div class="foot"><span id="lcProject"></span><button type="button" id="brainLink">his brain</button><button type="button" id="journalLink">his journal</button></div>
    </section>
    <button class="st-pill now-chip" id="lcChip" type="button" aria-expanded="false" hidden>Right now · <span id="lcChipMood">…</span></button>
    <div class="tr">
      <span class="st-pill clock pe" id="clock">${I.sun}<span>—</span></span>
      <button class="st-round" id="soundBtn" type="button" aria-label="Sound on" aria-pressed="true">${I.sound}</button>
      <button class="st-round" id="thingsBtn" type="button" aria-label="His things">${I.menu}</button>
    </div>
    <div class="bl"><button class="st-round radar" id="mapBtn" type="button" aria-label="Open the map"><svg viewBox="-29 -36 56 50" id="radarSvg"></svg></button></div>
    <div class="status st-pill pe" role="status" id="statusPill" title="What he’s up to"><span class="face">${I.face}</span><span><b>Labcoon</b> <span id="labcoonDoing">is waking up…</span></span></div>
    <div class="br">
      <button class="st-round" id="walkToBtn" type="button" aria-label="Walk over to Labcoon">${I.paw}</button>
      <button class="st-round" id="followBtn" type="button" aria-label="Follow Labcoon">${I.eye}</button>
      <button class="st-pill primary" id="leaveBtn" type="button">Leave him something</button>
    </div>
    <div class="bubble" id="lcBubble" hidden></div>
    <button class="st-round finder" id="finder" type="button" aria-label="Find Labcoon" hidden><span class="face">${I.face}</span><i class="arrow"></i></button>
    <div class="coach st-card pe" id="coach" hidden><div class="kicker">welcome to the pond</div>
      <ul>${matchMedia('(pointer: coarse)').matches ? '<li><b>Thumb on the lower left</b> to walk, push further to run</li><li><b>Drag</b> anywhere else to look</li>' : '<li><b>WASD</b> or <b>tap the ground</b> to walk, <b>drag</b> to look</li>'}<li><b>Tap the ground</b> to walk there, the <b>paw</b> walks you to him</li><li><b>Tap Labcoon</b> to say hi or play</li><li>The <b>orange button</b> leaves him something; <b>☰</b> has his art, songs and games</li></ul>
      <button class="st-pill primary" type="button" id="coachOk">Got it</button></div>
    <div class="scrim pe" id="scrim" hidden></div>
    <section class="sheet st-card pe" id="lcSheet" hidden role="dialog" aria-label="Leave Labcoon something">
      <div class="grab"></div>
      <header><span class="title">Leave Labcoon something</span><button class="st-round x" type="button" data-close aria-label="Close">${I.x}</button></header>
      <div class="tabs" role="tablist">${[['hi', 'Say hi'], ['note', 'Note'], ['doodle', 'Doodle'], ['swap', 'Swap'], ['yours', 'Yours']].map(([k, l], i) => `<button role="tab" data-tab="${k}" aria-selected="${!i}">${l}</button>`).join('')}</div>
      <div class="pane" data-pane="hi"><p id="sheetText"></p>
        <form id="hiForm" class="row"><input class="field" id="hiInput" maxlength="120" placeholder="Say hi to Labcoon" autocomplete="off"><button class="st-pill primary" type="submit">Say hi</button></form>
        <div class="note-hint" id="hiLeft"></div>
        <div class="row" id="playRow" style="margin-top:12px;flex-wrap:wrap"><button class="st-pill primary" type="button" id="petHim">Pet him</button><button class="st-pill" type="button" id="playCheckers">Play checkers with him</button></div></div>
      <div class="pane" data-pane="note" hidden><p>Leave a note in his mailbox. He reads his mail when he feels like it and might mention it in his own words. Nobody else sees it.</p>
        <textarea class="field" id="noteText" maxlength="240" rows="3" placeholder="Dear Labcoon…"></textarea>
        <div class="row" style="margin-top:10px;justify-content:space-between"><span class="note-hint" id="noteLeft">One note a day · 240 letters</span><button class="st-pill primary" id="noteSend" type="button">Mail it</button></div></div>
      <div class="pane" data-pane="doodle" hidden><div class="doodle"><canvas id="doodlePad" width="96" height="96"></canvas><div>
        <div class="swatches" id="swatches"></div>
        <div class="row"><button class="st-pill" id="doodleClear" type="button">Clear</button><button class="st-pill primary" id="doodleSend" type="button">Mail it</button></div>
        <div class="note-hint" id="doodleHint">One doodle a day. Draw, don't write: he can't read.</div></div></div></div>
      <div class="pane" data-pane="swap" hidden><p>Leave a find on the picnic table. When he’s awake he’ll turn it over in his paws. If he wants to trade, you get a trinket from his stash.</p><div class="swap-choices" role="group" aria-label="Choose a trinket to offer"></div><p class="swap-receipt" aria-live="polite"></p><div class="note-hint swap-hint" role="status"></div></div>
      <div class="pane" data-pane="yours" hidden><ul class="journal" id="yoursList"></ul></div>
    </section>
    <section class="sheet st-card pe" id="brainSheet" hidden role="dialog" aria-label="Labcoon's brain">
      <div class="grab"></div>
      <header><span class="title">His brain</span><button class="st-round x" type="button" data-close aria-label="Close">${I.x}</button></header>
      <div class="pane" id="brainPane"></div>
    </section>
    <section class="sheet st-card pe" id="needsSheet" hidden role="dialog" aria-label="How Labcoon is doing">
      <div class="grab"></div>
      <header><span class="title">How he’s doing</span><button class="st-round x" type="button" data-close aria-label="Close">${I.x}</button></header>
      <div class="pane needs-pane" id="needsPane"></div>
    </section>
    <section class="sheet st-card pe" id="thingsSheet" hidden role="dialog" aria-label="His things">
      <div class="grab"></div>
      <header><span class="title">His things</span><button class="st-round x" type="button" data-close aria-label="Close">${I.x}</button></header>
      <div class="tabs" role="tablist">${[['art', 'Art'], ['songs', 'Songs'], ['games', 'Games'], ['journal', 'Journal'], ['map', 'Map']].map(([k, l], i) => `<button role="tab" data-tab="${k}" aria-selected="${!i}">${l}</button>`).join('')}</div>
      <div class="pane" data-pane="art"><div class="grid" id="artGrid"></div><div class="big" id="artBig" hidden></div></div>
      <div class="pane" data-pane="songs" hidden><div id="songList"></div></div>
      <div class="pane" data-pane="games" hidden><p>Pull up a stool at the picnic table. He plays for fun, and win or lose, he’ll be thinking about it later.</p><div class="games" id="gameList"></div></div>
      <div class="pane" data-pane="journal" hidden><div id="ownerWriting" hidden></div><div id="sharedNotes"><h3>Field notes</h3><ul class="journal" id="journalList"></ul></div><details><summary>Recent activity</summary><ul class="journal" id="activityList"></ul></details></div>
      <div class="pane mapbox" data-pane="map" hidden><svg id="mapSvg" viewBox="-29 -36 56 50" role="img" aria-label="Map of the field"></svg><div class="take" id="mapList"></div></div>
    </section>`;

  /* ---------- right now card / chip ---------- */
  const card = $('#lcCard'), chip = $('#lcChip'), small = matchMedia('(max-width: 760px)');
  const setOpen = open => { card.hidden = !open; chip.hidden = open; chip.setAttribute('aria-expanded', open); };
  setOpen(!small.matches);
  chip.addEventListener('click', () => setOpen(true));
  document.getElementById('statusPill')?.addEventListener('click', () => setOpen(true));
  $('#nowClose').addEventListener('click', () => setOpen(false));

  /* ---------- sheets ---------- */
  const scrim = $('#scrim'), onTab = {};
  let openSheet = null;
  function show(el, tab) {
    if (openSheet && openSheet !== el) hideSheet(openSheet, true);
    el.hidden = false; scrim.hidden = false; openSheet = el; blip('swoop'); $('#coach').hidden = true;
    requestAnimationFrame(() => { el.classList.add('on'); scrim.classList.add('on'); });
    if (tab) selectTab(el, tab);
  }
  function hideSheet(el = openSheet, quick = false) {
    if (!el) return; el.classList.remove('on', 'tall'); scrim.classList.remove('on'); if (!quick) blip('close');
    const done = () => { el.hidden = true; if (openSheet === el) { scrim.hidden = true; openSheet = null; } };
    quick ? done() : setTimeout(done, 300);
  }
  function selectTab(el, k) {
    for (const b of el.querySelectorAll('[role=tab]')) b.setAttribute('aria-selected', b.dataset.tab === k);
    for (const p of el.querySelectorAll('[data-pane]')) p.hidden = p.dataset.pane !== k;
    onTab[k]?.();
  }
  for (const el of [$('#lcSheet'), $('#thingsSheet'), $('#needsSheet'), $('#brainSheet')]) {
    el.querySelector('[data-close]').addEventListener('click', () => hideSheet(el));
    for (const b of el.querySelectorAll('[role=tab]')) b.addEventListener('click', () => selectTab(el, b.dataset.tab));
  }
  scrim.addEventListener('click', () => hideSheet());
  // Every button of his gets a sound and a little bounce. Sheet openers and closers already swoop; the game board has its own.
  hud.addEventListener('click', e => {
    const b = e.target.closest('button,[role=button],summary,.art,.gamecard'); if (!b || b.closest('.game-scrim')) return;
    b.classList.remove('tapped'); void b.offsetWidth; b.classList.add('tapped');
    if (b.matches('[data-close],.x,#leaveBtn,#thingsBtn')) return;
    blip(b.matches('[role=tab],[data-book]') ? 'tab' : b.matches('[data-turn],.art-nav button,summary') ? 'page' : b.matches('.st-pill,.st-round,.gamecard,.art') ? 'tick' : 'tap');
  });
  hud.addEventListener('animationend', e => { if (e.animationName === 'tapBounce') e.target.classList.remove('tapped'); });
  // Drag a sheet down by its grabber or header to put it away; a short drag springs back.
  for (const el of [$('#lcSheet'), $('#thingsSheet'), $('#needsSheet'), $('#brainSheet')]) {
    let y0 = null, dy = 0, t0 = 0;
    const end = () => {
      if (y0 == null) return; y0 = null;
      const fast = dy / Math.max(1, performance.now() - t0) > .5;
      el.style.transition = ''; el.style.transform = ''; el.style.maxHeight = ''; scrim.style.opacity = '';
      if (dy < -50) { if (!el.classList.contains('tall')) { el.classList.add('tall'); blip('swoop'); } }
      else if (el.classList.contains('tall') && (dy > 80 || (fast && dy > 30))) { el.classList.remove('tall'); blip('close'); }
      else if (dy > 110 || (fast && dy > 30)) hideSheet(el); else if (Math.abs(dy) > 8) blip('snap');
    };
    for (const h of [el.querySelector('.grab'), el.querySelector('header')]) {
      h.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; t0 = performance.now(); h.setPointerCapture(e.pointerId); el.style.transition = 'none'; });
      h.addEventListener('pointermove', e => { if (y0 == null) return; dy = Math.max(-140, e.clientY - y0); el.style.transform = `translate(-50%,${Math.max(0, dy)}px)`; if (dy < 0) el.style.maxHeight = `calc(min(82dvh,720px) + ${-dy}px)`; scrim.style.opacity = String(Math.max(0, 1 - dy / 320)); });
      h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
    }
  }
  $('#leaveBtn').addEventListener('click', () => show($('#lcSheet'), 'hi'));
  /* ---------- How he's doing: tap the needs strip ---------- */
  const NEED_INFO = {
    hunger: {label: 'Full', fix: 'Eating: finds from the trash, crayfish, frogs, and fish he catches himself.',
      say: v => v > .75 ? 'His belly is full. Food can wait.' : v > .45 ? 'He could eat.' : v > .2 ? 'Getting hungry. He’ll go foraging soon.' : 'Starving. Food comes first.'},
    energy: {label: 'Energy', fix: 'Naps in his culvert, and his long sleep in the late morning.',
      say: v => v > .7 ? 'Bright-eyed and ready for anything.' : v > .4 ? 'Steady.' : v > .2 ? 'Getting sleepy.' : 'Running on fumes. A nap is coming.'},
    joy: {label: 'Joy', fix: 'Shiny finds, washing them, making art and music, catching fish, games with visitors.',
      say: v => v > .75 ? 'Delighted with the world.' : v > .45 ? 'Content.' : v > .25 ? 'A bit flat.' : 'Low. He needs a win.'},
    boredom: {label: 'Boredom', fix: 'Anything new: exploring, a game, a visitor, a project.',
      say: v => v < .2 ? 'Busy and absorbed.' : v < .5 ? 'Doing fine.' : v < .75 ? 'Getting restless.' : 'Bored stiff. He’ll go looking for trouble.'},
    curiosity: {label: 'Curiosity', fix: 'Exploring new corners, writing questions in his journal, the shed computer.',
      say: v => v > .7 ? 'Itching to poke at something new.' : v > .4 ? 'Nosy.' : 'Satisfied for now.'},
  };
  const shown = (k, v) => k === 'hunger' ? 1 - v : v;
  // Bars drift on their own (energy drains, his belly empties, boredom creeps up), so only changes in the direction
  // his actions push them are credited to what he did; joy goes both ways because things happen to him.
  const CREDIT = {hunger: 1, energy: 1, joy: 0, boredom: -1, curiosity: -1};
  const firstLine = s => String(s || '').split(/(?<=[.!?])\s/)[0];
  async function needsSheet() {
    const pane = $('#needsPane'), h = state || {}, n = h.needs || {};
    const head = `<p class="needs-lede">${esc(h.asleep ? 'He’s asleep right now.' : 'Right now he’s ' + (h.mood || 'content') + (h.place ? ' at ' + (places[h.place]?.label || h.place.replace(/_/g, ' ')) : '') + '.')} Here’s what’s behind each bar.</p>`;
    const card = (k, moves) => { const I2 = NEED_INFO[k], known = Number.isFinite(n[k]), v = known ? Math.round(shown(k, n[k]) * 100) : 0;
      return `<article class="need-card st-card" style="--c:var(--${k})"><header><b>${I2.label}</b><span>${known ? v + '%' : '—'}</span></header><div class="need-bar"><i style="width:${v}%"></i></div>
        <p class="need-say">${known ? esc(I2.say(shown(k, n[k]))) : 'Not sure yet.'}</p>${moves.length ? `<ul class="need-moves">${moves.map(m => `<li><em class="${(k === 'boredom' ? m.d < 0 : m.d > 0) ? 'up' : 'down'}">${m.d > 0 ? '+' : '−'}${Math.round(Math.abs(m.d) * 100)}%</em> ${esc(m.text)}${m.time ? ` <small>${esc(m.time)}</small>` : ''}</li>`).join('')}</ul>` : ''}
        <p class="need-fix"><b>What helps:</b> ${esc(I2.fix)}</p></article>`; };
    const paint = moves => { pane.innerHTML = head + NEEDS.map(([k]) => card(k, moves[k] || [])).join(''); };
    paint({});
    if (!api) return;
    try {                                                   // what moved each bar: the biggest changes over his last ~40 events
      const st = await api('/state'), last = st.events?.at(-1)?.id || 0, r = await api('/events?since=' + Math.max(0, last - 40));
      const ev = (r.events || []).filter(e => e.hud?.needs), moves = {};
      for (let i = 1; i < ev.length; i++) for (const [k] of NEEDS) {
        const a = ev[i - 1].hud.needs[k], b = ev[i].hud.needs[k]; if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
        const d = shown(k, b) - shown(k, a); if (Math.abs(d) < .05 || (CREDIT[k] && Math.sign(d) !== CREDIT[k])) continue;
        (moves[k] ||= []).push({d, text: 'He ' + third(firstLine(ev[i].text)), time: ev[i].time});
      }
      for (const k in moves) moves[k] = moves[k].sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).slice(0, 3);
      if (!$('#needsSheet').hidden) paint(moves);
    } catch {}
  }
  hud.querySelector('.needs').addEventListener('click', () => { show($('#needsSheet')); needsSheet(); });
  /* ---------- His brain: the live loop ---------- */
  let brain = null;
  $('#brainLink').addEventListener('click', () => {
    show($('#brainSheet'));
    if (!brain) brain = brainView($('#brainPane'), {api, places, get: () => { const w = brainWorld();
      return {hud: state || {}, weather: w.weather, nearby: w.nearby || [], clock: $('#clock span')?.textContent || '', lastEvent: journal[0] ? 'He ' + third(journal[0].text) : ''}; }});
    else brain.refresh();
  });
  hud.querySelector('.needs').setAttribute('role', 'button'); hud.querySelector('.needs').tabIndex = 0;
  hud.addEventListener('click', e => { if (e.target.closest('#playCheckers')) startGame('checkers'); if (e.target.closest('#petHim')) onPet?.(); });
  $('#thingsBtn').addEventListener('click', () => show($('#thingsSheet'), 'art'));
  $('#mapBtn').addEventListener('click', () => show($('#thingsSheet'), 'map'));
  $('#journalLink').addEventListener('click', () => show($('#thingsSheet'), 'journal'));
  $('#followBtn').addEventListener('click', () => onFollow());

  /* ---------- first visit ---------- */
  try { if (!localStorage.getItem('labcoon-coached')) $('#coach').hidden = false; } catch { $('#coach').hidden = false; }
  const coached = () => { $('#coach').hidden = true; try { localStorage.setItem('labcoon-coached', '1'); } catch {} };
  $('#coachOk').addEventListener('click', coached);
  document.getElementById('world')?.addEventListener('pointerdown', coached, {once: true});   // any first touch of the field counts
  $('#finder').addEventListener('click', () => onTakeMe('labcoon'));
  $('#walkToBtn').addEventListener('click', () => onWalkTo?.());

  /* ---------- sound ---------- */
  const soundBtn = $('#soundBtn');
  const paintSound = () => { soundBtn.innerHTML = sound.on ? I.sound : I.mute; soundBtn.setAttribute('aria-pressed', sound.on); soundBtn.setAttribute('aria-label', sound.on ? 'Sound on' : 'Sound off'); };
  paintSound();
  soundBtn.addEventListener('click', () => { sound.set(!sound.on); paintSound(); if (sound.on) setTimeout(() => sfx('tick'), 60); });

  /* ---------- "Yours": what you sent him and what he said, kept in this browser ---------- */
  const yoursKey = 'labcoon-yours';
  const yours = () => { try { return JSON.parse(localStorage.getItem(yoursKey) || '[]'); } catch { return []; } };
  function remember(item) { try { localStorage.setItem(yoursKey, JSON.stringify([{...item, at: Date.now()}, ...yours()].slice(0, 40))); } catch {} }
  let trades=[];
  const renderYours = () => {
    const y = [...yours(),...trades].sort((a,b)=>b.at-a.at);
    $('#yoursList').innerHTML = y.length ? y.map(i => `<li><time>${new Date(i.at).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}</time><span>${i.kind === 'hi' ? `You: “${esc(i.text)}”${i.reply ? `<br><i>Labcoon: ${esc(i.reply)}</i>` : ''}` : i.kind === 'doodle' ? 'You mailed him a doodle.' : i.kind === 'swap' ? esc(i.text) : i.kind === 'game' ? `Picnic table · ${esc(i.text)}` : `You mailed him: “${esc(i.text)}”`}</span></li>`).join('') : '<li class="empty">Nothing yet. Say hi, or mail him a note.</li>';
  };

  /* ---------- say hi (5 a day) ---------- */
  const dayKey = 'labcoon-hi-' + new Date().toDateString();
  const used = () => { try { return +localStorage.getItem(dayKey) || 0; } catch { return 0; } };
  const updateLeft = () => { const n = 5 - used(); $('#hiLeft').textContent = n > 0 ? `${n} hellos left today${live ? '' : ' · offline preview: he answers for real when he’s live'}` : 'That’s your five for today. He’ll be here tomorrow.'; $('#hiInput').disabled = n <= 0; };
  const refreshSwaps=swapTable($('#lcSheet [data-pane=swap]'),api,records=>{
    trades=records;
    if(openSheet===$('#lcSheet') && !$('#lcSheet [data-pane=yours]').hidden)renderYours();
  });
  onTab.swap=refreshSwaps;
  onTab.yours=()=>{renderYours();refreshSwaps();};
  setInterval(()=>{
    if(!document.hidden && openSheet===$('#lcSheet') && (!$('#lcSheet [data-pane=swap]').hidden||!$('#lcSheet [data-pane=yours]').hidden))refreshSwaps();
  },5000);
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
  let artLoad = 0;
  onTab.art = async () => {
    const revision = ++artLoad;
    const grid = $('#artGrid'), big = $('#artBig'); big.hidden = true; grid.hidden = false;
    grid.innerHTML = '<div class="empty">Looking in the art shed…</div>';
    const items = await load('drawing');
    if (revision !== artLoad) return;
    grid.innerHTML = items.length ? '' : '<div class="empty">Nothing pinned up yet. He draws when the itch hits.</div>';
    if (!items.length) return;
    const wallBtn = document.createElement('button'); wallBtn.type = 'button'; wallBtn.className = 'st-pill dark gal-open';
    wallBtn.innerHTML = `See all ${items.length} big <span aria-hidden="true">⤢</span>`; wallBtn.addEventListener('click', () => openGallery(items, {sound: blip}));
    grid.appendChild(wallBtn);
    big.innerHTML = `<div class="frame"></div><div class="art-nav">
      <button class="st-round" type="button" aria-label="Previous drawing" data-step="-1">←</button>
      <div aria-live="polite" aria-atomic="true"><b></b><small></small></div>
      <button class="st-round" type="button" aria-label="Next drawing" data-step="1">→</button>
      </div><button class="st-pill" type="button" id="artBack">Back to the wall</button>`;
    let current = 0;
    function display(index) {
      current = (index + items.length) % items.length;
      const drawing = items[current];
      big.querySelector('.frame').innerHTML = drawing.svg;
      big.querySelector('b').textContent = drawing.title;
      big.querySelector('small').textContent = (current + 1) + ' of ' + items.length;
    }
    for (const arrow of big.querySelectorAll('[data-step]')) {
      arrow.hidden = items.length < 2;
      arrow.addEventListener('click', () => display(current + Number(arrow.dataset.step)));
    }
    big.onkeydown = event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault(); event.stopPropagation();
      display(current + (event.key === 'ArrowLeft' ? -1 : 1));
    };
    $('#artBack').addEventListener('click', () => {
      big.hidden = true; grid.hidden = false; grid.children[current].focus();
    });
    items.forEach((a, index) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'art st-card';
      b.innerHTML = `<div class="frame">${a.svg}</div><b>${esc(a.title)}</b><small>${esc(a.medium === 'mud' ? 'stick in mud' : a.medium === 'paw_paint' ? 'paw paint' : 'crayon')}</small>`;
      b.addEventListener('click', () => openGallery(items, {start: index, sound: blip}));
      grid.appendChild(b);
    });
  };
  onTab.songs = async () => {
    const list = $('#songList'); list.innerHTML = '<div class="empty">Finding his tunes…</div>';
    const items = await load('song');
    list.innerHTML = items.length ? '' : '<div class="empty">No tunes yet. He plays his ocarina when he feels like it.</div>';
    for (const s of items) {
      const row = document.createElement('div'); row.className = 'song st-card';
      row.innerHTML = `<button class="st-round" type="button" aria-label="Play ${esc(s.title)}">${I.play}</button><div><b>${esc(s.title)}</b><small>${esc((s.instrument || 'ocarina').replace('_', ' '))} · ${s.notes.length} notes</small></div><div class="notes">${s.notes.slice(0, 18).map(([n, b]) => `<i style="height:${n === 'rest' ? 2 : 6 + 'CDEGA'.indexOf(n[0]) * 3 + (n[1] === '6' ? 8 : 0)}px;opacity:${.3 + Math.min(b, 2) * .3}"></i>`).join('')}</div>`;
      row.querySelector('button').addEventListener('click', e => { const btn = e.currentTarget, secs = playTune(s, .5); btn.classList.add('playing'); setTimeout(() => btn.classList.remove('playing'), secs * 1000); });
      list.appendChild(row);
    }
  };
  /* ---------- games at the picnic table ---------- */
  const recKey = 'labcoon-games';
  const record = () => { try { return JSON.parse(localStorage.getItem(recKey) || '{}'); } catch { return {}; } };
  let chessUI = null;
  import('./games/chess-ui.js?v=5').then(m => { chessUI = m.playChess; }).catch(() => {});
  function gameResult(r) {
    try { const rec = record(); const g = rec[r.game] || {w: 0, l: 0, d: 0}; g[r.result[0]]++; rec[r.game] = g; localStorage.setItem(recKey, JSON.stringify(rec)); } catch {}
    remember({kind: 'game', text: `${r.game}: you ${r.result === 'win' ? 'won' : r.result === 'loss' ? 'lost' : 'drew'}`});
    onGame?.(r);
  }
  function startGame(kind) { hideSheet(openSheet, true); openGame(kind, {onResult: gameResult, chess: chessUI}); }
  const ICONS = {checkers: '<svg viewBox="0 0 40 40"><circle cx="14" cy="14" r="8" fill="#d23b2e" stroke="#22302f" stroke-width="2.4"/><circle cx="27" cy="27" r="8" fill="#b9793f" stroke="#22302f" stroke-width="2.4"/></svg>',
    chess: '<svg viewBox="0 0 40 40"><path d="M14 33h14l-2-5h-10zM16 28l1-9h8l1 9M15 19h12M18 19v-5a3 3 0 0 1 6 0v5" fill="#f5ecdc" stroke="#22302f" stroke-width="2.4" stroke-linejoin="round"/></svg>'};
  onTab.games = () => {
    const list = $('#gameList'), rec = record(); list.innerHTML = '';
    for (const [k, name, blurb] of [['checkers', 'Checkers', 'Your acorns against his bottle caps. He can’t resist a jump.'], ['chess', 'Chess', 'He’s learning. Go easy on him… or don’t.']]) {
      const ready = k === 'checkers' || !!chessUI, r = rec[k];
      const b = document.createElement('button'); b.type = 'button'; b.className = 'gamecard st-card'; b.disabled = !ready;
      b.innerHTML = `<span class="ico">${ICONS[k]}</span><span><b>${name}</b><small>${ready ? blurb : 'Setting up the board… soon.'}</small></span><span class="rec">${r ? `you ${r.w} · him ${r.l}${r.d ? ' · draws ' + r.d : ''}` : ready ? 'play' : ''}</span>`;
      if (ready) b.addEventListener('click', () => startGame(k));
      list.appendChild(b);
    }
  };
  const ownerHere = live && ['127.0.0.1','localhost'].includes(location.hostname) && location.port === '5430';
  const ownerWriting = $('#ownerWriting');
  const requestedJournal = new URLSearchParams(location.search).get('journal');
  let refreshWriting = null;
  if (ownerHere || (live && api)) {                       // visitors read the filtered copy the brain publishes
    ownerWriting.hidden=false; $('#sharedNotes').hidden=true;
    refreshWriting=ownerHere ? fieldNotebook(ownerWriting,places,requestedJournal) : fieldNotebook(ownerWriting,places,requestedJournal,()=>api('/writing'));
  }
  const journal = [];
  onTab.journal = () => {
    const notes = (state.fieldNotes || []).slice().reverse().map(n=>{
      const subject = n.topic || ('something at '+(places[n.place]?.label || 'the pond'));
      const source = Number.isSafeInteger(n.page) && n.page>0 ? ` · <a href="https://en.wikipedia.org/?curid=${n.page}" target="_blank" rel="noopener noreferrer">what he read</a>` : '';
      return `<li><time>field note</time><span>Wondering about ${esc(subject)}${source}</span></li>`;
    });
    const events = journal.map(j=>`<li><time>${esc(j.time)}</time><span>${esc(j.text)}</span></li>`);
    $('#journalList').innerHTML = notes.join('') || '<li class="empty">He hasn’t shared a field note yet.</li>';
    $('#activityList').innerHTML = events.join('') || '<li class="empty">No recent activity.</li>';
    refreshWriting?.();
  };

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
  if(new URLSearchParams(location.search).get('swap')==='1')show($('#lcSheet'),'swap');
  if (['1','thoughts','notes','nights','searches'].includes(requestedJournal)) show($('#thingsSheet'), 'journal');
  return {
    set(h, line) {
      if (line) {
        const [time, ...rest] = line.split(' · '), text = rest.join(' · ') || line;
        // Lines about him read "Labcoon dips his paws…"; field lines ("The drone pilots pack up…") stand on their own.
        const aboutHim = /^You\b/.test(text);
        $('#statusPill b').hidden = !aboutHim;
        $('#labcoonDoing').textContent = aboutHim ? third(text) : text.replace(/\.$/, '');
        $('#lcTitle').textContent = text;
        if (!journal.length || journal[0].text !== text) { journal.unshift({time: rest.length ? time : '', text}); journal.length = Math.min(journal.length, 50); }
        if (!document.querySelector('#thingsSheet [data-pane=journal]').hidden) onTab.journal();
      }
      if (!h) return; state = h;
      if (!document.querySelector('#thingsSheet [data-pane=journal]').hidden) onTab.journal();
      const mood = h.asleep ? 'asleep · zz' : h.mood || 'content';
      $('#lcMood').textContent = mood; $('#lcChipMood').textContent = mood;
      $('#lcPlace').textContent = 'At ' + (places[h.place]?.label || h.place?.replace(/_/g, ' ') || 'the pond') + (h.holding ? ` · holding a ${h.holding}` : '');
      // The public feed swaps his private thought for a stock line about the current step ("You explore the field."),
      // which isn't a thought and repeats the plan below, so the quote only shows real words of his.
      const realThought = h.thought && !/^You\b/.test(h.thought);
      $('#lcThought').textContent = h.asleep ? 'Dreaming. Tap him to wake him (it takes a few pokes).' : realThought ? '“' + h.thought + '”' : '';
      $('#lcThought').hidden = !h.asleep && !realThought;
      const plan = $('#lcPlan'); plan.innerHTML = '';
      (h.asleep ? [] : h.plan || []).slice(0, 5).forEach((m, i) => {
        const li = document.createElement('li'), [mv, ...rest] = m.split(' '), arg = rest.join(' ');
        li.textContent = (MOVE_WORDS[mv] || mv.replace(/_/g, ' ')) + (arg ? ' ' + (places[arg]?.label || arg.replace(/_/g, ' ')) : '');
        li.className = i < h.step ? 'done' : i === h.step ? 'now' : ''; plan.appendChild(li);
      });
      plan.hidden = !plan.children.length; plan.previousElementSibling.hidden = plan.hidden;
      for (const [k] of NEEDS) { const b = hud.querySelector(`.need[data-k="${k}"] b`); if (b) { const v = h.needs?.[k] ?? 0; b.style.width = Math.round((k === 'hunger' ? 1 - v : v) * 100) + '%'; } }   // the Full bar is a belly: it fills when he eats
      $('#lcProject').textContent = !h.project ? 'Lately: pottering' : /^A project in progress/.test(h.project) ? 'Lately: busy with a project of his own' : 'Lately: ' + h.project;
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
      show($('#lcSheet'), 'hi'); $('#sheetText').textContent = text; $('#hiForm').hidden = !canTalk; $('#hiLeft').hidden = !canTalk; $('#playRow').hidden = !canTalk; if (canTalk) updateLeft();
    },
    bubble(text, x, y) {
      const b = $('#lcBubble');
      if (text === null) { b.hidden = true; return; }
      if (text !== undefined) { b.textContent = text; b.hidden = false; }
      if (x != null) b.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%)`;
    },
    finder(x, y, angle) {                         // his face at the screen edge, pointing to him when he's off-screen
      const f = $('#finder'); if (x == null) { f.hidden = true; return; }
      f.hidden = false; f.style.left = Math.round(x) + 'px'; f.style.top = Math.round(y) + 'px'; f.querySelector('.arrow').style.transform = `rotate(${angle}rad)`;
    },
    heard(song, near) { const v = typeof near === 'number' ? near : near ? .28 : 0; if (sound.ready && v > .02) playTune(song, v); },   // louder the closer you are
    remember,
    get state() { return state; },
  };
}
