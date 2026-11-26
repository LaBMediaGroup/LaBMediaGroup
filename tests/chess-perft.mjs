// Checks the chess engine port (pond/games/chess-engine.js) against the Luau
// original's numbers: perft on four standard positions, the endings, FEN
// round trips, SAN, and a legal bot move at every level and boss.
// Run: node tests/chess-perft.mjs
import * as Chess from "../pond/games/chess-engine.js";

let failures = 0;
const check = (ok, label) => {
	console.log(`${ok ? "ok  " : "FAIL"} ${label}`);
	if (!ok) failures++;
};

// ---- perft
const WANT = [
	["start", Chess.START, [20, 400, 8902]],
	["kiwipete", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1", [48, 2039]],
	["position 3", "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1", [14, 191, 2812]],
	["position 4", "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", [6, 264, 9467]],
];
console.log("-- perft");
for (const [name, fen, counts] of WANT) {
	const p = Chess.new(fen);
	counts.forEach((want, i) => {
		const t0 = performance.now();
		const got = Chess.perft(p, i + 1);
		const ms = (performance.now() - t0).toFixed(1);
		check(got === want, `${name} d${i + 1}: ${got} (want ${want}) ${ms} ms`);
	});
	check(Chess.fen(p) === fen, `${name}: FEN unchanged after perft (make/unmake restores)`);
}

// ---- endings
console.log("-- endings");
const ending = (fen, want, label) => {
	const [got, inCheck] = Chess.status(Chess.new(fen));
	check(got === want, `${label}: ${got}${inCheck ? " (in check)" : ""}`);
};
ending("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3", "checkmate", "fool's mate (FEN)");
ending("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1", "stalemate", "stalemate");
ending("8/8/8/4k3/8/8/2B5/4K3 w - - 0 1", "material", "K+B v K");
ending("4k3/8/8/8/8/8/4P3/4K3 w - - 100 80", "fifty", "50-move rule");
ending(Chess.START, "play", "start position");

// fool's mate played from UI squares (0..63, a1 = 0): f3 e5 g4 Qh4#
{
	const sq = (n) => (n.charCodeAt(1) - 49) * 8 + (n.charCodeAt(0) - 97);
	const p = Chess.new();
	const sans = [];
	for (const [f, t] of [["f2", "f3"], ["e7", "e5"], ["g2", "g4"], ["d8", "h4"]]) {
		const m = Chess.find(p, sq(f), sq(t));
		if (m === null) { check(false, `find ${f}-${t}`); break; }
		const [s] = Chess.play(p, m);
		sans.push(s);
	}
	check(sans.join(" ") === "f3 e5 g4 Qh4#", `played SAN: ${sans.join(" ")}`);
	const [result, inCheck] = Chess.status(p);
	check(result === "checkmate" && inCheck, `fool's mate played: ${result}`);
	check(Chess.find(p, sq("e1"), sq("f2")) === null, "no legal move after mate");
	check(JSON.stringify(p.last) === JSON.stringify([sq("d8"), sq("h4")]), `last move squares ${p.last}`);
}

// threefold by shuffling knights
{
	const p = Chess.new();
	const sq = (n) => (n.charCodeAt(1) - 49) * 8 + (n.charCodeAt(0) - 97);
	const shuffle = [["g1", "f3"], ["g8", "f6"], ["f3", "g1"], ["f6", "g8"]];
	for (let r = 0; r < 2; r++) for (const [f, t] of shuffle) Chess.play(p, Chess.find(p, sq(f), sq(t)));
	check(Chess.status(p)[0] === "threefold", `threefold after two knight shuffles: ${Chess.status(p)[0]}`);
}

// SAN details: castling, en passant, promotion, disambiguation
{
	const sanOf = (fen, from, to, promo) => {
		const p = Chess.new(fen);
		const m = Chess.find(p, from, to, promo);
		return m === null ? null : Chess.san(p, m);
	};
	check(sanOf("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1", 4, 6) === "O-O", "SAN O-O");
	check(sanOf("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1", 4, 2) === "O-O-O", "SAN O-O-O");
	check(sanOf("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1", 36, 43) === "exd6", "SAN en passant exd6");
	check(sanOf("8/P6k/8/8/8/8/8/4K3 w - - 0 1", 48, 56, 2) === "a8=N", "SAN underpromotion a8=N");
	check(sanOf("8/P6k/8/8/8/8/8/4K3 w - - 0 1", 48, 56) === "a8=Q", "SAN default promotion a8=Q");
	check(sanOf("4k3/8/8/8/8/8/4K3/R6R w - - 0 1", 0, 3) === "Rad1", "SAN file disambiguation Rad1");
	check(sanOf("4k3/8/8/R7/8/8/4K3/R7 w - - 0 1", 0, 8) === "R1a2", "SAN rank disambiguation R1a2");
}

// ---- FEN round trips
console.log("-- FEN");
for (const f of [
	Chess.START,
	"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
	"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
	"8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1",
	"r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1",
	"4k3/8/8/8/8/8/4P3/4K3 b - - 100 80",
]) {
	const back = Chess.fen(Chess.new(f));
	check(back === f, `round trip ${f}${back === f ? "" : " -> " + back}`);
}
{
	const [p, err] = Chess.fromFen("8/8/8/8/8/8/8/8 w - - 0 1");
	check(p === null && err === "each side needs a king", `bad FEN rejected: ${err}`);
	const p2 = Chess.new();
	Chess.play(p2, Chess.find(p2, 12, 28)); // e2e4
	check(Chess.fen(p2) === "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1", `after e4: ${Chess.fen(p2)}`);
}

// ---- selfTest (the Luau module's own check)
{
	const [ok, report] = Chess.selfTest();
	check(ok, "selfTest()");
	if (!ok) console.log(report);
}

// ---- the bot
console.log("-- bot (time per move, from the start position)");
const legalFrom = (p, m) => Chess.legalMoves(p).includes(m);
const timeMove = (p, opts) => {
	const t0 = performance.now();
	const m = Chess.bestMove(p, opts);
	return [m, performance.now() - t0];
};
for (const level of Chess.LEVELS) {
	const p = Chess.new();
	const [m, ms] = timeMove(p, Chess.botOpts(level));
	check(m !== null && legalFrom(p, m), `${level.id.padEnd(10)} ${m === null ? "none" : Chess.san(p, m).padEnd(5)} ${ms.toFixed(0).padStart(5)} ms`);
}
for (const boss of Chess.BOSSES) {
	const p = Chess.new();
	if (boss.color === -1) Chess.play(p, Chess.find(p, 12, 28)); // 1. e4 so the boss moves as black
	const [m, ms] = timeMove(p, Chess.botOpts(boss));
	check(m !== null && legalFrom(p, m), `${boss.id.padEnd(10)} ${m === null ? "none" : Chess.san(p, m).padEnd(5)} ${ms.toFixed(0).padStart(5)} ms`);
}
// a middlegame for the deeper ones (more pieces in contact)
{
	const mid = "r1bq1rk1/pp2bppp/2n1pn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQ1RK1 w - - 0 8";
	for (const id of ["MEDIUM", "HARD", "Overlord"]) {
		const p = Chess.new(mid);
		const [m, ms] = timeMove(p, Chess.botOpts(id));
		check(m !== null && legalFrom(p, m), `${id.padEnd(10)} middlegame ${m === null ? "none" : Chess.san(p, m).padEnd(5)} ${ms.toFixed(0).padStart(5)} ms`);
	}
}
// sees a mate in one, and returns null with no moves
{
	const p = Chess.new("6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1");
	const m = Chess.bestMove(p, Chess.botOpts("HARD"));
	check(m !== null && Chess.san(p, m) === "Ra8#", `HARD finds back-rank mate: ${m === null ? "none" : Chess.san(p, m)}`);
	const mated = Chess.new("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3");
	check(Chess.bestMove(mated, Chess.botOpts("HARD")) === null, "bestMove null when mated");
}
// the boss book: RUSTBUCKET opens 1. e4 (its book move, +40)
{
	const p = Chess.new();
	const m = Chess.bestMove(p, Chess.botOpts("Rustbucket", { noise: 0 }));
	console.log(`     Rustbucket (noise 0) opens ${Chess.san(p, m)}`);
}

console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
