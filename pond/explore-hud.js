/* Explore HUD (prototype, Nov 26 2026): Labcoon's state card, the map with "take me to", and the
   Labcoon sheet (wake taps, say hi). Plain DOM over the canvas; explore.js feeds it.
   Data: each replayed brain event carries `hud` {mood, place, asleep, holding, project, needs, thought, plan, step}. */
const $ = s => document.querySelector(s);
const NEEDS = [['hunger', 'Hunger'], ['energy', 'Energy'], ['joy', 'Joy'], ['boredom', 'Boredom'], ['curiosity', 'Curiosity']];
const MOVE_WORDS = {walk_to: 'go to', swim_to: 'swim to', sit_and_watch: 'watch', hold_up_to_moon: 'hold it up to the moon', pick_up: 'pick up',
  take_from_stash: 'take from the stash', stash: 'stash it', wash: 'wash it', watch_fish: 'watch the fish', swat_at_fish: 'swat at a fish',
  check_mail: 'check the mail', pry_lid: 'pry the lid', dig_in: 'dig in', draw: 'draw', hand_paint: 'paint', nap: 'nap', explore: 'explore',
  sniff: 'sniff', write_on_board: 'write on the board', eat: 'eat it', eat_here: 'eat it here', note_for_bobby: 'note for Bobby',
  ask_bobby: 'ask Bobby', wish: 'make a wish', build_sculpture: 'build a sculpture', drop: 'put it down', climb: 'climb'};

export function createHud({places, onTakeMe, onFollow, onSayHi, ground, pond}) {
  const hud = $('#hud2');
  hud.innerHTML = `
    <section class="lc-card" id="lcCard" aria-live="polite">
      <button class="lc-chip" id="lcChip" type="button" aria-expanded="false">
        <span class="lc-name">Labcoon</span><span class="lc-mood" id="lcMood">…</span><span class="lc-chev" aria-hidden="true">▾</span>
      </button>
      <div class="lc-body">
        <p class="lc-place" id="lcPlace"></p>
        <p class="lc-thought" id="lcThought"></p>
        <ol class="lc-plan" id="lcPlan"></ol>
        <div class="lc-needs" id="lcNeeds">${NEEDS.map(([k, l]) => `<div class="lc-need" data-k="${k}"><span>${l}</span><i><b></b></i></div>`).join('')}</div>
        <p class="lc-project" id="lcProject"></p>
      </div>
    </section>
    <div class="lc-tools">
      <button type="button" class="lc-btn" id="mapBtn">Map</button>
      <button type="button" class="lc-btn lc-primary" id="followBtn">Follow Labcoon</button>
    </div>
    <p class="lc-journal" id="labcoonDoing">waking up…</p>
    <div class="lc-map" id="lcMap" hidden>
      <div class="lc-map-panel" role="dialog" aria-label="Map of the field">
        <header><b>The field</b><button type="button" class="lc-x" id="mapClose" aria-label="Close map">×</button></header>
        <svg id="mapSvg" viewBox="-29 -36 56 50" role="img" aria-label="Top-down map"></svg>
        <p class="lc-take">Take me to</p>
        <div class="lc-list" id="mapList"></div>
      </div>
    </div>
    <div class="lc-sheet" id="lcSheet" hidden>
      <p id="sheetText"></p>
      <form id="hiForm"><input id="hiInput" maxlength="160" placeholder="Say hi to Labcoon" autocomplete="off"><button class="lc-btn lc-primary" type="submit">Say hi</button></form>
      <small id="hiLeft"></small>
    </div>
    <div class="lc-bubble" id="lcBubble" hidden></div>`;
  const card = $('#lcCard'), chip = $('#lcChip');
  const small = matchMedia('(max-width: 700px)');
  const setOpen = open => { card.classList.toggle('open', open); chip.setAttribute('aria-expanded', open); };
  setOpen(!small.matches);
  chip.addEventListener('click', () => setOpen(!card.classList.contains('open')));

  /* ---- map ---- */
  const svg = $('#mapSvg'), ns = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent = svg) => { const n = document.createElementNS(ns, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); parent.appendChild(n); return n; };
  el('rect', {x: -42, y: -53.5, width: 84, height: 84, class: 'm-field'});
  el('ellipse', {cx: 0, cy: -8, rx: 27, ry: 25, class: 'm-clear'});            // the clearing inside the corn ring
  el('path', {d: 'M-18.2 -53.5 V30.5 M-16.6 -53.5 V30.5', class: 'm-lane'});
  { // the real shoreline, sampled from the terrain
    const pts = [];
    for (let k = 0; k < 96; k++) {
      const a = k / 96 * Math.PI * 2; let d = 2;
      while (d < 30 && ground(Math.cos(a) * d + pond.center.x, Math.sin(a) * d + pond.center.y) <= 0) d += .1;
      pts.push((Math.cos(a) * d + pond.center.x).toFixed(1) + ',' + (Math.sin(a) * d + pond.center.y).toFixed(1));
    }
    el('polygon', {points: pts.join(' '), class: 'm-pond'});
  }
  el('rect', {x: -14.6, y: -5.6, width: 3, height: 2.4, class: 'm-shed', transform: 'rotate(8.6 -13.1 -4.4)'});
  const labelled = ['culvert', 'washing_rock', 'cattails', 'oak', 'art_shed', 'trash_can', 'mailbox', 'drone_course', 'picnic_table', 'bird_feeder'];
  const SHORT = {culvert: 'culvert · home', washing_rock: 'washing rock', trash_can: 'trash can', drone_course: 'drone course', picnic_table: 'picnic table', bird_feeder: 'bird feeder', art_shed: 'art shed', cattails: 'cattails', oak: 'oak', mailbox: 'mailbox'};
  const NUDGE = {picnic_table: [1.2, -.6], drone_course: [1.2, 1.6], bird_feeder: [1.2, -.4], art_shed: [-6.6, 1.8], trash_can: [1.2, .6], mailbox: [1.2, .6]};
  for (const k of labelled) {
    const p = places[k]; if (!p) continue;
    const g = el('g', {class: 'm-place', 'data-k': k, transform: `translate(${p.at[0]} ${p.at[1]})`});
    el('circle', {r: k === 'culvert' ? .85 : .55}, g);
    const [nx, ny] = NUDGE[k] || [1.2, .5]; el('text', {x: nx, y: ny}, g).textContent = SHORT[k] || p.label;
    g.addEventListener('click', () => { closeMap(); onTakeMe(k); });
  }
  const you = el('g', {class: 'm-you'}); el('circle', {r: .8}, you); el('path', {d: 'M0 -2 L.8 -.7 L-.8 -.7 Z'}, you);
  const coon = el('g', {class: 'm-coon'}); el('circle', {r: .9}, coon);
  const list = $('#mapList');
  for (const [k, text] of [['labcoon', 'Labcoon'], ['culvert', 'His culvert'], ['washing_rock', 'Washing rock'], ['art_shed', 'Art shed'],
    ['mailbox', 'Mailbox'], ['the_shed', 'The LaB shed'], ['drone_course', 'Drone course'], ['oak', 'The oak']]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'lc-btn'; b.textContent = text;
    b.addEventListener('click', () => { closeMap(); onTakeMe(k); }); list.appendChild(b);
  }
  const map = $('#lcMap');
  const openMap = () => { map.hidden = false; requestAnimationFrame(() => map.classList.add('on')); };
  const closeMap = () => { map.classList.remove('on'); setTimeout(() => { map.hidden = true; }, 220); };
  $('#mapBtn').addEventListener('click', openMap); $('#mapClose').addEventListener('click', closeMap);
  map.addEventListener('click', e => { if (e.target === map) closeMap(); });
  $('#followBtn').addEventListener('click', () => onFollow());

  /* ---- Labcoon sheet: say hi (offline preview), 5 a day ---- */
  const sheet = $('#lcSheet'), hiLeft = $('#hiLeft');
  const dayKey = 'labcoon-hi-' + new Date().toDateString();
  const used = () => { try { return +localStorage.getItem(dayKey) || 0; } catch { return 0; } };
  const updateLeft = () => { const n = 5 - used(); hiLeft.textContent = n > 0 ? `${n} hellos left today · offline preview, the live Labcoon answers from his brain` : 'That’s your five for today. He’ll be here tomorrow.'; $('#hiInput').disabled = n <= 0; };
  $('#hiForm').addEventListener('submit', e => {
    e.preventDefault(); const v = $('#hiInput').value.trim(); if (!v || used() >= 5) return;
    try { localStorage.setItem(dayKey, used() + 1); } catch {}
    $('#hiInput').value = ''; updateLeft(); onSayHi(v);
  });

  let state = {};
  return {
    set(h, journal) {
      if (journal) $('#labcoonDoing').textContent = journal;
      if (!h) return; state = h;
      $('#lcMood').textContent = h.asleep ? 'asleep · zz' : h.mood;
      $('#lcPlace').textContent = 'At ' + (places[h.place]?.label || h.place?.replace(/_/g, ' ') || 'the pond') + (h.holding ? ` · holding a ${h.holding}` : '');
      $('#lcThought').textContent = h.asleep ? 'Dreaming. Tap him three times to wake him.' : h.thought ? '“' + h.thought + '”' : 'Just pottering.';
      const plan = $('#lcPlan'); plan.innerHTML = '';
      (h.asleep ? [] : h.plan || []).slice(0, 5).forEach((m, i) => {
        const li = document.createElement('li'), [mv, ...rest] = m.split(' '), arg = rest.join(' ');
        li.textContent = (MOVE_WORDS[mv] || mv.replace(/_/g, ' ')) + (arg ? ' ' + (places[arg]?.label || arg.replace(/_/g, ' ')) : '');
        li.className = i < h.step ? 'done' : i === h.step ? 'now' : ''; plan.appendChild(li);
      });
      plan.hidden = !plan.children.length;
      for (const [k] of NEEDS) { const b = hud.querySelector(`.lc-need[data-k="${k}"] b`); if (b) b.style.width = Math.round((h.needs?.[k] ?? 0) * 100) + '%'; }
      $('#lcProject').textContent = h.project ? 'Project: ' + h.project : '';
    },
    mapDots(me, coonPos) {
      if (map.hidden) return;
      you.setAttribute('transform', `translate(${me.pos.x.toFixed(1)} ${me.pos.z.toFixed(1)}) rotate(${(-me.yaw * 180 / Math.PI).toFixed(0)})`);
      coon.setAttribute('transform', `translate(${coonPos.x.toFixed(1)} ${coonPos.z.toFixed(1)})`);
    },
    following(on) { $('#followBtn').textContent = on ? 'Walk' : 'Follow Labcoon'; },
    sheet(text, canTalk) {
      if (text == null) { sheet.hidden = true; return; }
      sheet.hidden = false; $('#sheetText').textContent = text; $('#hiForm').hidden = !canTalk; hiLeft.hidden = !canTalk; if (canTalk) updateLeft();
    },
    bubble(text, x, y) {
      const b = $('#lcBubble');
      if (text === null) { b.hidden = true; return; }
      if (text !== undefined) { b.textContent = text; b.hidden = false; }
      if (x != null) { b.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%)`; }
    },
    get state() { return state; },
  };
}
