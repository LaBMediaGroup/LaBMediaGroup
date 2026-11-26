// The picnic-table game on a phone: games tab, checkers board, two moves, his reactions.
// node tests/game-shots.cjs <outdir>
const {chromium} = require('/Volumes/LaB Media/GitHub/labmedia-raccoon/web-review/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, {recursive: true});
(async () => {
  const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu']});
  const p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  await p.goto('http://127.0.0.1:5430/explore.html?at=20:30', {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(() => document.documentElement.classList.contains('labcoon-ready'), null, {timeout: 60000});
  await p.waitForTimeout(1500);
  await p.click('#thingsBtn'); await p.waitForTimeout(500);
  await p.click('#thingsSheet [data-tab=games]'); await p.waitForTimeout(500);
  await p.screenshot({path: path.join(out, 'g1_tab.png')});
  await p.click('.gamecard'); await p.waitForTimeout(600);
  await p.screenshot({path: path.join(out, 'g2_board.png')});
  for (let k = 0; k < 2; k++) {
    const movable = await p.locator('.sq.can').count(); if (!movable) break;
    await p.locator('.sq.can').nth(movable - 1 - k).click(); await p.waitForTimeout(250);
    if (!await p.locator('.sq.to').count()) break;
    await p.locator('.sq.to').first().click(); await p.waitForTimeout(2200);
  }
  await p.screenshot({path: path.join(out, 'g3_play.png')});
  // chess: open it from the games tab, play two pawn moves
  await p.click('[data-leave]'); await p.waitForTimeout(400);
  await p.click('#thingsBtn'); await p.waitForTimeout(400); await p.click('#thingsSheet [data-tab=games]'); await p.waitForTimeout(400);
  await p.locator('.gamecard').nth(1).click(); await p.waitForTimeout(600);
  await p.screenshot({path: path.join(out, 'g4_chess.png')});
  for (const [from, to] of [['e2', 'e4'], ['d2', 'd4']]) {
    await p.locator(`.sq[aria-label^="${from}"]`).click(); await p.waitForTimeout(200);
    await p.locator(`.sq[aria-label^="${to}"]`).click(); await p.waitForTimeout(2200);
  }
  await p.screenshot({path: path.join(out, 'g5_chess_play.png')});
  console.log('chess', await p.textContent('#gameTurn'), '|', await p.textContent('#gameScore'), '|', await p.textContent('#gameSay'));
  console.log(JSON.stringify({errors, turn: await p.textContent('#gameTurn'), say: await p.textContent('#gameSay'), score: await p.textContent('#gameScore')}));
  await b.close();
})();
