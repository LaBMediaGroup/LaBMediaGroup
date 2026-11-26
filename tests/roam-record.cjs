// Record a short walk: start view, walk to the bank, tap to follow Labcoon. node tests/roam-record.cjs <outdir>
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
(async () => {
  const browser = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
    args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']});
  const ctx = await browser.newContext({viewport: {width: 1280, height: 720}, recordVideo: {dir: out, size: {width: 1280, height: 720}}});
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5430/explore.html?at=15:10&speed=2', {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await page.evaluate(() => { const m = LabExplore.me; m.pos.set(-1.2, 0, 7.5); m.yaw = -.15; m.pitch = -.12; });
  await page.waitForTimeout(1500);
  await page.keyboard.down('w'); await page.waitForTimeout(3200); await page.keyboard.up('w');
  await page.mouse.move(640, 360); await page.mouse.down(); await page.mouse.move(520, 380, {steps: 30}); await page.mouse.up();
  await page.waitForTimeout(1500);
  await page.evaluate(() => LabExplore.follow());
  await page.waitForTimeout(12000);
  await page.close(); await ctx.close(); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
