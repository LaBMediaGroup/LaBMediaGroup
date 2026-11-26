// What a visitor sees: Explore from a non-owner address (not 127.0.0.1:5430) on a 390 px phone, in live mode.
// No owner notebook, no private reader. Lists every request so anything aimed at the Mac's loopback shows up.
// node tests/visitor-phone.cjs <outdir> [page base] [service base]
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
const base = process.argv[3] || 'http://192.168.1.38:5431', svc = process.argv[4] || 'http://127.0.0.1:8788/api/labcoon';
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
  const errors = [], hosts = {}, private5437 = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  const bad = []; p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
  p.on('request', r => { const u = new URL(r.url()); hosts[u.host] = (hosts[u.host] || 0) + 1; if (u.port === '5437') private5437.push(r.url()); });
  const t0 = Date.now();
  await p.goto(svc === "default" ? `${base}/explore.html` : `${base}/explore.html?live=${encodeURIComponent(svc)}`, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 90000});
  const ready = Date.now() - t0;
  await p.waitForTimeout(4000);
  await p.screenshot({path: path.join(out, 'v1_field.png')});
  const tx = async sel => (await p.locator(sel).first().textContent().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 300);
  const report = {ready_ms: ready, status: await tx('#statusPill'), now: await tx('.nowcard')};
  await p.click('#thingsBtn'); await p.waitForTimeout(500);
  for (const tab of ['art', 'songs', 'games', 'journal', 'map']) {
    await p.click(`#thingsSheet [data-tab=${tab}]`); await p.waitForTimeout(700);
    await p.screenshot({path: path.join(out, `v2_${tab}.png`)});
    report[tab] = await tx(`#thingsSheet [data-pane=${tab}]`);
  }
  report.ownerNotebookVisible = await p.locator('#ownerWriting').isVisible().catch(() => false);
  await p.locator('#scrim').click({position: {x: 195, y: 40}}).catch(() => {}); await p.waitForTimeout(500);
  report.sheetClosedByScrim = !(await p.locator('#scrim.on').count());
  if (await p.locator('#lcChip').isVisible().catch(() => false)) await p.click('#lcChip');
  else await p.click('.nowcard').catch(() => {});
  await p.waitForTimeout(600);
  await p.screenshot({path: path.join(out, 'v3_labcoon_sheet.png')});
  report.card = await tx('.nowcard');
  await p.locator('#scrim').click({position: {x: 195, y: 40}}).catch(() => {}); await p.waitForTimeout(400);
  await p.getByText('Leave him something').click(); await p.waitForTimeout(600);
  report.sheetTabs = await p.locator('#lcSheet [role=tab]').allTextContents().catch(() => []);
  for (const tab of ['hi', 'note', 'doodle', 'swap', 'yours']) {
    const t = p.locator(`#lcSheet [data-tab=${tab}]`);
    if (await t.count() && await t.isVisible()) { await t.click(); await p.waitForTimeout(500); await p.screenshot({path: path.join(out, `v4_${tab}.png`)}); report[tab] = await tx(`#lcSheet [data-pane=${tab}]`); }
  }
  report.fps = await p.evaluate(() => new Promise(r => { let n = 0; const t = performance.now(); (function f() { n++; if (performance.now() - t < 3000) requestAnimationFrame(f); else r(Math.round(n / 3)); })(); }));
  console.log(JSON.stringify({...report, hosts, private5437, bad, errors}, null, 1));
  await b.close();
})();
