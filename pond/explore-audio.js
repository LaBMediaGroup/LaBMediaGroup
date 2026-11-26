/* Explore's sound (Nov 26 2026): everything synthesised in the browser, nothing to download, in the
   homepage's manner (pond/next.js SND). One AudioContext, unlocked on the first release (phones need a
   tap's release, not a press), one master gain behind the HUD's sound toggle.
   The field: wind that follows the live wind and gusts, night crickets and the odd frog near water,
   daytime birds, water lapping near the pond, line hum near the poles, grass footsteps when you walk.
   The games: pick, clack, capture, crown, check, win, lose, and a gentle looping tune while you play.
   Also his instruments (playTune) and the HUD's little blips. */
let ctx = null, master = null, sfxBus = null, ambBus = null, musicBus = null, nb = null, on = true, started = false;
try { on = localStorage.getItem('labcoon-sound') !== 'off'; } catch {}
const beds = {};
function noise(sec, brown) {
  const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0); let last = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
  return b;
}
function bed(buf, type, f, q = .7) {
  const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
  const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = ctx.createGain(); g.gain.value = 0; s.connect(fl).connect(g).connect(ambBus); s.start(); return {g, f: fl};
}
export function ensure() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
    master = ctx.createGain(); master.gain.value = on ? 1 : 0; master.connect(ctx.destination);
    for (const n of ['sfxBus', 'ambBus', 'musicBus']) { const g = ctx.createGain(); g.connect(master); if (n === 'sfxBus') sfxBus = g; if (n === 'ambBus') ambBus = g; if (n === 'musicBus') musicBus = g; }
    ambBus.gain.value = .9; musicBus.gain.value = .95;
    nb = noise(2, false);
  }
  if (ctx.state === 'suspended') ctx.resume();
  if (!started && ctx.state !== 'closed') {
    started = true;
    beds.wind = bed(noise(6, true), 'bandpass', 420, .5);
    beds.water = bed(noise(5, true), 'lowpass', 520, .8);
    beds.hum = (() => { const g = ctx.createGain(); g.gain.value = 0; g.connect(ambBus);
      [60, 120, 180].forEach((f, i) => { const o = ctx.createOscillator(); o.frequency.value = f; const k = ctx.createGain(); k.gain.value = [1, .5, .2][i]; o.connect(k).connect(g); o.start(); }); return {g}; })();
  }
  return ctx;
}
addEventListener('pointerup', () => { if (on) ensure(); }, {once: true});
export const sound = {
  get on() { return on; },
  set(v) { on = v; try { localStorage.setItem('labcoon-sound', v ? 'on' : 'off'); } catch {} if (v) ensure(); if (master) master.gain.setTargetAtTime(v ? 1 : 0, ctx.currentTime, .2); },
  get ready() { return !!ctx && ctx.state === 'running' && on; },
};
const live = () => ctx && ctx.state === 'running' && on;
function burst(dur, type, f0, f1, gain, q = 1, bus = sfxBus, at = 0) {
  if (!live()) return; const t = ctx.currentTime + at, s = ctx.createBufferSource(); s.buffer = nb; s.loop = true;
  const fl = ctx.createBiquadFilter(); fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(.008, dur / 4)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl).connect(g).connect(bus); s.start(t, Math.random()); s.stop(t + dur + .05);
}
function tone(f, dur, {type = 'sine', gain = .2, at = 0, to = null, bus = sfxBus, attack = .005} = {}) {
  if (!live()) return; const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(bus); o.start(t); o.stop(t + dur + .05);
}

/* ---------------- game and HUD sounds ---------------- */
export function distantThunder(){
  if(!live())return;
  burst(2.9,'lowpass',230,48,.18,.55,ambBus);
  burst(2.2,'bandpass',115,53,.10,.65,ambBus,.44);
}
export function sfx(kind) {
  if (!live()) return;
  const r = 1 + (Math.random() - .5) * .08;
  switch (kind) {
    case 'tick': tone(980 * r, .05, {gain: .05, to: 1180}); break;
    case 'swoop': tone(380, .16, {gain: .05, to: 760}); burst(.18, 'bandpass', 600, 1800, .02, .8); break;
    case 'close': tone(620, .12, {gain: .045, to: 340}); break;
    case 'pick': tone(700 * r, .06, {gain: .07, to: 900}); burst(.04, 'bandpass', 2600, 2000, .05, 3); break;
    case 'place': burst(.07, 'bandpass', 1900 * r, 1200, .22, 2.2); tone(150 * r, .09, {gain: .2, to: 90}); break;       // wooden clack
    case 'his': burst(.07, 'bandpass', 1600 * r, 1000, .18, 2.2); tone(130 * r, .09, {gain: .16, to: 80}); break;
    case 'capture': sfx('place'); tone(520, .16, {gain: .09, to: 1300, at: .05, type: 'triangle'}); burst(.12, 'highpass', 3000, 6000, .05, .8, sfxBus, .05); break;
    case 'lost': sfx('his'); tone(700, .2, {gain: .07, to: 280, at: .05, type: 'triangle'}); break;
    case 'crown': [784, 988, 1319].forEach((f, i) => tone(f, .22, {gain: .08, at: i * .07, type: 'triangle'})); break;
    case 'check': tone(1320, .35, {gain: .07}); tone(1980, .3, {gain: .03, at: .01}); break;
    case 'win': [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .35, {gain: .09, at: i * .09, type: 'triangle'})); burst(.6, 'highpass', 4000, 9000, .03, .7, sfxBus, .3); break;
    case 'lose': [392, 349, 311, 262].forEach((f, i) => tone(f, .32, {gain: .07, at: i * .14, type: 'triangle'})); break;
    case 'nope': tone(220, .12, {gain: .06, type: 'square', to: 180}); break;
  }
}

/* ---------------- a gentle tune while you play ---------------- */
let musicTimer = null, musicStep = 0;
const SCALE = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
export function music(play) {
  clearTimeout(musicTimer); musicTimer = null;
  if (ambBus && ctx) ambBus.gain.setTargetAtTime(play ? .45 : .9, ctx.currentTime, .6);   // the field steps back while you play
  if (!play) return;
  let note = 4;
  const beat = 60 / 88;
  (function next() {
    if (live()) {
      const t = ctx.currentTime;
      if (musicStep % 4 === 0) { const root = [130.8, 98, 110, 87.3][(musicStep / 4 | 0) % 4]; tone(root, beat * 3.6, {gain: .1, bus: musicBus, attack: .03}); tone(root * 1.5, beat * 3.2, {gain: .04, bus: musicBus, attack: .05}); }
      if (Math.random() < .78) {                                // a marimba-ish pluck on a pentatonic random walk
        note = Math.max(0, Math.min(SCALE.length - 1, note + [-2, -1, -1, 0, 1, 1, 2][Math.random() * 7 | 0]));
        const f = SCALE[note]; tone(f, .5, {gain: .07, bus: musicBus}); tone(f * 4, .12, {gain: .012, bus: musicBus});
      }
      musicStep++;
    }
    musicTimer = setTimeout(next, beat * 1000 / 2);
  })();
}

/* ---------------- the field ---------------- */
let nextCricket = 0, nextBird = 0, nextFrog = 0, stepPhase = 0;
export function field(dt, {wind = 6, gust = 10, night = 0, day = 1, water = 0, pole = 0, walking = 0, inWater = false}) {
  if (!live() || !started) return;
  const t = ctx.currentTime, lvl = Math.min(1, (wind + (gust - wind) * .5 * (1 + Math.sin(t * .37) * Math.sin(t * .13))) / 24);
  beds.wind.g.gain.setTargetAtTime(.04 + lvl * .26, t, .5);
  beds.wind.f.frequency.setTargetAtTime(260 + lvl * 520 + Math.sin(t * .5) * 60, t, .6);
  beds.water.g.gain.setTargetAtTime(water * (.06 + .04 * Math.sin(t * .9) + .025 * Math.sin(t * 2.3)), t, .4);
  beds.water.f.frequency.setTargetAtTime(380 + 200 * Math.sin(t * .7), t, .3);
  beds.hum.g.gain.setTargetAtTime(.004 * pole, t, .5);
  const now = performance.now() / 1000;
  if (night > .3 && now > nextCricket) {                         // crickets: little trills, never quite in step
    nextCricket = now + .35 + Math.random() * 1.1;
    const f = 4200 + Math.random() * 900, n = 3 + (Math.random() * 3 | 0), g = .02 * night * (.6 + Math.random() * .6);
    for (let i = 0; i < n; i++) tone(f, .025, {gain: g, at: i * .045, bus: ambBus});
  }
  if (night > .3 && water > .2 && now > nextFrog) {             // the odd frog by the water
    nextFrog = now + 5 + Math.random() * 12;
    for (let i = 0; i < 2; i++) { tone(180, .14, {gain: .05 * water, at: i * .18, to: 120, type: 'triangle', bus: ambBus}); burst(.12, 'bandpass', 500, 300, .02 * water, 4, ambBus, i * .18); }
  }
  if (day > .5 && now > nextBird) {                             // a bird somewhere over the field
    nextBird = now + 4 + Math.random() * 9;
    const base = 2200 + Math.random() * 1600, n = 2 + (Math.random() * 4 | 0);
    for (let i = 0; i < n; i++) tone(base * (1 + Math.random() * .2), .09, {gain: .018 * day, at: i * .12, to: base * (1.3 + Math.random() * .4), bus: ambBus});
  }
  if (walking > .1) {                                           // soft steps in dry grass (or a splash in the shallows)
    stepPhase += dt * (1.6 + walking * 1.2);
    if (stepPhase >= 1) { stepPhase = 0; inWater ? burst(.16, 'bandpass', 1400, 600, .05, .8, ambBus) : burst(.09, 'bandpass', 2600 + Math.random() * 900, 1400, .045 * Math.min(1, walking), 1.4, ambBus); }
  }
}

/* ---------------- his instruments ---------------- */
const NOTE_HZ = {C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66};
export function playTune(song, volume = .35) {
  const ac = ensure(); if (!ac || !on) return 0;
  const beat = .34, inst = song.instrument || 'ocarina'; let t = ac.currentTime + .05;
  const out = ac.createGain(); out.gain.value = volume; out.connect(master);
  for (const [n, beats] of song.notes || []) {
    const d = beat * beats;
    if (n !== 'rest' && NOTE_HZ[n]) {
      const f = NOTE_HZ[n] * (inst === 'harmonica' ? .5 : 1), o = ac.createOscillator(), g = ac.createGain();
      o.type = inst === 'harmonica' ? 'sawtooth' : inst === 'tin_whistle' ? 'triangle' : 'sine';
      o.frequency.value = f;
      if (inst === 'ocarina' || inst === 'tin_whistle') { const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 5.2; lg.gain.value = f * .006; lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t + d + .1); }
      const plucked = inst === 'thumb_piano' || inst === 'toy_xylophone';
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(plucked ? .9 : .55, t + (plucked ? .005 : .05));
      if (plucked) g.gain.exponentialRampToValueAtTime(.001, t + Math.max(.25, d * 1.3)); else { g.gain.setValueAtTime(.5, t + d * .8); g.gain.linearRampToValueAtTime(0, t + d); }
      let node = o; if (inst === 'harmonica') { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; o.connect(lp); node = lp; }
      node.connect(g).connect(out); o.start(t); o.stop(t + d + .4);
    }
    t += d;
  }
  return t - ac.currentTime;
}
