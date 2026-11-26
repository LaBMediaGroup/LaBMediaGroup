// Explore prototype check: GPU frame times on desktop and phone sizes, and a walk-around survey.
// node tests/roam-check.cjs <outdir> [at=14:30]   (serve the worktree on 127.0.0.1:5430 first)
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2] || '/tmp/roam'; fs.mkdirSync(out, {recursive: true});
const at = (process.argv[3] || 'at=14:30');
(async () => {
  const browser = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
    args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-first-run']});
  const report = {};
  for (const [name, opts] of [['desktop', {viewport: {width: 1366, height: 850}}],
                              ['phone', {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2}]]) {
    const page = await browser.newPage(opts); const errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
    await page.goto(`http://127.0.0.1:5430/explore.html?${at}`, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
    const gl = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const d = g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
    await page.waitForTimeout(4000);
    const samples = [];
    for (let i = 0; i < 8; i++) { await page.waitForTimeout(1000); samples.push(await page.evaluate(() => LabExplore.perf)); }
    await page.screenshot({path: path.join(out, `${name}_start.png`)});
    // follow Labcoon
    await page.evaluate(() => LabExplore.follow()); await page.waitForTimeout(2500);
    await page.screenshot({path: path.join(out, `${name}_follow.png`)});
    await page.evaluate(() => LabExplore.follow()); await page.waitForTimeout(800);
    report[name] = {gl, samples, errors};
    if (name === 'desktop') {
      // walk-around survey: a ring round the pond looking in and out, and the far edges
      const shots = [];
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4, x = 17 * Math.cos(a), z = -11.5 + 14 * Math.sin(a);
        for (const dir of ['in', 'out']) {
          await page.evaluate(([x, z, dir]) => {
            const m = LabExplore.me; m.pos.set(x, 0, z); m.target = null;
            const dx = 0 - x, dz = -11.5 - z; const yawIn = Math.atan2(-dx, -dz);
            m.yaw = dir === 'in' ? yawIn : yawIn + Math.PI; m.pitch = -.06;
          }, [x, z, dir]);
          await page.waitForTimeout(1200);
          const f = `survey_${k}_${dir}.png`; await page.screenshot({path: path.join(out, f)}); shots.push(f);
        }
      }
      report.survey = shots;
    }
    await page.close();
  }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
