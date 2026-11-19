// Flat view check: node studio/check-flat.mjs [chromium|webkit] [outdir] [sizes]
// Reuses the Playwright install in lab-crew-room (nothing is installed). Screens every station, the shuffle
// mid-tumble, the lifted flyer and theatre mode; fails on console errors, sideways scroll, or lost URL state.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium, webkit } = require((process.env.PW_DIR || '/Volumes/LaB Media/GitHub/lab-crew-room') + '/node_modules/playwright');
const engine = process.argv[2] || 'chromium', out = process.argv[3] || '/tmp/flat-check';
const only = (process.argv[4] || 'phone,land,desk,narrow,quiet').split(',');
fs.mkdirSync(out, { recursive: true });
const base = process.env.BASE || 'http://127.0.0.1:8765/studio/';
const browser = engine === 'webkit'
  ? await webkit.launch({ executablePath: process.env.WEBKIT_PATH || `${process.env.HOME}/Library/Caches/ms-playwright/webkit-2359/pw_run.sh` })
  : await chromium.launch({ channel: 'chrome', headless: true });
const SIZES = {
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true },
  land: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true },
  desk: { viewport: { width: 1366, height: 800 } },
  narrow: { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, hasTouch: true },
  quiet: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, reducedMotion: 'reduce' },
};
const report = []; let failed = false;
const fail = msg => { failed = true; report.push('FAIL ' + msg); };
for (const size of only) {
  const ctx = await browser.newContext(SIZES[size]);
  await ctx.addInitScript(() => { try { localStorage.setItem('lab-studio-plain', '1'); } catch { } });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  const shot = async (name, full) => page.screenshot({ path: `${out}/${engine}-${size}-${name}.png`, fullPage: !!full });
  await page.goto(base + '?date=2026-11-18&minute=955&tone=comedy#window');
  await page.waitForSelector('#flat .st-window');
  await page.waitForTimeout(2200);
  await shot('1-window');
  const overflow = async where => { const o = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); if (o[0] > o[1] + 1) fail(`${size} ${where}: page is ${o[0]}px wide in a ${o[1]}px window`); };
  await overflow('window');
  // scrub to golden hour via the mark button and catch the sun travelling
  await page.click('.fx-marks-btn[data-phase="golden"]');
  await page.waitForTimeout(350); await shot('1b-sun-travelling');
  await page.waitForTimeout(1600); await page.locator('#fx-window .room').screenshot({ path: `${out}/${engine}-${size}-1c-golden-room.png` });
  const minute = await page.$eval('#fxScrub', e => e.value);
  // blue hour and night too
  await page.click('.fx-marks-btn[data-phase="blue"]'); await page.waitForTimeout(1900);
  await page.locator('#fx-window .room').screenshot({ path: `${out}/${engine}-${size}-1d-blue-room.png` });
  await page.$eval('#fxScrub', e => { e.value = String(+e.max - 5); e.dispatchEvent(new Event('input', { bubbles: true })); }); await page.waitForTimeout(100);
  await page.locator('#fx-window .room').screenshot({ path: `${out}/${engine}-${size}-1e-night-room.png` });
  await page.$eval('#fxScrub', e => { e.value = '760'; e.dispatchEvent(new Event('input', { bubbles: true })); }); await page.waitForTimeout(100);
  await page.locator('#fx-window .room').screenshot({ path: `${out}/${engine}-${size}-1f-noon-room.png` });
  await page.click('.fx-marks-btn[data-phase="golden"]'); await page.waitForTimeout(1900);
  // events via the dock
  await page.click('.fx-dock a[data-st="events"]'); await page.waitForTimeout(1400);
  await shot('2-events');
  await page.click('#fxNext'); await page.waitForTimeout(260); await shot('2b-page-flipping'); await page.waitForTimeout(700);
  await page.click('#fxPrev'); await page.waitForTimeout(800);
  await page.click('#flat [data-jump]'); await page.waitForTimeout(900); await shot('2c-september');
  await page.locator('#fxFlyerBtn').scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  await page.click('#fxFlyerBtn'); await page.waitForTimeout(330); await shot('3-flyer-lifting'); await page.waitForTimeout(700); await shot('3b-flyer');
  if (!await page.$eval('#fxFlyerDlg', d => d.open)) fail(`${size}: flyer dialog did not open`);
  await page.click('#fxPinBack'); await page.waitForTimeout(900);
  if (await page.$eval('#fxFlyerDlg', d => d.open)) fail(`${size}: flyer did not pin back`);
  // fridge
  await page.click('.fx-dock a[data-st="fridge"]'); await page.waitForTimeout(1600);
  await shot('4-fridge');
  const idea0 = await page.$eval('#fxConcept', e => e.textContent);
  await page.click('#fxShake'); await page.waitForTimeout(620); await shot('4b-tumbling');
  await page.waitForTimeout(450); await shot('4c-slapping-on');
  await page.waitForTimeout(2600); await shot('4d-new-idea');
  const idea1 = await page.$eval('#fxConcept', e => e.textContent);
  if (idea0 === idea1) fail(`${size}: shake did not change the idea`);
  const tileFont = await page.$eval('#fxTiles .tile', e => parseFloat(getComputedStyle(e).fontSize));
  if (tileFont < 20) fail(`${size}: word tiles are ${tileFont}px`);
  await page.selectOption('#fxTone', 'horror'); await page.waitForTimeout(3200);
  await overflow('fridge');
  // projector
  await page.click('.fx-dock a[data-st="projector"]'); await page.waitForTimeout(2200);
  await shot('5-projector');
  const rolling = await page.$eval('#fxVideo', v => !v.paused);
  await page.click('.reel-card[data-film="brass"]'); await page.waitForTimeout(250); await shot('5b-reel-flying'); await page.waitForTimeout(900);
  await page.click('#fxWatch'); await page.waitForTimeout(300); await shot('6a-theatre-opening'); await page.waitForTimeout(800); await shot('6-theatre');
  const fill = await page.$eval('#fxFrame', f => { const r = f.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight }; });
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  const theatreOff = await page.evaluate(() => !document.getElementById('flat').classList.contains('theatre'));
  if (!theatreOff) fail(`${size}: Escape did not leave theatre`);
  await page.waitForTimeout(300);
  const url = page.url();
  // round trip: 3D room and back keeps date, minute, tone, film and station
  await page.click('#plainToggle'); await page.waitForTimeout(1500);
  const videoAfterOff = await page.$eval('#fxVideo', v => v.paused);
  if (!videoAfterOff) fail(`${size}: reel still playing in the 3D room`);
  await page.click('#plainToggle'); await page.waitForTimeout(1500);
  const back = await page.evaluate(() => ({ url: location.href, tone: document.getElementById('fxTone').value, film: document.querySelector('.reel-card[aria-pressed="true"]').dataset.film, minute: document.getElementById('fxScrub').value, station: location.hash }));
  // full-page capture last: Chromium resizes the viewport for it, which moves the scroll-tracked station
  await shot('7-full', true);
  const u = new URL(back.url);
  if (u.searchParams.get('tone') !== 'horror' || back.tone !== 'horror') fail(`${size}: tone lost on round trip (${back.url})`);
  if (u.searchParams.get('film') !== 'brass' || back.film !== 'brass') fail(`${size}: film lost on round trip (${back.url})`);
  if (u.searchParams.get('minute') !== minute || back.minute !== minute) fail(`${size}: minute ${minute} → ${back.minute} (${back.url})`);
  report.push(`${engine} ${size}: minute ${minute}, reel rolling ${rolling}, theatre frame ${fill.w}×${fill.h} in ${fill.vw}×${fill.vh}, url ${url.replace(base, '')}, back ${back.url.replace(base, '')}`);
  if (errors.length) fail(`${size}: console errors: ${[...new Set(errors)].join(' | ')}`);
  await ctx.close();
}
await browser.close();
console.log(report.join('\n'));
process.exit(failed ? 1 : 0);
