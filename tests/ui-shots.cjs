// Game UI screenshots: main view, both sheets and their tabs, on desktop and phone. node tests/ui-shots.cjs <outdir> [query]
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true}); const q = process.argv[3] || 'at=20:30';
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu']});
  const errors = [];
  for (const [name, opts] of [['desktop', {viewport: {width: 1366, height: 850}}], ['phone', {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2}]]) {
    const p = await b.newPage(opts);
    p.on('pageerror', e => errors.push(name + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(name + ': ' + m.text().slice(0, 160)); });
    await p.goto('http://127.0.0.1:5430/explore.html?' + q, {waitUntil: 'domcontentloaded'});
    await p.waitForTimeout(1200); await p.screenshot({path: path.join(out, name + '_0_loading.png')});
    await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
    await p.waitForTimeout(3500); await p.screenshot({path: path.join(out, name + '_1_main.png')});
    if (name === 'phone') { await p.click('#lcChip'); await p.waitForTimeout(400); await p.screenshot({path: path.join(out, name + '_1b_now.png')}); await p.click('#nowClose'); }
    await p.click('#leaveBtn'); await p.waitForTimeout(600); await p.screenshot({path: path.join(out, name + '_2_leave.png')});
    await p.click('#lcSheet [data-tab=doodle]'); await p.waitForTimeout(300);
    const pad = await p.$('#doodlePad'), bb = await pad.boundingBox();
    await p.mouse.move(bb.x + 30, bb.y + 40); await p.mouse.down(); for (let i = 0; i < 20; i++) await p.mouse.move(bb.x + 30 + i * 6, bb.y + 40 + Math.sin(i / 2) * 30); await p.mouse.up();
    await p.screenshot({path: path.join(out, name + '_3_doodle.png')});
    await p.click('#lcSheet [data-close]'); await p.waitForTimeout(400);
    await p.click('#thingsBtn'); await p.waitForTimeout(1500); await p.screenshot({path: path.join(out, name + '_4_art.png')});
    await p.click('#thingsSheet [data-tab=songs]'); await p.waitForTimeout(800); await p.screenshot({path: path.join(out, name + '_5_songs.png')});
    await p.click('#thingsSheet [data-tab=map]'); await p.waitForTimeout(500); await p.screenshot({path: path.join(out, name + '_6_map.png')});
    await p.close();
  }
  console.log(JSON.stringify(errors)); await b.close();
})();
