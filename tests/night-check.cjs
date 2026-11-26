// Watch Labcoon's replayed night at 4x: log journal lines and tasks, snapshot the follow view.
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport: {width: 960, height: 600}}); const errors = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  await p.goto('http://127.0.0.1:5430/explore.html?at=14:40&speed=4', {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.evaluate(() => LabExplore.follow());
  const log = []; let last = '';
  for (let i = 0; i < 90; i++) {
    await p.waitForTimeout(1000);
    const s = await p.evaluate(() => ({j: document.getElementById('labcoonDoing').textContent, task: LabExplore.coon.task?.type + ':' + (LabExplore.coon.task?.name || ''), clip: LabExplore.coon.clip, swim: LabExplore.coon.swimming,
      pos: LabExplore.coon.pos.toArray().map(v => +v.toFixed(2)), wet: LabExplore.world.ground(LabExplore.coon.pos.x, LabExplore.coon.pos.z) < 0}));
    const line = `${i}s ${s.task} ${s.clip} ${s.swim ? 'SWIM' : ''} ${s.wet && !s.swim ? 'WET!' : ''} ${s.pos} | ${s.j}`;
    if (s.j !== last || i % 5 === 0) log.push(line); last = s.j;
    if (i % 6 === 0) await p.screenshot({path: path.join(out, `night_${String(i).padStart(2, '0')}.png`)});
  }
  console.log(log.join('\n')); console.log(JSON.stringify(errors)); await b.close();
})();
