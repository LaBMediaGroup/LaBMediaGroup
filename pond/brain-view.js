/* His brain: the loop Labcoon actually runs, shown live. Six stages, each with his real, public data:
   what he senses, how he feels, what's on his mind, his plan, what his body does, what he keeps.
   A pulse travels round the loop; the stage that just changed glows. Everything here is already public
   (his HUD, his public journal, the live field); nothing private is fetched.
   brainView(host, {get, api, places}) → {refresh(), close()} */
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
const NEEDS = [['hunger', 'Full'], ['energy', 'Energy'], ['joy', 'Joy'], ['boredom', 'Boredom'], ['curiosity', 'Curiosity']];
const STAGES = [
  ['senses', 'What he senses', 'Every few minutes he takes in the moment: the clock, the real weather at the pond, where he is, what’s lying nearby, and any visitors.'],
  ['feels', 'How he feels', 'Five needs drift as time passes and change with everything he does. Together they set his mood.'],
  ['mind', 'What’s on his mind', 'An AI model reads the moment, his character sheet and his memories, then thinks in his voice and picks from moves he can really do right there.'],
  ['plan', 'His plan', 'One to three moves, in order. He can change his mind when something happens.'],
  ['body', 'What his body does', 'Each move plays out in the field: walking, washing, swimming, drawing. What happens comes back to him as news.'],
  ['keeps', 'What he keeps', 'Thoughts, field notes, art and songs. Every late morning he sleeps, writes his nightly entry, keeps some memories, lets some fade, and updates his character sheet.'],
];
export function brainView(host, {get, api, places}) {
  let writing = null, last = {}, timer = null, glowAt = {};
  host.innerHTML = `<p class="brain-lede">This is the loop he runs, all day and night. Watch it light up as he goes.</p>
    <div class="brain-loop">${STAGES.map(([k, t, d], i) => `<section class="brain-stage" data-stage="${k}"><span class="num">${i + 1}</span><h4>${t}</h4><div class="live"></div><p class="how">${d}</p></section>`).join('')}
    <div class="brain-back" aria-hidden="true">↺ and round again</div></div>`;
  const live = k => host.querySelector(`[data-stage="${k}"] .live`);
  const place = p => places[p]?.label || (p || '').replace(/_/g, ' ');
  function paint() {
    const {hud: h = {}, weather: w, nearby = [], clock = '', lastEvent = ''} = get();
    const sky = w ? [w.kind, Number.isFinite(w.wind) && w.wind + ' mph wind', Number.isFinite(w.temp) && Math.round(w.temp) + '°F'].filter(Boolean).join(', ') : 'the sky over the pond';
    const sig = {
      senses: [clock, sky, h.place, nearby.join()].join('|'), feels: JSON.stringify(h.needs || {}) + h.mood,
      mind: writing?.thoughts?.at(-1)?.text || '', plan: JSON.stringify(h.plan || []) + h.step, body: lastEvent, keeps: writing ? [writing.thoughts.length, writing.notes.length, writing.nights.length, writing.searches.length].join() : '',
    };
    for (const k in sig) if (last[k] !== undefined && last[k] !== sig[k]) glowAt[k] = performance.now();
    last = sig;
    live('senses').innerHTML = `<p><b>${esc(clock || 'Now')}</b> · ${esc(sky)}</p><p>${h.asleep ? 'Asleep' : 'At'} ${esc(place(h.place) || 'the pond')}${h.holding ? `, holding a ${esc(h.holding)}` : ''}.</p>${nearby.length ? `<p>Nearby: ${esc(nearby.slice(0, 4).join(', '))}.</p>` : ''}`;
    live('feels').innerHTML = `<div class="mini-needs">${NEEDS.map(([k, l]) => { const v = h.needs?.[k]; const pct = Number.isFinite(v) ? Math.round((k === 'hunger' ? 1 - v : v) * 100) : 0;
      return `<span style="--c:var(--${k})"><em>${l}</em><i><b style="width:${pct}%"></b></i></span>`; }).join('')}</div><p>Mood: <b>${esc(h.asleep ? 'asleep' : h.mood || 'content')}</b></p>`;
    const t = writing?.thoughts?.at(-1);
    live('mind').innerHTML = t ? `<blockquote>“${esc(t.text)}”</blockquote><small>${esc(t.stamp || '')}</small>` : `<p>${h.asleep ? 'Dreaming. No thoughts to show.' : 'Listening for his next thought…'}</p>`;
    const plan = h.plan || [];
    live('plan').innerHTML = plan.length ? `<ol>${plan.map((m, i) => `<li class="${i < h.step ? 'done' : i === h.step ? 'now' : ''}">${esc(m.replace(/_/g, ' '))}</li>`).join('')}</ol>` : `<p>${h.asleep ? 'Nothing planned while he sleeps.' : 'Deciding what to do next.'}</p>`;
    live('body').innerHTML = `<p>${esc(lastEvent || 'Waiting for his next move.')}</p>`;
    live('keeps').innerHTML = writing ? `<p><b>${writing.thoughts.length}</b> thoughts · <b>${writing.notes.length}</b> field notes · <b>${writing.nights.length}</b> nightly entries · <b>${writing.searches.length}</b> searches</p>` : '<p>Opening his notebook…</p>';
    const now = performance.now();
    for (const [k] of STAGES) host.querySelector(`[data-stage="${k}"]`).classList.toggle('glow', now - (glowAt[k] || -1e9) < 2600);
  }
  async function refresh() {
    if (api) try { writing = await api('/writing'); } catch {}
    paint();
  }
  // the pulse: one stage after another, about two seconds each, round and round
  let step = 0;
  function pulse() { host.querySelectorAll('.brain-stage').forEach((s, i) => s.classList.toggle('pulse', i === step)); step = (step + 1) % STAGES.length; }
  pulse(); paint(); refresh();
  const open = () => !host.closest('.sheet')?.hidden;          // only work while the sheet is showing
  timer = setInterval(() => { if (open()) { pulse(); paint(); } }, 1900);
  const slow = setInterval(() => { if (open()) refresh(); }, 30000);
  return {refresh, paint, close() { clearInterval(timer); clearInterval(slow); }};
}
