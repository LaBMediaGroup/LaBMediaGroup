/* Labcoon's public state for the homepage mockups.
   Live: GET https://labcoon-api.labmedia.work/api/labcoon/state (CORS allows only https://labmedia.work).
   Anywhere else (local prototypes), or if the service is down, it reads sample-state.json, a saved copy.
   Preview overrides: ?coon=asleep | ?coon=awake.

   window.LabcoonLive.get()       -> Promise<now>
   window.LabcoonLive.watch(fn)   -> calls fn(now) at once and every 60 s
   now = {awake, asleep, place, where, mood, doing, said, time, holding, needs, plan, step, source} */
(() => {
  const API = 'https://labcoon-api.labmedia.work/api/labcoon/state';
  const here = document.currentScript?.src || location.href;
  const SAMPLE = new URL('sample-state.json', here).href;
  const force = new URLSearchParams(location.search).get('coon');
  const onSite = /(^|\.)labmedia\.work$/.test(location.hostname);

  const PLACE = {
    culvert: 'his culvert', washing_rock: 'the washing rock', cattails: 'the cattails', oak: 'the big oak',
    pond_middle: 'the middle of the pond', pond_floor: 'the pond floor', trash_can: 'the trash can',
    mailbox: 'the mailbox', art_shed: 'his art shed', farm_lane: 'the farm lane', picnic_table: 'the picnic table',
    bird_feeder: 'the bird feeder', drone_course: 'the drone course', corn: 'the corn', rail_line: 'the rail line'
  };
  // His journal is second person ("You amble to the cattails."); the homepage says it about him.
  const verb = v => /(s|sh|ch|x|z)$/.test(v) ? v + 'es' : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + 'ies' : v === 'have' ? 'has' : v + 's';
  function third(text) {
    let s = String(text || '').split(/(?<=[.!?])\s/)[0].replace(/\.$/, '');
    if (!/^You\b/.test(s)) return s.charAt(0).toLowerCase() + s.slice(1);
    s = s.replace(/^You (\w+)/, (_, v) => verb(v)).replace(/(,? and )(\w+)/, (m, a, v) => /^(the|a|an|his|your|it)$/.test(v) ? m : a + verb(v));
    return s.replace(/\byourself\b/g, 'himself').replace(/\byour\b/g, 'his').replace(/\byou\b/g, 'him');
  }

  function shape(s, source) {
    const h = s.state?.hud || {}, asleep = !!s.asleep, last = (s.events || []).filter(e => e.text).slice(-1)[0];
    const place = h.place || (asleep ? 'culvert' : 'culvert');
    return {
      awake: !asleep, asleep, stale: !!s.stale, source,
      place, where: PLACE[place] || place.replace(/_/g, ' '),
      mood: h.mood || (asleep ? 'sleepy' : 'content'),
      doing: last ? third(last.text) : asleep ? 'is curled up asleep' : 'is pottering about',
      said: last?.text || '', time: last?.time || '',
      holding: h.holding || null, needs: h.needs || {}, plan: h.plan || [], step: h.step || 0,
      events: (s.events || []).slice(-6).map(e => ({time: e.time, text: third(e.text)}))
    };
  }

  async function sample() {
    const j = await (await fetch(SAMPLE)).json();
    const pick = force === 'asleep' ? j.asleep : force === 'awake' ? j.awake : (new Date().getHours() >= 6 && new Date().getHours() < 17 ? j.asleep : j.awake);
    return shape(pick, 'sample');
  }
  async function get() {
    if (onSite && !force) {
      try { const r = await fetch(API, {cache: 'no-store'}); if (r.ok) return shape(await r.json(), 'live'); } catch {}
    }
    return sample();
  }
  function watch(fn) {
    const tick = () => get().then(fn).catch(() => {});
    tick(); return setInterval(() => { if (!document.hidden) tick(); }, 60000);
  }
  window.LabcoonLive = {get, watch, third, PLACE};
})();
