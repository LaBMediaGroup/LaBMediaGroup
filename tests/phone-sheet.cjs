// Phone layout of the say-hi sheet with the field focused (no overflow past the screen edge).
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu']});
  const p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
  await p.goto('http://127.0.0.1:5430/explore.html?live=http://127.0.0.1:8788/api/labcoon', {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.evaluate(() => { document.getElementById('lcSheet').hidden = false; document.getElementById('hiForm').hidden = false; document.getElementById('hiLeft').hidden = false; document.getElementById('sheetText').textContent = 'Labcoon is delighted.'; });
  await p.focus('#hiInput'); await p.waitForTimeout(400);
  const box = await p.evaluate(() => { const r = document.getElementById('lcSheet').getBoundingClientRect(), b = document.querySelector('#hiForm button').getBoundingClientRect(), j = document.getElementById('labcoonDoing').getBoundingClientRect(); return {sheetRight: Math.round(r.right), buttonRight: Math.round(b.right), journalRight: Math.round(j.right), width: innerWidth, font: getComputedStyle(document.getElementById('hiInput')).fontSize}; });
  console.log(JSON.stringify(box)); await p.screenshot({path: process.argv[2]}); await b.close();
})();
