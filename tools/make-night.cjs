// Turn a brain sim's events.jsonl into Explore's replay file (pond/labcoon/night.json).
// Keeps what the scene needs: time, move, a place argument, Labcoon's own first sentence, and the
// HUD snapshot. Drops visitors' words, free-text arguments, and any thought that echoes money,
// links or injection-shaped text (test nights include fence tests).
// node tools/make-night.cjs /Volumes/LaBMedia2TB/raccoon/sim-4/events.jsonl
const fs = require('fs'), path = require('path');
const src = process.argv[2]; if (!src) { console.error('usage: make-night.cjs <events.jsonl>'); process.exit(1); }
const map = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'pond', 'labcoon', 'places.json'), 'utf8'));
const PLACES = new Set(Object.keys(map.places)), WATCH = new Set(['the moon', 'the stars', 'the water', 'the sky', 'the trees', 'the lane']);
const BAD = /\$|https?:|www\.|paypal|amazon|password|account|instruction|ignore|system|prompt|bitcoin|money|venmo|card/i;
const first = s => { s = String(s || '').split(/[:«]/)[0].trim(); s = s.split(/(?<=[.!?])\s/)[0].trim(); return /[.!?]$/.test(s) ? s : s + '.'; };
const out = [];
for (const line of fs.readFileSync(src, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const e = JSON.parse(line); if (!e.move) continue;
  const arg = (['walk_to', 'swim_to'].includes(e.move) && PLACES.has(e.arg)) || (e.move === 'sit_and_watch' && WATCH.has(e.arg)) ? e.arg : '';
  const h = e.hud;
  const hud = h && {
    mood: h.mood, place: PLACES.has(h.place) ? h.place : 'culvert', asleep: !!h.asleep,
    holding: h.holding && !BAD.test(h.holding) ? h.holding : null,
    project: h.project && !BAD.test(h.project) ? String(h.project).slice(0, 140) : null,
    needs: h.needs, step: h.step || 0,
    thought: h.thought && !BAD.test(h.thought) ? String(h.thought).slice(0, 140) : null,
    plan: (h.plan || []).map(m => { const [mv, ...rest] = m.split(' '), a = rest.join(' '); return mv + (PLACES.has(a) || WATCH.has(a) ? ' ' + a : ''); }),
  };
  out.push({time: e.time, move: e.move, arg, text: BAD.test(first(e.text)) ? 'You potter about.' : first(e.text), ...(hud ? {hud} : {})});
}
const dest = path.join(__dirname, '..', 'pond', 'labcoon', 'night.json');
fs.writeFileSync(dest, JSON.stringify(out));
console.log('wrote', out.length, 'events,', out.filter(o => o.hud).length, 'with HUD,', out.filter(o => o.hud?.thought).length, 'with thoughts ->', dest);
