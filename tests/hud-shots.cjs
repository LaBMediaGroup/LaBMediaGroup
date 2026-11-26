// HUD screenshots: desktop and phone, card, map, Labcoon sheet + say hi. node tests/hud-shots.cjs <outdir>
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']});
  const report = {};
  for (const [name, opts] of [['desktop', {viewport: {width: 1366, height: 850}}], ['phone', {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2}]]) {
    const p = await b.newPage(opts); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    await p.goto('http://127.0.0.1:5430/explore.html?at=15:00', {waitUntil: 'domcontentloaded'});
    await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
    await p.waitForTimeout(3000);
    if (name === 'phone') { await p.tap('#lcChip'); await p.waitForTimeout(500); }
    await p.screenshot({path: path.join(out, name + '_hud.png')});
    await p.click('#mapBtn'); await p.waitForTimeout(700); await p.screenshot({path: path.join(out, name + '_map.png')});
    await p.click('#mapList button:first-child'); await p.waitForTimeout(1800);
    if (name === 'phone') { await p.tap('#lcChip'); await p.waitForTimeout(300); }
    await p.screenshot({path: path.join(out, name + '_takeme.png')});
    // tap Labcoon via the same code path as a real tap
    const pt = await p.evaluate(() => { const v = LabExplore.coon.pos.clone(); v.y += .16; v.project(LabExplore.world.camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]; });
    await p.evaluate(([x, y]) => LabExplore.tapAt(x, y), pt); await p.waitForTimeout(600);
    const sheet = await p.evaluate(() => !document.getElementById('lcSheet').hidden && document.getElementById('sheetText').textContent);
    if (sheet && await p.evaluate(() => !document.getElementById('hiForm').hidden)) { await p.fill('#hiInput', 'hi labcoon'); await p.click('#hiForm button'); await p.waitForTimeout(800); }
    await p.screenshot({path: path.join(out, name + '_hi.png')});
    report[name] = {errors, sheet, bubble: await p.evaluate(() => !document.getElementById('lcBubble').hidden && document.getElementById('lcBubble').textContent)};
    await p.close();
  }
  console.log(JSON.stringify(report, null, 1)); await b.close();
})();
