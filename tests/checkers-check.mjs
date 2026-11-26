// Checkers rules + how beatable Labcoon is. A "sensible" player takes the longest jump and avoids hanging pieces.
import * as C from '../pond/games/checkers.js';
const sensible = b => { const ms = C.legalMoves(b, C.YOU); const safe = ms.filter(m => !C.legalMoves(C.play(b, m), C.HIM).some(x => x.taken.length));
  const pool = ms.some(m => m.taken.length) ? ms.sort((a, z) => z.taken.length - a.taken.length).filter((m, _, a) => m.taken.length === a[0].taken.length) : safe.length ? safe : ms;
  return pool[Math.floor(Math.random() * pool.length)]; };
for (const [label, you] of [['random', b => { const ms = C.legalMoves(b, C.YOU); return ms[Math.floor(Math.random() * ms.length)]; }], ['sensible', sensible]]) {
  const wins = {1: 0, 2: 0, long: 0};
  for (let g = 0; g < 300; g++) {
    let b = C.newBoard(), turn = C.YOU, n = 0;
    while (n++ < 300) {
      const ms = C.legalMoves(b, turn); if (!ms.length) break;
      if (ms.some(m => m.taken.length) && ms.some(m => !m.taken.length)) throw new Error('capture not compulsory');
      b = C.play(b, turn === C.YOU ? you(b) : C.labcoonMove(b));
      const w = C.winner(b, turn === C.YOU ? C.HIM : C.YOU); if (w) { wins[w]++; break; }
      turn = turn === C.YOU ? C.HIM : C.YOU;
    }
    if (n >= 300) wins.long++;
  }
  console.log(`vs a ${label} player (300 games): Labcoon ${wins[2]} · player ${wins[1]} · very long ${wins.long}`);
}
