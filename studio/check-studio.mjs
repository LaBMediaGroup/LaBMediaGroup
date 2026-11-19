// Prototype check: node studio/check-studio.mjs [chromium|webkit] [outdir]
// Uses an existing Playwright install (PW_DIR) so nothing new is installed.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium, webkit } = require((process.env.PW_DIR || '/Volumes/LaB Media/GitHub/lab-crew-room') + '/node_modules/playwright');
const engine = process.argv[2] || 'chromium', out = process.argv[3] || '/tmp/studio-check';
fs.mkdirSync(out, { recursive: true });
const base = process.env.BASE || 'http://127.0.0.1:8765/studio/';
// reuse browsers already on the Mac: Google Chrome, and the WebKit build in the Playwright cache
const browser = engine === 'webkit'
  ? await webkit.launch({ executablePath: process.env.WEBKIT_PATH || `${process.env.HOME}/Library/Caches/ms-playwright/webkit-2359/pw_run.sh` })
  : await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const report = [];
const sizes = (process.env.SIZES || 'desk,phone').split(',');
for (const size of sizes) {
  const phone = size === 'phone';
  const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: engine !== 'webkit' ? true : undefined } : { viewport: { width: 1366, height: 800 } });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  const shot = async name => page.screenshot({ path: `${out}/${engine}-${size}-${name}.png` });
  await page.goto(base + '?date=2026-11-18&minute=955#window');
  await page.waitForSelector('body[data-ready="1"]', { timeout: 30000 });
  await page.waitForTimeout(800); await shot('1-window');
  const minute0 = await page.$eval('#scrub', e => e.value);
  await page.click('#windowDock [data-go="events"]');
  await page.waitForTimeout(400); await shot('2-turning');
  await page.waitForFunction(() => document.body.dataset.view !== 'window', null, { timeout: 8000 });
  await page.waitForTimeout(500); await shot('3-events');
  const url1 = page.url();
  // drag back toward the window, PAUSE mid-drag (Safari bug check), then let go
  const W = phone ? 390 : 1366, H = phone ? 844 : 800, y = phone ? 120 : 140;
  await page.mouse.move(W * .2, y); await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(W * .2 + i * W * .03, y, { steps: 2 });
  await page.waitForTimeout(900); await shot('4-drag-paused');
  const overlay = await page.evaluate(() => [...document.querySelectorAll('img')].filter(i => { const r = i.getBoundingClientRect(); return r.width > 120 && getComputedStyle(i).visibility !== 'hidden' && !i.closest('dialog'); }).map(i => i.src));
  for (let i = 13; i <= 30; i++) await page.mouse.move(W * .2 + i * W * .03, y, { steps: 2 });
  await page.mouse.up();
  await page.waitForTimeout(phone ? 2600 : 2200);
  const view2 = await page.evaluate(() => document.body.dataset.view);
  const minute2 = await page.$eval('#scrub', e => e.value);
  await shot('5-back');
  // straight back to events by button, then lift the flyer
  await page.click('#windowDock [data-go="events"]');
  await page.waitForFunction(() => document.body.dataset.view !== 'window');
  if (phone) { await page.waitForTimeout(300); await page.click('#toBoard'); await page.waitForFunction(() => document.body.dataset.view === 'board'); }
  await page.waitForTimeout(500);
  await page.click('#flyerHit'); await page.waitForTimeout(250); await shot('6-lifting'); await page.waitForTimeout(700); await shot('7-flyer');
  const dialogOpen = await page.$eval('#flyerDialog', d => d.open);
  await page.click('#flyerClose'); await page.waitForTimeout(700);
  // on to the fridge: yank the door, make sure the idea changes and the words land
  await page.click('#toFridge');
  await page.waitForFunction(() => document.body.dataset.view === 'fridge', null, { timeout: 8000 });
  await page.waitForTimeout(500); await shot('7b-fridge');
  const idea1 = await page.$eval('#ideaConcept', e => e.textContent);
  await page.click('#shuffle'); await page.waitForTimeout(560); await shot('7c-slam'); await page.waitForTimeout(1600); await shot('7d-new-words');
  const idea2 = await page.$eval('#ideaConcept', e => e.textContent);
  await page.selectOption('#tone', 'comedy'); await page.waitForTimeout(2200);
  // and the projector: the reel should be rolling, then switch films
  await page.click('#fridgeDock .next');
  await page.waitForFunction(() => document.body.dataset.view === 'projector', null, { timeout: 8000 });
  await page.waitForTimeout(600); await shot('7e0-shade-coming');
  await page.waitForFunction(() => document.body.dataset.cinema === 'on', null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(400); await shot('7e-screening');
  const rolling = await page.$eval('#film', v => !v.paused && v.readyState >= 2);
  const cinemaOn = await page.evaluate(() => document.body.dataset.cinema);
  const filmFill = await page.$eval('#film', v => +(v.getBoundingClientRect().width / innerWidth).toFixed(2));
  await page.click('.reel[data-film="brass"]'); await page.waitForTimeout(1200); await shot('7f-brass');
  const film2 = await page.$eval('#film', v => v.currentSrc.split('/').pop());
  await page.click('#playPause'); await page.waitForTimeout(2600); await shot('7g-paused-lights-up');
  const cinemaPaused = await page.evaluate(() => document.body.dataset.cinema);
  await page.click('#playPause');
  const pjURL = page.url();
  await page.click('#projectorDock .back'); await page.waitForFunction(() => document.body.dataset.view === 'fridge'); await page.waitForTimeout(300);
  const filmPausedAway = await page.$eval('#film', v => v.paused);
  // deep link straight to the wall, then plain view
  await page.goto(base + '?date=2026-11-18&minute=1010#events'); await page.waitForSelector('body[data-ready="1"]'); await page.waitForTimeout(800); await shot('8-deeplink-dusk');
  await page.click('#plainToggle'); await page.waitForTimeout(300); await shot('9-plain'); await page.screenshot({ path: `${out}/${engine}-${size}-9b-plain-full.png`, fullPage: true });
  const plainOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(200);
  await page.click('#plainToggle');
  report.push({ engine, size, minute0, minute2, sameTime: minute0 === minute2, view2, url1, bigImagesDuringPausedDrag: overlay, dialogOpen, ideaChanged: idea1 !== idea2, idea2, rolling, cinemaOn, filmFill, cinemaPaused, film2, filmPausedAway, pjURL, plainOverflow, errors });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
