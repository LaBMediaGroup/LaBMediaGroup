// Explore in live mode against the local service + live brain: connects, places him, say hi gets his real reply.
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu']});
  const p = await b.newPage({viewport: {width: 900, height: 700}}); const errors = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 200)); });
  await p.goto('http://127.0.0.1:5430/explore.html?live=http://127.0.0.1:8788/api/labcoon', {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.waitForTimeout(2500);
  const s = await p.evaluate(() => ({live: LabExplore.live, journal: document.getElementById('labcoonDoing').textContent, place: LabExplore.coon.hud?.place, asleep: LabExplore.coon.hud?.asleep, pos: LabExplore.coon.pos.toArray().map(v => +v.toFixed(1))}));
  console.log('connected', JSON.stringify(s));
  // walk up to him and tap him; if he's asleep this wakes him over a few taps, if awake the say-hi sheet opens
  await p.evaluate(() => { const c = LabExplore.coon.pos, m = LabExplore.me; m.pos.set(c.x + 2, 0, c.z + 2); m.yaw = Math.atan2(-(c.x - m.pos.x), -(c.z - m.pos.z)); m.pitch = -.35; });
  await p.waitForTimeout(800);
  const tap = async () => { const pt = await p.evaluate(() => { const v = LabExplore.coon.pos.clone(); v.y += .16; v.project(LabExplore.world.camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]; }); await p.evaluate(([x, y]) => LabExplore.tapAt(x, y), pt); await p.waitForTimeout(700); };
  for (let i = 0; i < 4; i++) { await tap(); if (await p.evaluate(() => !document.getElementById('hiForm').hidden && !document.getElementById('lcSheet').hidden)) break; await p.waitForTimeout(4000); }
  const canTalk = await p.evaluate(() => !document.getElementById('hiForm').hidden && !document.getElementById('lcSheet').hidden);
  console.log('say-hi sheet open:', canTalk, '|', await p.evaluate(() => document.getElementById('sheetText').textContent));
  if (canTalk) {
    const t0 = Date.now(); await p.fill('#hiInput', 'hi labcoon! found anything shiny?'); await p.click('#hiForm button');
    await p.waitForFunction(() => { const b = document.getElementById('lcBubble'); return !b.hidden && b.textContent && b.textContent !== '…'; }, null, {timeout: 30000}).catch(() => {});
    console.log('reply after', ((Date.now() - t0) / 1000).toFixed(1) + 's:', await p.evaluate(() => document.getElementById('lcBubble').textContent));
  }
  await p.screenshot({path: process.argv[2] || '/tmp/live.png'});
  console.log('errors', JSON.stringify(errors)); await b.close();
})();
