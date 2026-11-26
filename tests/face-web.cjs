// Close look at Labcoon's face in Explore (front three-quarter, daylight). node tests/face-web.cjs <out.png>
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu']});
  const p = await b.newPage({viewport: {width: 800, height: 800}});
  await p.goto('http://127.0.0.1:5430/explore.html?at=13:00&speed=.25', {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.evaluate(() => { LabExplore.follow(); });
  await p.waitForTimeout(600);
  await p.evaluate(() => { const f = LabExplore; f.coon.queue = [{type: 'idle', secs: 60}]; f.coon.task = null; });
  await p.waitForTimeout(400);
  await p.click('#lcChip').catch(() => {});
  for (const [k, off] of [-1.6, -.8, 0, .8].entries()) {
    for (let i = 0; i < 16; i++) {
      await p.evaluate(off => { const L = LabExplore, c = L.followCam; c.dist = .6; c.h = .14; c.hold = 1e12; L.coon.queue = [{type: 'idle', secs: 99}]; c.yaw = L.coon.yaw + off; }, off);
      await p.waitForTimeout(70);
    }
    await p.waitForTimeout(500); await p.screenshot({path: process.argv[2].replace('.png', `_${k}.png`)});
  }
  await p.screenshot({path: process.argv[2]}); await b.close();
})();
