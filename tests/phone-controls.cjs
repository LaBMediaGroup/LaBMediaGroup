// Phone controls and finds: thumb stick walks (and runs), the paw walks you to him, finds lie in the field and a tap names one.
// node tests/phone-controls.cjs <outdir> [page base] [query]
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
const base = process.argv[3] || 'http://192.168.1.38:5431', query = process.argv[4] || '?live=' + encodeURIComponent('http://127.0.0.1:8788/api/labcoon');
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu']});
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
  await ctx.addInitScript(() => { try { localStorage.setItem('labcoon-coached', '1'); } catch {} });
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', e => errors.push(e.message)); let fieldReads = 0; p.on('request', q => { if (q.url().includes('/field')) fieldReads++; });
  await p.goto(base + '/explore.html' + query, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.waitForFunction(() => (window.LabExplore.world.scene.getObjectByName('Finds in the field')?.children.length || 0) > 0, null, {timeout: 20000}).catch(() => {});
  const fieldReads0 = fieldReads; await p.waitForTimeout(10000); const fieldReadsIn10s = fieldReads - fieldReads0;
  const pos = () => p.evaluate(() => { const m = window.LabExplore.me.pos; return [m.x, m.z]; });
  const r = {fieldReadsIn10s, finds: await p.evaluate(() => window.LabExplore.world.scene.getObjectByName('Finds in the field')?.children.filter(o => o.type === 'Group').length ?? 0)};
  // thumb stick: touch lower-left, push up gently (walk) for 1.5 s, then hard (run) for 1.5 s
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
  let a = await pos(); await touch('touchStart', 90, 640); await touch('touchMove', 90, 615);
  await p.screenshot({path: path.join(out, 'c1_stick.png')});
  await p.waitForTimeout(1500); let b1 = await pos(); await touch('touchMove', 90, 570); await p.waitForTimeout(1500); let b2 = await pos(); await touch('touchEnd', 90, 570);
  r.walked = +Math.hypot(b1[0] - a[0], b1[1] - a[1]).toFixed(2); r.ran = +Math.hypot(b2[0] - b1[0], b2[1] - b1[1]).toFixed(2);
  r.stickHidden = !(await p.locator('.joy.on').count());
  // right side drag still looks around
  const yaw0 = await p.evaluate(() => window.LabExplore.me.yaw);
  await touch('touchStart', 300, 400); for (let i = 1; i <= 6; i++) await touch('touchMove', 300 - i * 15, 400); await touch('touchEnd', 210, 400);
  r.looked = Math.abs((await p.evaluate(() => window.LabExplore.me.yaw)) - yaw0) > .1;
  // paw: walk to him
  await p.click('#walkToBtn'); await p.waitForFunction(() => !window.LabExplore.me.target, null, {timeout: 30000}).catch(() => {}); await p.waitForTimeout(300);
  r.distToHimAfterPaw = +(await p.evaluate(() => { const m = window.LabExplore.me.pos, c = window.LabExplore.coon.pos; return Math.hypot(m.x - c.x, m.z - c.z); })).toFixed(2);
  // aim at the nearest find, tap it
  const spot = await p.evaluate(() => {
    const E = window.LabExplore, cam = E.world.camera, g = E.world.scene.getObjectByName('Finds in the field'); let best = null;
    for (const o of g.children) { if (o.type !== 'Group') continue; const v = o.position.clone().project(cam); if (v.z > 1 || Math.abs(v.x) > .9 || Math.abs(v.y) > .9) continue;
      const d = o.position.distanceTo(cam.position); if (!best || d < best.d) best = {d, x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, kind: o.userData.label}; }
    return best; });
  r.findOnScreen = spot && {kind: spot.kind, d: +spot.d.toFixed(1)};
  if (spot) { await p.mouse.click(spot.x, spot.y); await p.waitForTimeout(400); r.bubble = await p.locator('#lcBubble').textContent(); await p.screenshot({path: path.join(out, 'c2_find_tap.png')}); }
  await p.evaluate(() => { window.LabExplore.world.scene.getObjectByName('Finds in the field').visible = false; });
  await p.waitForTimeout(200); await p.screenshot({path: path.join(out, 'c3_no_finds.png')});
  r.lineObject = await p.evaluate(() => { const E = window.LabExplore, T = E.world.THREE, rc = new T.Raycaster(); rc.setFromCamera(new T.Vector2(.35, .3), E.world.camera);
    const h = rc.intersectObjects(E.world.scene.children, true)[0]; let o = h?.object, names = []; while (o) { names.push(o.name || o.type); o = o.parent; } return names.slice(0, 4).join(' < '); });
  console.log(JSON.stringify({...r, errors}, null, 1));
  await b.close();
})();
