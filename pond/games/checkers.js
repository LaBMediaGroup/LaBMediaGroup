/* Checkers (English draughts) against Labcoon. Rules: 8×8, dark squares, men move forward, kings both
   ways, captures are compulsory and multi-jumps continue, reaching the far row crowns. A side with no
   legal move loses.
   Labcoon plays like a raccoon: he can't resist a jump (takes the longest capture chain), likes to keep
   his pieces together, and is easy on purpose (a dose of randomness), so most people can beat him. */
export const EMPTY = 0, YOU = 1, HIM = 2;
export function newBoard() {
  const b = Array.from({length: 8}, () => Array(8).fill(null));
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) {
    if (r < 3) b[r][c] = {side: HIM, king: false};
    else if (r > 4) b[r][c] = {side: YOU, king: false};
  }
  return b;
}
const clone = b => b.map(row => row.map(p => p && {...p}));
const dirs = p => p.king ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : p.side === YOU ? [[-1, 1], [-1, -1]] : [[1, 1], [1, -1]];
const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

// all capture chains from one piece: [{path:[[r,c],...], taken:[[r,c],...]}]
function jumps(b, r, c, p, path = [[r, c]], taken = []) {
  const out = [];
  for (const [dr, dc] of dirs(p)) {
    const mr = r + dr, mc = c + dc, tr = r + 2 * dr, tc = c + 2 * dc;
    if (!inside(tr, tc) || b[tr][tc] || !b[mr][mc] || b[mr][mc].side === p.side || taken.some(([a, d]) => a === mr && d === mc)) continue;
    const nb = clone(b); nb[tr][tc] = nb[r][c]; nb[r][c] = null; nb[mr][mc] = null;
    const crowned = !p.king && (tr === 0 || tr === 7);
    const next = crowned ? [] : jumps(nb, tr, tc, p, [...path, [tr, tc]], [...taken, [mr, mc]]);
    if (next.length) out.push(...next); else out.push({path: [...path, [tr, tc]], taken: [...taken, [mr, mc]]});
  }
  return out;
}
export function legalMoves(b, side) {
  const caps = [], steps = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c]; if (!p || p.side !== side) continue;
    caps.push(...jumps(b, r, c, p));
    for (const [dr, dc] of dirs(p)) { const tr = r + dr, tc = c + dc; if (inside(tr, tc) && !b[tr][tc]) steps.push({path: [[r, c], [tr, tc]], taken: []}); }
  }
  return caps.length ? caps : steps;                       // captures are compulsory
}
export function play(b, m) {
  const nb = clone(b), [r0, c0] = m.path[0], [r1, c1] = m.path.at(-1), p = nb[r0][c0];
  nb[r0][c0] = null; for (const [r, c] of m.taken) nb[r][c] = null;
  nb[r1][c1] = p; if (!p.king && ((p.side === YOU && r1 === 0) || (p.side === HIM && r1 === 7))) p.king = true;
  return nb;
}
export function count(b, side) { let n = 0; for (const row of b) for (const p of row) if (p?.side === side) n++; return n; }
export function winner(b, toMove) {
  if (!count(b, YOU)) return HIM; if (!count(b, HIM)) return YOU;
  if (!legalMoves(b, toMove).length) return toMove === YOU ? HIM : YOU;
  return 0;
}
// Labcoon's move: the longest jump chain if he has one; otherwise a move that doesn't hand you a capture,
// preferring to advance and to stay near friends, with some raccoon randomness.
export function labcoonMove(b, sloppiness = .25, distracted = .3) {
  const moves = legalMoves(b, HIM); if (!moves.length) return null;
  if (Math.random() < distracted) return moves[Math.floor(Math.random() * moves.length)];   // something shiny caught his eye
  const score = m => {
    const nb = play(b, m), [r, c] = m.path.at(-1);
    let s = m.taken.length * 10;
    if (legalMoves(nb, YOU).some(x => x.taken.length)) s -= 6;              // don't hang a piece
    s += r * .3;                                                          // forward
    for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) if (inside(r + dr, c + dc) && nb[r + dr][c + dc]?.side === HIM) s += .6;
    if (!b[m.path[0][0]][m.path[0][1]].king && nb[r][c].king) s += 4;      // crowning is shiny
    return s + Math.random() * 6 * sloppiness;
  };
  return moves.map(m => [score(m), m]).sort((a, z) => z[0] - a[0])[0][1];
}
export const LINES = {
  start: ['bottle caps are mine. you get the acorns.', 'ok. i go second. that’s polite.', 'checkers. i know this one. mostly.'],
  jumpYou: ['hey. HEY.', 'that was my good cap.', 'mm. sneaky.'],
  jumpHim: ['ha. got it.', 'mine now. into the stash.', 'shiny trade.'],
  king: ['a crown! i feel tall.', 'crowned. very fancy.'],
  youKing: ['you got a crown. show-off.'],
  think: ['hm…', 'thinking…', '*sniffs the board*'],
  after: ['your turn.', 'ok. go.', 'your move, acorn person.', 'there. beat that.', '*taps the table*'],
  win: ['i won? i WON. stash-worthy.', 'good game. i’m keeping that feeling.'],
  lose: ['you beat me. again tomorrow?', 'ok, you’re good. i’m washing my caps.', 'hmph. rematch later.'],
};
export const say = k => LINES[k][Math.floor(Math.random() * LINES[k].length)];
