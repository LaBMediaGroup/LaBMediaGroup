import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html')).sort();
const types = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

let server;
let browser;
let baseURL;

test.before(async () => {
  server = http.createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url, 'http://local.test').pathname);
    const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseURL = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true });
});

test.after(async () => {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve));
});

test('pages load cleanly in mobile Chromium', async (t) => {
  for (const file of htmlFiles) {
    await t.test(file, async () => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/*', (route) => {
        const url = route.request().url();
        if (url.startsWith(baseURL) || /^(?:data|blob):/.test(url)) route.continue();
        else route.abort('blockedbyclient');
      });
      await page.goto(`${baseURL}/${file}`, { waitUntil: 'domcontentloaded', timeout: 10_000 });
      await page.waitForTimeout(250);

      const state = await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
        const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
        const brokenLocalImages = [...document.images]
          .filter((image) => {
            if (!(image.currentSrc || image.getAttribute('src'))) return false;
            try {
              return new URL(image.currentSrc || image.src, location.href).origin === location.origin;
            } catch (_) {
              return false;
            }
          })
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.getAttribute('src'));
        return {
          duplicates,
          brokenLocalImages,
          overflow: document.documentElement.scrollWidth - window.innerWidth
        };
      });

      assert.deepEqual(errors, [], `${file} raised browser errors`);
      assert.deepEqual(state.duplicates, [], `${file} has duplicate runtime IDs`);
      assert.deepEqual(state.brokenLocalImages, [], `${file} has broken local images`);
      assert.ok(state.overflow <= 1, `${file} overflows mobile viewport by ${state.overflow}px`);
      await page.close();
    });
  }
});

test('Golden Hour responds to date changes and exposes calculated windows', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(baseURL) || /^(?:data|blob):/.test(url)) route.continue();
    else route.abort('blockedbyclient');
  });
  await page.goto(`${baseURL}/sun.html?date=2026-08-01`, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  const firstSunrise = await page.locator('#sunriseVal').textContent();
  assert.match(firstSunrise, /^6:2\d AM$/, 'default Shelby times should stay in Eastern time regardless of the test runner timezone');
  assert.equal(await page.locator('.phase-card').count(), 4);
  const initialAdvice = await page.locator('#advicePhrase').textContent();
  await page.locator('#timeSlider').evaluate((slider) => {
    slider.value = '400';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal(await page.locator('#advicePhrase').evaluate((element) => element.classList.contains('spin')), true);
  await page.waitForTimeout(450);
  const morningAdvice = await page.locator('#advicePhrase').textContent();
  assert.notEqual(morningAdvice, initialAdvice);
  const layers = await page.evaluate(() => ({
    copy: Number(getComputedStyle(document.querySelector('.sun-advice-box')).zIndex),
    orb: Number(getComputedStyle(document.querySelector('.sun-orb')).zIndex)
  }));
  assert.ok(layers.copy > layers.orb, 'the sun must remain behind the quote');
  await page.locator('#sunDate').fill('2026-12-01');
  await page.locator('#sunDate').dispatchEvent('change');
  assert.notEqual(await page.locator('#sunriseVal').textContent(), firstSunrise);
  assert.match(await page.locator('#plannerStatus').textContent(), /calculated locally/i);
  await page.close();
});

test('solar scenes hand daylight to moonlight without changing the weather composition', async () => {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce' });
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(baseURL) || /^(?:data|blob):/.test(url)) route.continue();
    else route.abort('blockedbyclient');
  });
  await page.goto(`${baseURL}/droneweather.html`, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  await page.evaluate(() => window.labSceneSetTime(1260));
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-sun'), 'hidden', '9 PM must not show a daytime sun');
  await page.evaluate(() => window.labSceneSetTime(1320));
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-moon'), 'visible');
  assert.equal(await page.locator('.wx-deepdive[open]').count(), 0);
  assert.equal(await page.locator('#wxCanvas').count(), 1, 'the original weather canvas remains the weather composition');

  await page.goto(`${baseURL}/sun.html?date=2026-08-01`, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  await page.locator('#timeSlider').evaluate((slider) => {
    slider.value = '1320';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal(await page.locator('#sunStage').getAttribute('data-phase'), 'night');
  assert.equal(await page.locator('#sunStage').getAttribute('data-sun'), 'hidden');
  assert.equal(await page.locator('#moonOrb').evaluate((element) => getComputedStyle(element).opacity), '1');
  assert.equal(await page.locator('#sunNatureCanvas').count(), 1, 'Golden Hour owns a separate wide nature canvas');
  await page.close();
});

test('flight checklist minimizes, reopens and carries progress between pages', async () => {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce' });
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(baseURL) || /^(?:data|blob):/.test(url)) route.continue();
    else route.abort('blockedbyclient');
  });
  await page.goto(`${baseURL}/droneweather.html`, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  const checklist = page.locator('#lab-flight-checklist');
  assert.equal(await checklist.getAttribute('data-mode'), 'minimized');
  await checklist.locator('[data-fc="minimize"]').click();
  assert.equal(await checklist.getAttribute('data-mode'), 'open');
  await checklist.locator('[data-fc-check="a1"]').locator('..').click();
  assert.match(await checklist.locator('[data-fc-launch-count]').textContent(), /^1\/18$/);
  await checklist.locator('[data-fc="minimize"]').click();
  assert.equal(await checklist.getAttribute('data-mode'), 'minimized');
  await page.goto(`${baseURL}/sun.html`, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  assert.equal(await page.locator('#lab-flight-checklist').getAttribute('data-mode'), 'minimized');
  assert.equal(await page.locator('[data-fc-check="a1"]').isChecked(), true);
  await page.locator('[data-fc="close"]').click();
  assert.equal(await page.locator('#lab-flight-checklist').getAttribute('data-mode'), 'closed');
  await page.locator('[data-fc="open"]').click();
  assert.equal(await page.locator('#lab-flight-checklist').getAttribute('data-mode'), 'open');
  await page.close();
});
