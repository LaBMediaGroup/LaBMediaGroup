/* The picnic-table games: a board overlay in the HUD's sticker style. Checkers now; chess plugs in
   through the same table (pond/games/chess-ui.js) once its engine is here.
   openGame(kind, {onResult}) shows the table; onResult({game, result:'win'|'loss'|'draw', moves}) is
   called once at the end, so the HUD can tell his brain and keep it in "Yours". */
import * as C from './checkers.js?v=2';

const FACE = '<svg viewBox="0 0 40 40"><path d="M9 14 7 5l9 5M31 14l2-9-9 5" fill="#8d8f8c" stroke="#22302f" stroke-width="2" stroke-linejoin="round"/><ellipse cx="20" cy="22" rx="14" ry="12" fill="#b9bbb7" stroke="#22302f" stroke-width="2"/><path d="M7 20c4-3 9-3 13 0 4-3 9-3 13 0-2 5-8 6-13 2-5 4-11 3-13-2z" fill="#22302f"/><circle cx="14" cy="20" r="2.2" fill="#fffaf1"/><circle cx="26" cy="20" r="2.2" fill="#fffaf1"/><ellipse cx="20" cy="28" rx="7" ry="5" fill="#f5ecdc"/><circle cx="20" cy="26.5" r="2" fill="#22302f"/></svg>';
const ACORN = '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="24" rx="11" ry="12" fill="#b9793f" stroke="#22302f" stroke-width="2.5"/><path d="M8 18c0-6 5-9 12-9s12 3 12 9c-4 2-20 2-24 0z" fill="#6d4a2b" stroke="#22302f" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 9V5" stroke="#22302f" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="16" cy="25" rx="2.5" ry="4" fill="#fff" opacity=".25"/></svg>';
const CAP = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="#d23b2e" stroke="#22302f" stroke-width="2.5"/>' + Array.from({length: 21}, (_, i) => { const a = i / 21 * Math.PI * 2; return `<circle cx="${20 + Math.cos(a) * 14}" cy="${20 + Math.sin(a) * 14}" r="2.1" fill="#d23b2e" stroke="#22302f" stroke-width="1.2"/>`; }).join('') + '<circle cx="20" cy="20" r="10.5" fill="#e45244"/><ellipse cx="16" cy="16" rx="4" ry="2.5" fill="#fff" opacity=".35"/></svg>';
const CROWN = '<svg viewBox="0 0 40 40" class="crown"><path d="M10 26l2-12 6 6 2-9 2 9 6-6 2 12z" fill="#f2c84e" stroke="#22302f" stroke-width="2.2" stroke-linejoin="round"/></svg>';

let root = null;
export function openGame(kind, {onResult, chess} = {}) {
  closeGame();
  root = document.createElement('div'); root.className = 'game-scrim pe';
  root.innerHTML = `<section class="game st-card" role="dialog" aria-label="${kind} with Labcoon">
    <header><span class="title">${kind === 'chess' ? 'Chess' : 'Checkers'} with Labcoon</span><button class="st-round x" type="button" data-leave aria-label="Back to the pond"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>
    <div class="game-who"><span class="face">${FACE}</span><div class="game-say" id="gameSay">…</div></div>
    <div class="board" id="board" role="grid"></div>
    <div class="game-foot"><span class="st-pill turn" id="gameTurn">Your move</span><span class="score" id="gameScore"></span><button class="st-pill" type="button" id="gameNew">New game</button></div>
  </section>`;
  document.getElementById('hud2').appendChild(root);
  requestAnimationFrame(() => root.classList.add('on'));
  root.querySelector('[data-leave]').addEventListener('click', closeGame);
  root.addEventListener('click', e => { if (e.target === root) closeGame(); });
  if (kind === 'chess' && chess) chess(root, {onResult, FACE, say: t => sayLine(t)});
  else checkers(onResult);
}
export function closeGame() { if (!root) return; const r = root; root = null; r.classList.remove('on'); setTimeout(() => r.remove(), 250); }
function sayLine(t) { const s = root?.querySelector('#gameSay'); if (!s) return; s.textContent = t; s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); }

function checkers(onResult) {
  let b = C.newBoard(), turn = C.YOU, sel = null, last = null, over = false, moves = 0, reported = false;
  const board = root.querySelector('#board'), turnEl = root.querySelector('#gameTurn'), scoreEl = root.querySelector('#gameScore');
  sayLine(C.say('start'));
  const legal = () => C.legalMoves(b, C.YOU);
  function render() {
    const lm = turn === C.YOU && !over ? legal() : [], mine = new Set(lm.map(m => m.path[0].join())), targets = sel ? lm.filter(m => m.path[0].join() === sel.join()) : [];
    board.innerHTML = '';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const cell = document.createElement('button'); cell.type = 'button'; cell.className = 'sq ' + ((r + c) % 2 ? 'dark' : 'light');
      const p = b[r][c], key = r + ',' + c;
      if (last?.some(([a, d]) => a === r && d === c)) cell.classList.add('last');
      if (sel && sel[0] === r && sel[1] === c) cell.classList.add('sel');
      if (mine.has(key)) cell.classList.add('can');
      const t = targets.find(m => m.path.at(-1)[0] === r && m.path.at(-1)[1] === c);
      if (t) { cell.classList.add('to'); if (t.taken.length) cell.classList.add('cap'); }
      if (p) cell.innerHTML = `<span class="pc ${p.side === C.YOU ? 'you' : 'him'}">${p.side === C.YOU ? ACORN : CAP}${p.king ? CROWN : ''}</span>`;
      cell.setAttribute('aria-label', `${p ? (p.side === C.YOU ? 'your acorn' : 'his bottle cap') + (p.king ? ', crowned' : '') : 'empty'}, row ${8 - r}, column ${'abcdefgh'[c]}`);
      cell.addEventListener('click', () => click(r, c, t));
      board.appendChild(cell);
    }
    turnEl.textContent = over ? (over === C.YOU ? 'You won!' : 'Labcoon won') : turn === C.YOU ? 'Your move' : 'Labcoon is thinking…';
    turnEl.classList.toggle('primary', turn === C.YOU && !over);
    scoreEl.textContent = `acorns ${C.count(b, C.YOU)} · caps ${C.count(b, C.HIM)}`;
  }
  function finish(w) {
    over = w; render();
    sayLine(C.say(w === C.YOU ? 'lose' : 'win'));
    if (!reported) { reported = true; onResult?.({game: 'checkers', result: w === C.YOU ? 'win' : 'loss', moves}); }
    if (w === C.YOU) confetti();
  }
  function click(r, c, target) {
    if (over || turn !== C.YOU) return;
    if (target) {
      const wasKing = b[sel[0]][sel[1]]?.king;
      b = C.play(b, target); last = target.path; sel = null; moves++;
      if (target.taken.length) sayLine(C.say('jumpYou')); else if (!wasKing && b[target.path.at(-1)[0]][target.path.at(-1)[1]].king) sayLine(C.say('youKing'));
      const w = C.winner(b, C.HIM); if (w) return finish(w);
      turn = C.HIM; render(); setTimeout(himMove, 650 + Math.random() * 600);
      return;
    }
    const p = b[r][c];
    sel = p?.side === C.YOU && legal().some(m => m.path[0][0] === r && m.path[0][1] === c) ? [r, c] : null;
    if (p?.side === C.YOU && !sel && legal().some(m => m.taken.length)) sayLine('you have to jump. house rules.');
    render();
  }
  function himMove() {
    if (!root || over) return;
    sayLine(C.say('think'));
    setTimeout(() => {
      if (!root || over) return;
      const m = C.labcoonMove(b); if (!m) return finish(C.YOU);
      const wasKing = b[m.path[0][0]][m.path[0][1]].king;
      b = C.play(b, m); last = m.path; moves++;
      if (m.taken.length) sayLine(C.say('jumpHim')); else if (!wasKing && b[m.path.at(-1)[0]][m.path.at(-1)[1]].king) sayLine(C.say('king')); else sayLine(C.say('after'));
      const w = C.winner(b, C.YOU); if (w) return finish(w);
      turn = C.YOU; render();
    }, 500);
  }
  root.querySelector('#gameNew').addEventListener('click', () => {
    if (!over && moves > 2 && !reported) { reported = true; onResult?.({game: 'checkers', result: 'loss', moves, resigned: true}); }
    b = C.newBoard(); turn = C.YOU; sel = null; last = null; over = false; moves = 0; reported = false; sayLine(C.say('start')); render();
  });
  render();
}

export function confetti() {
  const g = root?.querySelector('.game'); if (!g) return;
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('i'); s.className = 'conf';
    s.style.left = 50 + (Math.random() - .5) * 60 + '%'; s.style.background = ['#f2a33a', '#ef7fa8', '#8cc58d', '#5aa7d8', '#f2c84e'][i % 5];
    s.style.setProperty('--dx', (Math.random() - .5) * 360 + 'px'); s.style.setProperty('--r', Math.random() * 720 + 'deg'); s.style.animationDelay = Math.random() * .15 + 's';
    g.appendChild(s); setTimeout(() => s.remove(), 1600);
  }
}
