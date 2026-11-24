import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
// Same reason as tests/site.test.mjs: only load the pages that actually ship,
// not the NAS's AppleDouble twins or the staging mockups sitting beside them.
const htmlFiles = listTrackedPages();

function listTrackedPages() {
  try {
    return execFileSync('git', ['ls-files', '-z', '*.html'], { cwd: root, encoding: 'utf8' })
      .split('\0')
      .filter((file) => file && !file.includes('/'))
      .sort();
  } catch {
    return fs.readdirSync(root).filter((file) => file.endsWith('.html') && !file.startsWith('._')).sort();
  }
}
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
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          overflowElements: [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map(e => ({tag:e.tagName, class:e.className, right:Math.round(e.getBoundingClientRect().right), width:getComputedStyle(e).width,height:getComputedStyle(e).height,natural:e.naturalWidth}))
        };
      });

      assert.deepEqual(errors, [], `${file} raised browser errors`);
      assert.deepEqual(state.duplicates, [], `${file} has duplicate runtime IDs`);
      assert.deepEqual(state.brokenLocalImages, [], `${file} has broken local images`);
      assert.ok(state.overflow <= 1, `${file} overflows mobile viewport by ${state.overflow}px: ${JSON.stringify(state.overflowElements)}`);
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
  // These expected moon phases describe August 1, not the machine's current day.
  await page.addInitScript(() => {
    const OriginalDate = Date;
    const now = OriginalDate.parse('2026-08-01T16:00:00Z');
    window.Date = class extends OriginalDate {
      constructor(...args) { super(...(args.length ? args : [now])); }
      static now() { return now; }
    };
  });
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
  await page.evaluate(() => window.labSceneSetCloud(100));
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-cloud'), 'overcast');
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-cloud-transmission'), '0.080');
  assert.match(await page.locator('#wxScenePhase').textContent(), /overcast/i);
  await page.evaluate(() => window.labSceneSetCloud(0));
  assert.equal(await page.locator('#wxSceneStage').getAttribute('data-cloud-transmission'), '1.000');
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
    const ledes = [...document.querySelectorAll('.pg-hero .lede')].map((element) => element.getBoundingClientRect());
    return { heroLeft: hero.left, heroWidth: hero.width, dateLeft: date.left, ledes: ledes.map((rect) => ({ left: rect.left, width: rect.width })) };
  });
  assert.ok(heroLayout.dateLeft > heroLayout.heroLeft + heroLayout.heroWidth * .55, 'the desktop shoot date should use the open right side of the hero');
  assert.equal(heroLayout.ledes.length, 1, 'the hero introduction should be one paragraph, not an orphaned second column');
  assert.ok(heroLayout.ledes[0].width < heroLayout.heroWidth * .72, 'the introduction should hold a readable measure rather than run the full hero');
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
  await page.evaluate(() => window.labSunSetCloud(100));
  assert.equal(await page.locator('#sunStage').getAttribute('data-cloud'), 'overcast-now');
  assert.equal(await page.locator('#sunStage').getAttribute('data-cloud-transmission'), '0.080');
  assert.ok(parseFloat(await page.locator('#sunStage').evaluate((element) => element.style.getPropertyValue('--cloud-opacity'))) >= .85);
  assert.match(await page.locator('#phaseVal').textContent(), /Overcast now/);
  await page.evaluate(() => window.labSunSetCloud(0));
  assert.equal(await page.locator('#sunStage').getAttribute('data-cloud-transmission'), '1.000');
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

test('shared atmosphere panel works at narrow widths and remembers the palette', async () => {
  const context = await browser.newContext({ viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.route('**/*', route => route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
  for (const file of ['tools.html', 'portfolio.html']) {
    await page.goto(`${baseURL}/${file}`);
    await page.locator('.appearance summary').click();
    await page.locator('[data-palette="forest"]').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'forest');
    assert.equal(await page.locator('[data-palette="forest"]').getAttribute('aria-pressed'), 'true');
    const box = await page.locator('.palette-panel').boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 321, `${file}: palette stays within the viewport`);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.appearance').getAttribute('open'), null);
  }
  await context.close();
});

test('the reel enters a single screening room and Escape stops playback', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await page.route('**/*', route => route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
  await page.goto(`${baseURL}/portfolio.html`);
  await page.locator('.theater-watch').click();
  assert.equal(await page.locator('.cinema-room').evaluate(el => el.open), true);
  assert.equal(await page.locator('.cinema-audience .audience-row').count(),5);
  assert.equal(await page.locator('.cinema-screen iframe').count(), 1);
  assert.equal(await page.locator('.theater-player iframe').count(), 0, 'the old inline player must not launch too');
  assert.match(await page.locator('.cinema-screen iframe').getAttribute('src'), /UAFQ5KU-6Jg/);
  assert.equal(await page.locator('video').evaluateAll(videos => videos.filter(v => !v.paused).length), 0);
  await page.keyboard.press('Escape');
  await page.locator('.cinema-screen iframe').waitFor({state:'detached'});
  assert.equal(await page.locator('.cinema-screen iframe').count(), 0);
  assert.equal(await page.locator('.theater-watch').evaluate(el => el === document.activeElement), true);
  await page.getByRole('button', { name: 'Watch Gone in the theater', exact: true }).click();
  assert.match(await page.locator('.cinema-screen iframe').getAttribute('src'), /v3u32w66o-E/);
  await page.getByRole('button', { name: 'Leave theater ×', exact: true }).click();
  await page.locator('.cinema-screen iframe').waitFor({state:'detached'});
  assert.equal(await page.locator('.cinema-screen iframe').count(), 0);
  await page.close();
});

test('tool index opens previews and supports keyboard controls', async () => {
  const page = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.route('**/*',r=>r.request().url().startsWith(baseURL)?r.continue():r.abort());
  await page.goto(`${baseURL}/tools.html`);
  assert.equal(await page.locator('#light').isVisible(),true);
  await page.waitForFunction(()=>document.querySelector('#ghSky').width>0);
  assert.equal(await page.locator('.gh-sky').getAttribute('data-phase'),'golden-evening');
  await page.locator('#ghScrub').press('Home');
  assert.equal(await page.locator('#ghClock').textContent(),'12:00 AM');
  assert.equal(await page.locator('.gh-sky').getAttribute('data-phase'),'night');
  await page.locator('#ghScrub').press('End');
  assert.equal(await page.locator('#ghClock').textContent(),'11:59 PM');
  assert.equal(await page.locator('#ghScrub').getAttribute('aria-valuetext'),'11:59 PM · Night');
  await page.locator('.bench-index a[href="#story"]').click();
  const before=await page.locator('#promptText').textContent();
  await page.locator('#promptBtn').click();
  await page.waitForFunction(previous=>document.querySelector('#promptText').textContent!==previous,before);
  await page.locator('.bench-index a[href="#assistant"]').press('Enter');
  assert.equal(new URL(page.url()).hash, '#assistant');
  assert.equal(await page.locator('.bench .tool:visible').count(),5);
  await page.close();
});

test('notebook category controls and search work without cover cards', async () => {
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.route('**/*',r=>r.request().url().startsWith(baseURL)?r.continue():r.abort());
  await page.goto(`${baseURL}/resources.html`);
  assert.equal(await page.locator('.notebook-shelf').count(),0);
  await page.locator('.notebook-index summary').click();
  await page.locator('#palChips [data-gid="software"]').click();
  const groups=await page.locator('#groups .item:visible').evaluateAll(items=>[...new Set(items.map(i=>i.dataset.gid))]);
  assert.ok(groups.length>0&&groups.every(g=>g==='software'));
  await page.locator('#q').fill('DaVinci');
  assert.equal(await page.locator('#palChips [aria-pressed="true"]').count(),0);
  assert.ok(await page.locator('#groups .item:visible').count()>0);
  await page.locator('#q').fill('not-a-real-resource-974xyz');
  assert.match(await page.locator('#restLabel').textContent(),/0 matches/);
  await page.locator('#q').fill('');
  assert.ok(await page.locator('#groups .item:visible').count()>0);
  await page.close();
});

test('film gallery keeps production archives closed until requested',async()=>{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.route('**/*',r=>r.request().url().startsWith(baseURL)?r.continue():r.abort());
 await page.goto(baseURL+'/portfolio.html');
 assert.equal(await page.locator('.film-tile').count(),7);
 assert.equal(await page.locator('.film-detail-host>section:visible').count(),0);
 await page.getByRole('button',{name:'Behind the film: Scattered',exact:true}).click();
 assert.equal(await page.locator('#scattered').isVisible(),true);
 await page.locator('#scattered .film-notes-close').click();
 assert.equal(await page.locator('.film-detail-host>section:visible').count(),0);
 await page.goto(baseURL+'/portfolio.html#gone');
 assert.equal(await page.locator('#gone').isVisible(),true);
 await page.close();
});

test('contact form preserves messages on failure and confirms successful submission',async()=>{
 const page=await browser.newPage({reducedMotion:'reduce'});
 await page.route('**/*',r=>r.request().url().startsWith(baseURL)?r.continue():r.abort());
 let fail=true;
 await page.route('https://sideways.labmedia.work/api/lab-contact',r=>r.fulfill({status:fail?502:200,contentType:'application/json',body:JSON.stringify(fail?{ok:false,error:'Please try again.'}:{ok:true})}));
 await page.goto(baseURL+'/contact.html');
 assert.equal(await page.getByText('Fair Questions',{exact:true}).count(),0);
 await page.locator('#contactForm [name=name]').fill('Test visitor');
 await page.locator('#contactForm [name=email]').fill('test@example.com');
 await page.locator('#contactForm [name=message]').fill('A test message');
 await page.locator('#contactForm button[type=submit]').click();
 await page.waitForFunction(()=>document.querySelector('#contactForm [role=status]').textContent==='Please try again.');
 assert.equal(await page.locator('#contactForm textarea').inputValue(),'A test message');
 fail=false;await page.locator('#contactForm button[type=submit]').click();
 await page.waitForFunction(()=>document.querySelector('#contactForm [role=status]').textContent==='Message sent. Thank you.');
 assert.equal(await page.locator('#contactForm textarea').inputValue(),'');
 await page.close();
});

test('homepage directory opens all five tools without scripts', async () => {
  const page = await browser.newPage({javaScriptEnabled:false, viewport:{width:320,height:740}});
  await page.goto(baseURL);
  for (const file of ['sun','ideas','droneweather','skybound','assistant']) {
    const link = page.locator('#plainDirectory a[href^="'+file+'.html"]');
    assert.equal(await link.isVisible(), true);
    await link.click();
    assert.equal(new URL(page.url()).pathname, '/'+file+'.html');
    await page.goBack();
  }
  assert.equal(await page.locator('video:visible,canvas:visible').count(),0);
  await page.close();
});

test('mobile tiles expand real tools inside the directory and Back restores the picker', async () => {
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try {
    await page.route('**/*',r=>r.request().url().startsWith(baseURL)?r.continue():r.abort());
    await page.goto(baseURL+'/#directory');
    for (const [tile,control] of [['sky','#timeSlider'],['story','#roll'],['wind','#wxWind'],['route','#flight-path'],['search','#assistantInput']]) {
      const link=page.locator('.instrument-link.'+tile);
      await link.tap();
      assert.equal(new URL(page.url()).pathname,'/directory/index.html');
      if(tile==='story'){
        const magnet=page.locator('.story-magnets button').first();
        await page.locator('.story-board [data-roll]:enabled').waitFor();
        await magnet.tap();
        const held=await magnet.textContent();
        await page.locator('.story-board [data-roll]').tap();
        assert.equal(await magnet.textContent(),held);
        assert.equal(await page.locator('.tool-tray').isVisible(),false);
      }else await page.frameLocator('.tool-tray iframe').locator(control).waitFor();
      await page.goBack();
      await page.locator('.tool-tray').waitFor({state:'hidden'});
      await page.waitForFunction(key=>document.activeElement.matches('.instrument-link.'+key),tile,{timeout:2500});
    }
  } finally {await page.close();}
});

test('mobile wind tile stretches into the forecast and follows wind from the west', async () => {
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try {
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.startsWith(baseURL)) return route.continue();
      if (url.includes('wind_direction_10m')) return route.fulfill({json:{current:{
        wind_speed_10m:24, wind_direction_10m:270, wind_gusts_10m:28, temperature_2m:55,
        weather_code:0, visibility:16000, precipitation:0, cloud_cover:0, time:'2026-11-19T12:00'
      }}});
      return route.abort();
    });
    await page.addInitScript(() => {
      const animate = Element.prototype.animate;
      Element.prototype.animate = function(frames, options) {
        if (this.id === 'forecastWind') window.windEnd = frames.at(-1).transform;
        return animate.call(this,frames,options);
      };
    });
    await page.goto(baseURL+'/#directory');
    await page.getByRole('link',{name:'Drone weather'}).tap();
    await page.frameLocator('.tool-tray iframe').locator('#wxWind').waitFor();
    const forecast=page.frames().find(f=>f.url().includes('droneweather.html'));
    await forecast.waitForFunction(() => window.windEnd?.includes('translate(66px,0px) rotate(0deg)'));
    assert.match(await forecast.locator('#wxWind').innerText(),/24/);
  } finally { await page.close(); }
});

test('a hashless reload opens on the field and a Films bookmark still lands at the gallery', async () => {
  const page = await browser.newPage({viewport:{width:390,height:844}, reducedMotion:'reduce'});
  try {
    await page.route('**/*', route => route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
    await page.goto(baseURL+'/#films');
    await page.waitForFunction(() => Math.abs(document.querySelector('#films').getBoundingClientRect().top)<2);
    await page.evaluate(() => history.replaceState(null, '', '/'));
    await page.reload();
    await page.waitForFunction(() => scrollY===0 && document.querySelector('#loader').classList.contains('done'));
    assert.equal(await page.locator('.hero-in').evaluate(el=>getComputedStyle(el).opacity), '0');
    await page.locator('.enter-field').click();
    await page.waitForFunction(() => !document.querySelector('.wind-instrument').inert);
    await page.locator('#browseChapters').click();
    await page.locator('#chapters a[href="#films"]').click();
    await page.goBack();
    await page.waitForFunction(() => location.hash==='#wind' && !document.querySelector('.wind-instrument').inert);
  } finally { await page.close(); }
});

test('the phone fridge and onward route work when the 3D renderer is unavailable', async () => {
  const page=await browser.newPage({viewport:{width:320,height:568}, reducedMotion:'reduce'});
  try {
    await page.addInitScript(() => {
      const getContext=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...options){
        return type.includes('webgl') ? null : getContext.call(this,type,...options);
      };
    });
    await page.route('**/*', route => route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
    await page.route('**/spotlight-data.js',route=>route.fulfill({contentType:'text/javascript',body:
      'window.SPOTLIGHT=[{id:"test-screening",date:"2026-08-30",until:"2026-09-02",title:"Weekend screening",venue:"Theater"}];'}));
    await page.goto(baseURL+'/#tools');
    await page.waitForSelector('html.no-world');
    const still=await page.locator('.station-frame').evaluate(frame=>getComputedStyle(frame,'::before').backgroundImage);
    assert.match(still,/story-fridge\.webp/);
    assert.equal((await page.request.get(baseURL+'/pond/img/story-fridge.webp')).status(),200);
    await page.locator('#roll').click();
    await page.locator('#readBrief').click();
    assert.equal(await page.locator('#briefLines dd').count(),10);
    await page.locator('#briefClose').click();
    for(const tab of ['events','book','sun','flight']){
      await page.locator('#stationNext').click();
      assert.equal(await page.locator('#tools').getAttribute('data-instrument'),tab);
      if(tab==='events'){
        await page.locator('[data-day="2026-08-31"]').click();
        await page.locator('#boardLater').click();
        await page.locator('[data-day="2026-09-02"]').click();
        assert.match(await page.locator('#eventName').getAttribute('href'),/events\.html#event-test-screening$/);
        await page.locator('#boardLater').click();
        assert.equal(await page.locator('#eventName').textContent(),'No listings this month');
        await page.locator('#eventNext').click();
        assert.equal(await page.locator('#eventName').textContent(),'Weekend screening');
      }
      if(tab==='flight'){
        assert.equal(await page.locator('#panel-flight nav a').count(),4);
        assert.equal(await page.locator('#flyShot').isDisabled(),true);
      }
    }
    await page.locator('#stationNext').click();
    assert.equal(new URL(page.url()).hash,'#work');
  } finally { await page.close(); }
});

test('closing a film returns to its TV after scrolling away from a bookmarked tool', async () => {
  const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  try {
    await page.route('**/*', route => route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
    await page.goto(baseURL+'/#tools');
    await page.evaluate(()=>document.querySelector('#films').scrollIntoView());
    await page.waitForFunction(()=>!document.querySelector('.film-frame').inert);
    const galleryY=await page.evaluate(()=>scrollY);
    for(const closeWith of ['button','browser']){
      await page.locator('#filmPlay').click();
      await page.waitForSelector('#filmViewer[open]');
      if(closeWith==='browser') await page.goBack();
      else await page.locator('#filmBack').click();
      await page.waitForFunction(()=>!document.querySelector('#filmViewer').open && !history.state?.labFeature && history.scrollRestoration==='auto');
      assert.equal(await page.evaluate(()=>scrollY),galleryY);
      assert.equal(new URL(page.url()).hash,'#tools');
    }
  } finally {await page.close();}
});

test('scroll visits the shed tools in both directions and resumes after a shortcut', async () => {
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  try {
    await page.route('**/*', route => route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
    await page.goto(baseURL+'/#tools');
    const station=page.locator('#tools');
    async function at(fraction,expected){
      await station.evaluate((section,f)=>{
        const travel=section.offsetHeight-section.querySelector('.station-frame').offsetHeight;
        scrollTo(0,scrollY+section.getBoundingClientRect().top+f*travel);
      },fraction);
      await page.waitForFunction(name=>document.querySelector('#tools').dataset.instrument===name,expected);
      assert.equal(await page.locator('#tab-'+expected).getAttribute('aria-selected'),'true');
    }
    for(const [fraction,tool] of [[0,'story'],[.28,'events'],[.52,'book'],[.86,'sun'],[.96,'flight'],[.86,'sun'],[.52,'book'],[.28,'events'],[0,'story']]) await at(fraction,tool);
    await page.locator('#stationNext').click();
    await page.locator('#stationNext').click();
    await page.waitForFunction(()=>document.querySelector('#tools').dataset.instrument==='book');
    const position=await station.evaluate(s=>-s.getBoundingClientRect().top/(s.offsetHeight-s.querySelector('.station-frame').offsetHeight));
    assert.ok(position>.46 && position<.58);
    await at(.8,'sun');
  } finally {await page.close();}
});
