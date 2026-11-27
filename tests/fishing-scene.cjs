// Pole fishing in the field: the pole lies at the cattails as a find; then he fishes off the washing rock with it.
// Posts a scene to the LOCAL test service only (127.0.0.1:8788, dev key), never production.
// node tests/fishing-scene.cjs <outdir>
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
const K = fs.readFileSync('/Volumes/LaB Media/GitHub/labmedia-raccoon/service/.dev.vars', 'utf8').match(/LABCOON_KEY=(.+)/)[1].trim();
const post = b => fetch('http://127.0.0.1:8788/api/labcoon/brain/post', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Labcoon-Key': K}, body: JSON.stringify(b)}).then(r => r.status);
(async () => {
  const hud = {place: 'washing_rock', mood: 'content', needs: {hunger: .4}, asleep: false, plan: ['fish_with_pole'], step: 0};
  await post({state: {hud}, field: {weather: {observedAt: Date.now() - 60000, kind: 'clear', rain: 0, snow: 0, cloud: .2, wind: 5, gust: 8, dir: 200, temp: 50}, wildlife: null,
    finds: [{kind: 'old cane fishing pole', where: 'washing_rock', color: 'tan', shine: .1}]}});
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu']});
  const p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://192.168.1.38:5431/explore.html?at=20:00&live=' + encodeURIComponent('http://127.0.0.1:8788/api/labcoon'));
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.waitForTimeout(4000);
  const poleLying = await p.evaluate(() => window.LabExplore.world.scene.getObjectByName('Finds in the field')?.children.some(o => o.userData?.label === 'old cane fishing pole'));
  await post({events: [{time: '8:05pm', move: 'fish_with_pole', text: 'x', animation: 'Labcoon_fish', hud}]});
  await p.waitForFunction(() => { const s = window.LabExplore.world.scene; let on = false; s.traverse(o => { if (o.type === 'Line' && o.visible && o.material?.opacity === .7) on = true; }); return on; }, null, {timeout: 20000}).catch(() => {});
  await p.click('#coachOk').catch(() => {}); await p.keyboard.press('f'); await p.waitForTimeout(2500);
  await p.screenshot({path: path.join(out, 'fishing.png')});
  const fishing = await p.evaluate(() => { let on = false; window.LabExplore.world.scene.traverse(o => { if (o.type === 'Line' && o.visible && o.material?.opacity === .7) on = true; }); return on; });
  console.log(JSON.stringify({poleLying, fishing, errors}));
  await b.close();
})();
