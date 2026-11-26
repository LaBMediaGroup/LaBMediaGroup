// His gallery on a phone: the Art tab, the full-screen wall, a piece big, a swipe, and a sheet dragged up tall.
// node tests/gallery-shots.cjs <outdir> [page base] [query]
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
const base = process.argv[3] || 'http://127.0.0.1:5430', query = process.argv[4] || '';
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu']});
  const p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  await p.goto(base + '/explore.html' + query, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.waitForTimeout(1500);
  const r = {full: await p.locator('.need[data-k=hunger] span').textContent()};
  await p.click('#thingsBtn'); await p.waitForTimeout(1500);
  await p.screenshot({path: path.join(out, 'a1_art_tab.png')});
  r.wallButton = await p.locator('.gal-open').textContent().catch(() => null);
  await p.click('.gal-open'); await p.waitForTimeout(900);
  await p.screenshot({path: path.join(out, 'a2_wall.png')});
  r.cards = await p.locator('.gal-card').count();
  await p.locator('.gal-card').first().click(); await p.waitForTimeout(500);
  await p.screenshot({path: path.join(out, 'a3_big.png')});
  r.big1 = await p.locator('.gal-caption').textContent();
  const s = await p.locator('.gal-stage').boundingBox();
  await p.mouse.move(s.x + s.width * .8, s.y + s.height / 2); await p.mouse.down(); await p.mouse.move(s.x + s.width * .2, s.y + s.height / 2, {steps: 6}); await p.mouse.up(); await p.waitForTimeout(400);
  r.afterSwipe = await p.locator('.gal-caption').textContent();
  await p.click('[data-wall]'); await p.waitForTimeout(300); await p.click('[data-gal-close]'); await p.waitForTimeout(400);
  r.galleryClosed = !(await p.locator('.gallery').count());
  const g = await p.locator('#thingsSheet .grab').boundingBox();
  await p.mouse.move(g.x + g.width / 2, g.y + 2); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(g.x + g.width / 2, g.y + 2 - 15 * i); await p.waitForTimeout(25); } await p.mouse.up(); await p.waitForTimeout(500);
  r.tall = await p.locator('#thingsSheet').evaluate(e => e.classList.contains('tall') && Math.round(e.getBoundingClientRect().height));
  await p.click('#thingsSheet [data-tab=journal]'); await p.waitForTimeout(900);
  await p.screenshot({path: path.join(out, 'a4_tall_journal.png')});
  console.log(JSON.stringify({...r, errors}, null, 1));
  await b.close();
})();
