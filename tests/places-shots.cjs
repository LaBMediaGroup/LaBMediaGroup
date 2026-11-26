// Close-ups of Labcoon's places and outward views. node tests/places-shots.cjs <outdir>
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
const VIEWS = [
  ['culvert', [8.6, -2.9], [4.6, -.2], -.32], ['washing_rock', [12.05, -8.35], [14.4, -6.6], -.38],
  ['art_shed', [-6.2, 1.4], [-5.3, -.9], -.25], ['trash_can', [-15.6, -0.6], [-13.4, .6], -.3],
  ['mailbox', [-16.0, 7.0], [-13.6, 8.2], -.12], ['picnic_bird', [-3, 4], [3.5, 5.5], -.1],
  ['corn_east', [30, -11], [12, -9], 0], ['corn_south', [-6, -40], [-2, -24], 0], ['lane_north', [-17.4, 30], [-16.2, 9], -.05],
  ['corn_west', [-36, -4], [-20, -6], 0],
];
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport: {width: 1100, height: 700}}); const errors = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  await p.goto('http://127.0.0.1:5430/explore.html?at=14:40', {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.waitForTimeout(2500);
  for (const [name, look, from, pitch] of VIEWS) {
    await p.evaluate(([look, from, pitch]) => { const m = LabExplore.me; m.pos.set(from[0], 0, from[1]); m.target = null;
      m.yaw = Math.atan2(-(look[0] - from[0]), -(look[1] - from[1])); m.pitch = pitch; }, [look, from, pitch]);
    await p.waitForTimeout(1300); await p.screenshot({path: path.join(out, name + '.png')});
  }
  console.log(JSON.stringify({errors, perf: await p.evaluate(() => LabExplore.perf)})); await b.close();
})();
