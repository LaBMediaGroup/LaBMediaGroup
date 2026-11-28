// Sound check: unlock audio with a tap, then measure the field bed, every game sound and the game tune.
// Taps everything that reaches the speakers with an analyser, so levels are numbers, not guesses.
// node tests/audio-check.cjs [at=20:30]
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
(async () => {
  const at = process.argv[2] || '20:30';
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
    args: ['--use-angle=metal', '--enable-gpu', '--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  await p.addInitScript(() => {
    const orig = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (dest, ...r) {
      if (dest instanceof AudioDestinationNode) {
        const a = this.context.createAnalyser(); a.fftSize = 2048; orig.call(this, a); window.__an = a;
      }
      return orig.call(this, dest, ...r);
    };
    window.__rms = (ms = 600) => new Promise(res => {
      const a = window.__an, d = new Float32Array(a.fftSize); let peak = 0, sum = 0, n = 0; const t0 = performance.now();
      (function tick() { a.getFloatTimeDomainData(d); let s = 0; for (const v of d) { s += v * v; peak = Math.max(peak, Math.abs(v)); } sum += Math.sqrt(s / d.length); n++;
        if (performance.now() - t0 < ms) setTimeout(tick, 20); else res({rms: +(sum / n).toFixed(4), peak: +peak.toFixed(3)}); })();
    });
  });
  await p.goto(`http://127.0.0.1:5430/explore.html?at=${at}`, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.mouse.click(195, 600); await p.waitForTimeout(2500);
  const out = await p.evaluate(async () => {
    const A = await import('/pond/explore-audio.js?v=5'), r = {ready: A.sound.ready};
    r.field = await window.__rms(1500);
    for (const k of ['tick', 'swoop', 'close', 'pick', 'place', 'his', 'capture', 'lost', 'crown', 'check', 'win', 'lose', 'nope']) {
      const before = await window.__rms(150); A.sfx(k); const s = await window.__rms(500); r[k] = {...s, over: +(s.peak - before.peak).toFixed(3)};
    }
    A.music(true); await new Promise(z => setTimeout(z, 800)); r.music = await window.__rms(3000); A.music(false);
    await new Promise(z => setTimeout(z, 1500)); r.afterMusic = await window.__rms(1000);
    A.sound.set(false); await new Promise(z => setTimeout(z, 1200)); r.muted = await window.__rms(600);
    return r;
  });
  console.log(JSON.stringify({at, errors, ...out}, null, 1));
  await b.close();
})();
