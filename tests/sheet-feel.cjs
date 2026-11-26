// Sheet feel on a phone: every tap of his buttons makes a sound and bounces; dragging the grabber puts the sheet away.
// node tests/sheet-feel.cjs [page base]
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const base = process.argv[2] || 'http://127.0.0.1:5430';
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(base + '/explore.html' + (process.argv[3] || ''), {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.mouse.click(195, 700); await p.waitForTimeout(800);
  await p.evaluate(async () => {                 // count sounds by kind
    const A = await import('/pond/explore-audio.js?v=3'); window.__s = []; const o = A.sfx;
    window.__ready = A.sound.ready;
  });
  // the HUD's blip calls the module's sfx; watch it through the AudioContext's oscillator starts instead
  await p.evaluate(() => { const o = OscillatorNode.prototype.start; window.__osc = 0; OscillatorNode.prototype.start = function (...a) { window.__osc++; return o.apply(this, a); }; const s = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...a) { window.__osc++; return s.apply(this, a); }; });
  const r = {};
  const taps = async (label, sel) => { const n0 = await p.evaluate(() => window.__osc); await p.locator(sel).first().click(); await p.waitForTimeout(60);
    r[label] = {sound: (await p.evaluate(() => window.__osc)) > n0, bounce: await p.locator(sel).first().evaluate(e => e.classList.contains('tapped') || getComputedStyle(e).animationName === 'tapBounce')}; await p.waitForTimeout(400); };
  await p.click('#thingsBtn'); await p.waitForTimeout(500);
  await taps('tab songs', '#thingsSheet [data-tab=songs]');
  await taps('tab journal', '#thingsSheet [data-tab=journal]');
  if (await p.locator('[data-book=notes]').count()) await taps('book tab', '[data-book=notes]');
  if (await p.locator('[data-turn="-1"]').count()) await taps('page turn', '[data-turn="-1"]');
  // drag the grabber down 40px: springs back; then 200px: closes
  const g = await p.locator('#thingsSheet .grab').boundingBox();
  const drag = async dy => { await p.mouse.move(g.x + g.width / 2, g.y + 2); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(g.x + g.width / 2, g.y + 2 + dy * i / 8); await p.waitForTimeout(30); } await p.mouse.up(); await p.waitForTimeout(500); };
  await drag(40); r.shortDragStaysOpen = await p.locator('#thingsSheet').evaluate(e => !e.hidden && e.classList.contains('on'));
  await drag(220); r.longDragCloses = await p.locator('#thingsSheet').evaluate(e => e.hidden || !e.classList.contains('on'));
  console.log(JSON.stringify({ready: await p.evaluate(() => window.__ready), ...r, errors}, null, 1));
  await b.close();
})();
