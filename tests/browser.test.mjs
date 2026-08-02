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
  await page.addInitScript(() => {
    const nativeRequest = window.requestAnimationFrame.bind(window);
    const nativeCancel = window.cancelAnimationFrame.bind(window);
    const pending = new Set();
    let peak = 0;
    window.requestAnimationFrame = (callback) => {
      let id;
      id = nativeRequest((stamp) => {
        pending.delete(id);
        callback(stamp);
      });
      pending.add(id);
      peak = Math.max(peak, pending.size);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      pending.delete(id);
      nativeCancel(id);
    };
    window.__sunRafStats = {
      reset: () => { peak = pending.size; },
      read: () => ({ pending: pending.size, peak })
    };
  });
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
  assert.equal(await page.locator('#advicePhrase .advice-accent').count(), 1);
  assert.ok(parseFloat(await page.locator('.advice-phrase').evaluate((element) => getComputedStyle(element).fontSize)) >= 30);
  assert.ok(await page.locator('.sun-sky').evaluate((element) => element.getBoundingClientRect().height) >= 440, 'the compact desktop scene must not crowd the mobile composition');
  const daylightAdvice = new Set();
  for (const minute of [480, 600, 720, 840, 960, 1080, 1170]) {
    await page.locator('#timeSlider').evaluate((slider, value) => {
      slider.value = String(value);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }, minute);
    await page.waitForTimeout(430);
    daylightAdvice.add(await page.locator('#adviceA11y').textContent());
  }
  assert.ok(daylightAdvice.size >= 6, `daylight timeline exposed only ${daylightAdvice.size} distinct phrases`);
  await page.locator('#timeSlider').evaluate((slider) => {
    slider.value = '30';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(430);
  assert.match(await page.locator('#adviceA11y').textContent(), /night is quietest/i, 'pre-dawn must use its own time-specific guidance');
  await page.evaluate(() => window.__sunRafStats.reset());
  await page.locator('#timeSlider').evaluate((slider) => {
    for (let minute = 420; minute <= 1020; minute += 20) {
      slider.value = String(minute);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await page.waitForTimeout(80);
  const rafStats = await page.evaluate(() => window.__sunRafStats.read());
  assert.ok(rafStats.peak <= 1, `timeline scrubbing created ${rafStats.peak} concurrent animation frames`);
  const layers = await page.evaluate(() => ({
    copy: Number(getComputedStyle(document.querySelector('.sun-advice-box')).zIndex),
    orb: Number(getComputedStyle(document.querySelector('.sun-orb')).zIndex)
  }));
  assert.ok(layers.copy > layers.orb, 'the sun must remain behind the quote');
  assert.ok(parseFloat(await page.locator('#selectedMoment').evaluate((element) => getComputedStyle(element).fontSize)) >= 9);
  assert.ok(parseFloat(await page.locator('#sunWind').evaluate((element) => getComputedStyle(element).opacity)) >= .75);
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
  assert.equal(await page.locator('.wx-scene-time').count(), 0, 'the weather scene must not carry a public time toolbar');
  assert.equal(await page.locator('#wxSceneTest').getAttribute('open'), null, 'the subtle scene preview stays collapsed');
  await page.evaluate(() => window.labSceneSetTime(720));
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-phase'), 'daylight');
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-sun'), 'visible');
  const daylightNightness = parseFloat(await page.locator('#wxSceneStage').evaluate((element) => element.style.getPropertyValue('--wx-nightness')));
  await page.evaluate(() => window.labSceneSetTime(480));
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-sun'), 'visible');
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-moon'), 'visible', 'the weather scene may show a daytime moon when the lunar arc calls for it');
  await page.evaluate(() => window.labSceneSetTime(1260));
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-sun'), 'hidden', '9 PM must not show a daytime sun');
  const duskNightness = parseFloat(await page.locator('#wxSceneStage').evaluate((element) => element.style.getPropertyValue('--wx-nightness')));
  assert.ok(duskNightness > daylightNightness, 'the scene should cool and darken as daylight leaves');
  await page.evaluate(() => window.labSceneSetTime(1380));
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-moon'), 'visible');
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-moon-phase'), 'waning-gibbous');
  assert.match(await page.locator('#wxSceneStage').getAttribute('data-moon-illumination'), /^8\d$/);
  const weatherMoonriseProgress = parseFloat(await page.locator('#wxSceneStage').getAttribute('data-moon-progress'));
  await page.evaluate(() => window.labSceneSetTime(120));
  assert.ok(parseFloat(await page.locator('#wxSceneStage').getAttribute('data-moon-progress')) > weatherMoonriseProgress, 'the weather moon should continue left to right overnight');
  assert.equal(await page.locator('.wx-deepdive[open]').count(), 0);
  assert.equal(await page.locator('#wxCanvas').count(), 1, 'the original weather canvas remains the weather composition');

  await page.goto(`${baseURL}/sun.html?date=2026-08-01`, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  const heroLayout = await page.evaluate(() => {
    const hero = document.querySelector('.pg-hero').getBoundingClientRect();
    const date = document.querySelector('.hero-date').getBoundingClientRect();
    const ledes = [...document.querySelectorAll('.hero-lede-grid .lede')].map((element) => element.getBoundingClientRect());
    return { heroLeft: hero.left, heroWidth: hero.width, dateLeft: date.left, ledeTops: ledes.map((rect) => rect.top) };
  });
  assert.ok(heroLayout.dateLeft > heroLayout.heroLeft + heroLayout.heroWidth * .55, 'the desktop shoot date should use the open right side of the hero');
  assert.equal(heroLayout.ledeTops.length, 2);
  assert.ok(Math.abs(heroLayout.ledeTops[0] - heroLayout.ledeTops[1]) <= 1, 'the hero introduction should form two aligned columns');
  await page.locator('#timeSlider').evaluate((slider) => {
    slider.value = '1252';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.ok(parseFloat(await page.locator('#sunOrb').evaluate((element) => element.style.top)) >= 89, 'the setting sun should cross the drawn horizon before fading');
  await page.locator('#timeSlider').evaluate((slider) => {
    slider.value = '1284';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal(await page.locator('#sunStage').getAttribute('data-sun'), 'hidden');
  assert.equal(await page.locator('#sunStage').getAttribute('data-moon'), 'hidden');
  assert.equal(await page.locator('#moonPhaseLabel').evaluate((element) => getComputedStyle(element).display), 'none', 'the lunar label should wait for the moon to enter the frame');
  await page.locator('#timeSlider').evaluate((slider) => {
    slider.value = '480';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal(await page.locator('#sunStage').getAttribute('data-sun'), 'visible');
  assert.equal(await page.locator('#sunStage').getAttribute('data-moon'), 'visible', 'a phase-aware moon may share the daytime sky with the sun');
  assert.match(await page.locator('#moonPhaseLabel').textContent(), /Waning gibbous · 9\d% moon/);
  await page.locator('#timeSlider').evaluate((slider) => {
    slider.value = '1380';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const moonriseLeft = parseFloat(await page.locator('#moonOrb').evaluate((element) => element.style.left));
  await page.locator('#timeSlider').evaluate((slider) => {
    slider.value = '120';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal(await page.locator('#sunStage').getAttribute('data-phase'), 'night');
  assert.equal(await page.locator('#sunStage').getAttribute('data-sun'), 'hidden');
  assert.equal(await page.locator('#sunStage').getAttribute('data-moon'), 'visible');
  assert.ok(parseFloat(await page.locator('#moonOrb').evaluate((element) => getComputedStyle(element).opacity)) > .5);
  assert.ok(parseFloat(await page.locator('#moonOrb').evaluate((element) => element.style.left)) > moonriseLeft, 'the moon should travel left to right after rising');
  assert.equal(await page.locator('#moonFace').count(), 1, 'the moon phase should have its own rendered face');
  assert.equal(await page.locator('#sunNatureCanvas').count(), 1, 'Golden Hour owns a separate wide nature canvas');
  const adviceVisuals = await page.evaluate(() => ({
    bottom: parseFloat(getComputedStyle(document.querySelector('.sun-advice-box')).bottom),
    fadeLeft: parseFloat(getComputedStyle(document.querySelector('.sun-advice-box'), '::before').left),
    fadeRight: parseFloat(getComputedStyle(document.querySelector('.sun-advice-box'), '::before').right),
    fadeFilter: getComputedStyle(document.querySelector('.sun-advice-box'), '::before').filter,
    skyHeight: document.querySelector('.sun-sky').getBoundingClientRect().height,
    stageHeight: document.querySelector('.sun-stage').getBoundingClientRect().height
  }));
  assert.ok(adviceVisuals.bottom >= 62, 'the desktop quote should sit comfortably above the horizon');
  assert.ok(adviceVisuals.skyHeight <= 280, `the desktop sky should stay panoramic, not ${adviceVisuals.skyHeight}px tall`);
  assert.ok(adviceVisuals.stageHeight <= 420, `the complete desktop scene should keep its conditions visible, not run ${adviceVisuals.stageHeight}px tall`);
  assert.ok(adviceVisuals.fadeLeft <= -80 && adviceVisuals.fadeRight <= -200, 'the quote vignette must fade beyond its visible copy box');
  assert.match(adviceVisuals.fadeFilter, /blur\(/, 'the quote vignette edge should be feathered');
  await page.close();
});

test('flight checklist stays hidden until requested, then persists and celebrates completion', async () => {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 }, reducedMotion: 'no-preference' });
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(baseURL) || /^(?:data|blob):/.test(url)) route.continue();
    else route.abort('blockedbyclient');
  });
  await page.goto(`${baseURL}/droneweather.html`, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  const checklist = page.locator('#lab-flight-checklist');
  assert.equal(await checklist.getAttribute('data-mode'), 'closed');
  assert.equal(await checklist.isVisible(), false);
  await page.locator('[data-open-flight-checklist]').click();
  assert.equal(await checklist.getAttribute('data-mode'), 'open');
  assert.equal(await page.locator('[data-open-flight-checklist]').getAttribute('aria-expanded'), 'true');
  for (const id of ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']) {
    await checklist.locator(`[data-fc-check="${id}"]`).check({ force: true });
  }
  const firstGroup = checklist.locator('[data-fc-group="0"]');
  assert.equal(await firstGroup.evaluate((element) => element.classList.contains('is-complete')), true);
  assert.equal(await firstGroup.evaluate((element) => element.classList.contains('celebrate')), true);
  assert.match(await firstGroup.locator('[data-fc-group-state]').textContent(), /Ready/);
  assert.ok(parseFloat(await checklist.locator('.fc-panel').evaluate((element) => getComputedStyle(element).borderRadius)) >= 8);
  assert.ok(parseFloat(await checklist.locator('[data-fc-check="a1"]').locator('..').evaluate((element) => getComputedStyle(element).fontSize)) >= 12);

  const grip = checklist.locator('[data-fc-resize]');
  const gripBox = await grip.boundingBox();
  const beforeResize = await checklist.boundingBox();
  assert.ok(gripBox && beforeResize);
  await page.mouse.move(gripBox.x + gripBox.width / 2, gripBox.y + gripBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(gripBox.x + gripBox.width / 2 - 70, gripBox.y + gripBox.height / 2 - 70, { steps: 5 });
  await page.mouse.up();
  const afterResize = await checklist.boundingBox();
  assert.ok(afterResize.width < beforeResize.width - 40);
  assert.ok(afterResize.height < beforeResize.height - 40);
  const savedSize = await checklist.evaluate((element) => ({ width: parseFloat(element.style.width), height: parseFloat(element.style.height) }));

  await checklist.locator('[data-fc="minimize"]').click();
  assert.equal(await checklist.getAttribute('data-mode'), 'minimized');
  await page.goto(`${baseURL}/sun.html`, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  assert.equal(await page.locator('#lab-flight-checklist').getAttribute('data-mode'), 'minimized');
  assert.equal(await page.locator('[data-fc-check="a1"]').isChecked(), true);
  await page.locator('[data-fc="minimize"]').click();
  assert.deepEqual(await page.locator('#lab-flight-checklist').evaluate((element) => ({ width: parseFloat(element.style.width), height: parseFloat(element.style.height) })), savedSize);
  for (const id of ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6']) {
    await page.locator(`[data-fc-check="${id}"]`).check({ force: true });
  }
  assert.equal(await page.locator('#lab-flight-checklist').getAttribute('data-complete'), 'true');
  assert.match(await page.locator('.fc-ready').textContent(), /Go fly/i);
  assert.equal(await page.locator('.fc-ready').isVisible(), true);
  await page.waitForTimeout(700);
  assert.equal(await page.locator('.fc-body').evaluate((element) => element.scrollTop), 0);
  await page.locator('[data-fc="close"]').click();
  assert.equal(await page.locator('#lab-flight-checklist').getAttribute('data-mode'), 'closed');
  assert.equal(await page.locator('#lab-flight-checklist').isVisible(), false);
  await page.goto(`${baseURL}/droneweather.html`, { waitUntil: 'domcontentloaded', timeout: 10_000 });
  assert.equal(await page.locator('#lab-flight-checklist').isVisible(), false);
  await page.locator('[data-open-flight-checklist]').click();
  assert.equal(await page.locator('#lab-flight-checklist').getAttribute('data-mode'), 'open');
  assert.equal(await page.locator('#lab-flight-checklist').getAttribute('data-complete'), 'true');
  await page.close();
});
