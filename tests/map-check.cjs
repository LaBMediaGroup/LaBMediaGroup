// Explore boots from the shared map: no errors, no stand spot needs nudging, Labcoon never on wet ground (25 s at 4x).
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu']});
  const p = await b.newPage({viewport: {width: 900, height: 600}}); const msgs = [];
  p.on('pageerror', e => msgs.push('ERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' || /moved/.test(m.text())) msgs.push(m.type() + ' ' + m.text().slice(0, 200)); });
  await p.goto('http://127.0.0.1:5430/explore.html?at=14:40&speed=4', {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  const seen = new Set(); let wet = 0;
  for (let i = 0; i < 25; i++) {
    await p.waitForTimeout(1000);
    seen.add(await p.evaluate(() => document.getElementById('labcoonDoing').textContent));
    const w = await p.evaluate(() => { const c = LabExplore.coon; return LabExplore.world.ground(c.pos.x, c.pos.z) < -.03 && !c.swimming ? [+c.pos.x.toFixed(2), +c.pos.z.toFixed(2), c.task?.type, +LabExplore.world.ground(c.pos.x, c.pos.z).toFixed(3)] : null; });
    if (w) { wet++; msgs.push('wet ' + JSON.stringify(w)); }
  }
  console.log(JSON.stringify({msgs, journal: [...seen].slice(0, 8), wetSamples: wet, perf: await p.evaluate(() => LabExplore.perf)}, null, 1)); await b.close();
  process.exit(msgs.some(m => m.startsWith('ERR') || m.startsWith('error')) || wet ? 1 : 0);
})();
