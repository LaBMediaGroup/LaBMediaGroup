/* Chess with Labcoon at the picnic table, on Bobby's engine (chess-engine.js, ported from
   project-gate0 Shoot-N-Scrap's Chess module). You play white; he plays black at the level you pick.
   Pieces are drawn shapes, not font glyphs, so they look the same on every phone. */
import * as Chess from './chess-engine.js?v=1';
import {sfx} from '../explore-audio.js?v=1';

const LEVEL = {easy: 'BEGINNER', normal: 'EASY', best: 'MEDIUM'};
const SHAPE = {   // 40×40 silhouettes, base at y≈35
  1: 'M14 35h12l-1.5-4h-9zM16 31l1.5-9h5l1.5 9M15 22h10M20 13a4.5 4.5 0 1 0 0 .01',
  2: 'M12 35h16l-1-4H13zM14 31c0-6 3-9 7-12l-6 3-2-3 7-8c5 0 10 4 10 12v8',
  3: 'M13 35h14l-1-4H14zM15 31l2-12h6l2 12M17 19c-3-4 0-9 3-11 3 2 6 7 3 11M20 12l2 3',
  4: 'M12 35h16l-1-4H13zM14 31l1-14h10l1 14M13 17V10h3v3h3v-3h2v3h3v-3h3v7z',
  5: 'M12 35h16l-1-4H13zM14 31l2-13h8l2 13M12 14l4 4 4-8 4 8 4-4-2 4H14z',
  6: 'M12 35h16l-1-4H13zM14 31l2-13h8l2 13M15 18h10l-2-6h-6zM20 4v8M17 7h6',
};
const piece = v => {
  const white = v > 0, d = SHAPE[Math.abs(v)];
  return `<svg viewBox="0 0 40 40" class="cp"><path d="${d}" fill="${white ? '#fffaf1' : '#3b4a48'}" stroke="#22302f" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>${Math.abs(v) === 1 ? `<circle cx="20" cy="17.5" r="4.5" fill="${white ? '#fffaf1' : '#3b4a48'}" stroke="#22302f" stroke-width="2.4"/>` : ''}</svg>`;
};
const LINES = {
  start: ['chess. i like the horse ones.', 'you go first. white is too clean for me anyway.', 'ok. i’ll try. maybe.'],
  took: ['ha. that one’s mine now.', 'into the stash with it.', 'shiny.'],
  lost: ['hey! that was a good one.', 'my horse…', 'mm. sneaky.'],
  check: ['check! is that how you say it?', 'your king looks worried.'],
  inCheck: ['oh. my king. hm.', 'uh oh.'],
  think: ['hm…', '*stares at the horse piece*', 'thinking…'],
  after: ['your turn.', 'there.', 'ok, go.'],
  win: ['checkmate? i did a checkmate!', 'i won. i’m telling the moon.'],
  lose: ['you got me. good game.', 'ok you’re good at this. rematch later.'],
  draw: ['a draw. we both win a little.'],
};
const say = k => LINES[k][Math.floor(Math.random() * LINES[k].length)];

export function playChess(root, {onResult, say: speak}) {
  const board = root.querySelector('#board'), turnEl = root.querySelector('#gameTurn'), scoreEl = root.querySelector('#gameScore');
  board.classList.add('chess');
  const foot = root.querySelector('.game-foot');
  const lv = document.createElement('div'); lv.className = 'levels';
  lv.innerHTML = Object.entries({easy: 'Go easy', normal: 'Normal', best: 'Try your best'}).map(([k, l]) => `<button type="button" class="st-pill${k === 'easy' ? ' dark' : ''}" data-lv="${k}">${l}</button>`).join('');
  foot.before(lv);
  let level = 'easy', p, sel = null, over = false, reported = false;
  const sq = (rank, file) => rank * 8 + file;
  function start() { p = Chess.newPos(); sel = null; over = false; reported = false; speak(say('start')); render(); }
  lv.addEventListener('click', e => { const b = e.target.closest('[data-lv]'); if (!b) return; level = b.dataset.lv;
    for (const x of lv.children) x.classList.toggle('dark', x === b); if (p.history.length) start(); else render(); });
  function render() {
    const b = Chess.board64(p), legal = !over && p.side === 1 ? Chess.legalMoves(p).map(Chess.parts) : [];
    const [result, check] = Chess.status(p);
    let kingSq = -1; if (check) for (let i = 0; i < 64; i++) if (b[i] === 6 * p.side) kingSq = i;
    board.innerHTML = '';
    for (let r = 7; r >= 0; r--) for (let f = 0; f < 8; f++) {
      const i = sq(r, f), v = b[i], cell = document.createElement('button'); cell.type = 'button';
      cell.className = 'sq ' + ((r + f) % 2 ? 'light' : 'dark');
      if (p.last && (p.last[0] === i || p.last[1] === i)) cell.classList.add('last');
      if (sel === i) cell.classList.add('sel');
      if (i === kingSq) cell.classList.add('check');
      if (legal.some(([a]) => a === i)) cell.classList.add('can');
      const to = sel != null && legal.find(([a, z]) => a === sel && z === i);
      if (to) { cell.classList.add('to'); if (v) cell.classList.add('cap'); }
      if (v) cell.innerHTML = `<span class="pc">${piece(v)}</span>`;
      cell.setAttribute('aria-label', Chess.squareName(i) + (v ? (v > 0 ? ' white ' : ' black ') + ['', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'][Math.abs(v)] : ''));
      cell.addEventListener('click', () => click(i, legal));
      board.appendChild(cell);
    }
    turnEl.textContent = over ? over : p.side === 1 ? (check ? 'Check! Your move' : 'Your move') : 'Labcoon is thinking…';
    turnEl.classList.toggle('primary', p.side === 1 && !over);
    scoreEl.textContent = p.history.length ? p.history.slice(-2).join(' ') : '';
    if (result !== 'play' && !over) end(result);
  }
  function end(result) {
    const youLost = result === 'checkmate' && p.side === 1, youWon = result === 'checkmate' && p.side === -1;
    over = youWon ? 'You won!' : youLost ? 'Labcoon won' : 'Draw';
    speak(say(youWon ? 'lose' : youLost ? 'win' : 'draw')); sfx(youWon ? 'win' : youLost ? 'lose' : 'crown');
    if (!reported) { reported = true; onResult?.({game: 'chess', result: youWon ? 'win' : youLost ? 'loss' : 'draw', moves: p.history.length}); }
    render();
  }
  function click(i, legal) {
    if (over || p.side !== 1) return;
    if (sel != null) {
      const m = Chess.find(p, sel, i);
      if (m != null) {
        const [san, took] = Chess.play(p, m); sel = null;
        sfx(took ? 'capture' : 'place'); if (san.includes('+')) setTimeout(() => sfx('check'), 140);
        if (took) speak(say('lost'));
        render(); if (over) return;
        if (Chess.status(p)[1]) speak(say('inCheck'));
        setTimeout(himMove, 500 + Math.random() * 500);
        return;
      }
    }
    sel = legal.some(([a]) => a === i) ? i : null;
    sfx(sel != null ? 'pick' : 'tick');
    render();
  }
  function himMove() {
    if (over || !root.isConnected) return;
    speak(say('think'));
    setTimeout(() => {
      if (over || !root.isConnected) return;
      const m = Chess.bestMove(p, Chess.botOpts(LEVEL[level]));
      if (m == null) return render();
      const [san, took] = Chess.play(p, m);
      sfx(took ? 'lost' : 'his'); if (san.includes('+')) setTimeout(() => sfx('check'), 140);
      speak(san.includes('#') ? say('win') : san.includes('+') ? say('check') : took ? say('took') : say('after'));
      render();
    }, 350);
  }
  root.querySelector('#gameNew').addEventListener('click', () => {
    if (!over && p.history.length > 4 && !reported) { reported = true; onResult?.({game: 'chess', result: 'loss', moves: p.history.length, resigned: true}); }
    start();
  });
  start();
}
