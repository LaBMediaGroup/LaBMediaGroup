// chess-engine.js: a pure chess rules engine + bot, as a dependency-free ES
// module for the browser.
//
// PORT: translated line for line from the Luau module
//   project-gate0/src/shared/Chess/init.lua  (CHESS, #223)
// with the bot levels + boss ladder from project-gate0/src/shared/Chess/Config.lua.
// Same board, same move encoding, same piece-square tables, same ordering,
// same node cap + time box. Lua multi-returns come back as arrays, in order.
//
//   · the board is 0x88 (sq = rank * 16 + file, a1 = 0, h8 = 119); outside
//     this module squares are 0..63 (rank * 8 + file, a1 = 0)
//   · pieces: 1 pawn, 2 knight, 3 bishop, 4 rook, 5 queen, 6 king; white
//     positive, black negative, 0 empty
//   · full legal moves: castling, en passant, promotion; check / checkmate /
//     stalemate, threefold repetition, the 50-move rule, insufficient
//     material; FEN in and out; SAN for the move list
//   · the bot: negamax with alpha-beta, quiescence, MVV-LVA ordering and
//     piece-square tables, iterative deepening under a node + time cap. It
//     calls opts.yield (optional, synchronous) every 2048 nodes.
//   · selfTest(): perft on four standard positions (the start to depth 3 =
//     8,902) and the endings.

export const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// (index 0 unused so piece type t reads LETTERS[t], as in Lua)
const LETTERS = ["", "p", "n", "b", "r", "q", "k"];
const SAN_LETTERS = ["", "", "N", "B", "R", "Q", "K"];
const FILES = "abcdefgh";

const KNIGHT = [33, 31, 18, 14, -33, -31, -18, -14];
const KING = [1, -1, 16, -16, 17, 15, -17, -15];
const DIAG = [17, 15, -17, -15];
const ORTHO = [1, -1, 16, -16];

// castling rights kept after a move touches a square
const KEEP = new Array(128).fill(15);
KEEP[0] = 13; KEEP[7] = 14; KEEP[4] = 12;
KEEP[112] = 7; KEEP[119] = 11; KEEP[116] = 3;

// Lua's tonumber for the FEN number fields (nil -> null)
function toNumber(s) {
	if (typeof s !== "string" || s.trim() === "") return null;
	const n = Number(s.trim());
	return Number.isNaN(n) ? null : n;
}
const isDigit = (c) => c >= "0" && c <= "9" && c.length === 1;

// ------------------------------------------------------------------ squares
export function to88(i) {
	return Math.floor(i / 8) * 16 + (i % 8);
}

export function from88(sq) {
	return Math.floor(sq / 16) * 8 + (sq % 16);
}

export function squareName(i) {
	return FILES[i % 8] + String(Math.floor(i / 8) + 1);
}

function name88(sq) {
	return squareName(from88(sq));
}

// ------------------------------------------------------------------ moves
// a move is one number: from + to * 128 + flag * 16384 + promo * 65536
// (flag 1 a double push, 2 en passant, 3 castling; promo 2..5)
function enc(from, to, flag, promo) {
	return from + to * 128 + flag * 16384 + promo * 65536;
}

// -> [from, to, flag, promo] (0x88 squares)
export function decode(m) {
	return [m % 128, Math.floor(m / 128) % 128, Math.floor(m / 16384) % 4, Math.floor(m / 65536)];
}

// ------------------------------------------------------------------ positions
function blank() {
	return {
		b: new Int8Array(128), // 0x88 squares -> piece
		side: 1, // 1 white to move, -1 black
		castle: 0, // bits: 1 white O-O, 2 white O-O-O, 4 black O-O, 8 black O-O-O
		ep: -1, // the en passant target square (0x88), -1 none
		half: 0, // halfmoves since a capture or pawn move
		full: 1,
		kw: -1,
		kb: -1,
		ply: 0, // the make/unmake stack depth
		uCap: [],
		uCapSq: [],
		uCastle: [],
		uEp: [],
		uHalf: [],
		rep: Object.create(null), // repetition counts by position key (played moves only)
		history: [], // the played moves in SAN
		last: null, // the last move played [from, to], 0..63
	};
}

// a position from FEN -> [pos, null], or [null, why] for a bad one
export function fromFen(fen) {
	const text = fen ?? START;
	const fields = text.split(" ");
	const p = blank();
	let rank = 7, file = 0;
	const place = fields[0];
	for (let i = 0; i < place.length; i++) {
		const c = place[i];
		if (c === "/") {
			rank -= 1;
			file = 0;
		} else if (isDigit(c)) {
			file += Number(c);
		} else {
			const lower = c.toLowerCase();
			const t = LETTERS.indexOf(lower, 1);
			if (t < 1 || rank < 0 || file > 7) {
				return [null, "bad piece placement"];
			}
			const sq = rank * 16 + file;
			const piece = c === lower ? -t : t;
			p.b[sq] = piece;
			if (piece === 6) p.kw = sq;
			else if (piece === -6) p.kb = sq;
			file += 1;
		}
	}
	if (p.kw < 0 || p.kb < 0) {
		return [null, "each side needs a king"];
	}
	p.side = fields[1] === "b" ? -1 : 1;
	const c = fields[2] ?? "-";
	p.castle = (c.includes("K") ? 1 : 0) + (c.includes("Q") ? 2 : 0) + (c.includes("k") ? 4 : 0) + (c.includes("q") ? 8 : 0);
	// rights only stand with the king and rook at home
	if (p.b[4] !== 6) p.castle &= 12;
	if (p.b[116] !== -6) p.castle &= 3;
	if (p.b[7] !== 4) p.castle &= 14;
	if (p.b[0] !== 4) p.castle &= 13;
	if (p.b[119] !== -4) p.castle &= 11;
	if (p.b[112] !== -4) p.castle &= 7;
	const ep = fields[3] ?? "-";
	if (ep !== "-" && ep.length === 2) {
		const f = FILES.indexOf(ep[0]);
		const r = isDigit(ep[1]) ? Number(ep[1]) : null;
		if (f >= 0 && r !== null) {
			p.ep = (r - 1) * 16 + f;
		}
	}
	p.half = toNumber(fields[4]) ?? 0;
	p.full = toNumber(fields[5]) ?? 1;
	p.rep[key(p)] = 1;
	return [p, null];
}

// a position from FEN (the start position for a bad or missing one).
// Exported as `newPos` and as `new` (import * as Chess; Chess.new(fen)).
export function newPos(fen) {
	const [p] = fromFen(fen);
	return p ?? fromFen(START)[0];
}
export { newPos as new };

// the placement field of FEN
export function placement(p) {
	const rows = [];
	for (let rank = 7; rank >= 0; rank--) {
		let row = "", empty = 0;
		for (let file = 0; file <= 7; file++) {
			const piece = p.b[rank * 16 + file];
			if (piece === 0) {
				empty += 1;
			} else {
				if (empty > 0) {
					row += String(empty);
					empty = 0;
				}
				const l = LETTERS[Math.abs(piece)];
				row += piece > 0 ? l.toUpperCase() : l;
			}
		}
		if (empty > 0) row += String(empty);
		rows.push(row);
	}
	return rows.join("/");
}

function castleText(c) {
	const s = ((c & 1) !== 0 ? "K" : "") + ((c & 2) !== 0 ? "Q" : "") + ((c & 4) !== 0 ? "k" : "") + ((c & 8) !== 0 ? "q" : "");
	return s === "" ? "-" : s;
}

export function fen(p) {
	return `${placement(p)} ${p.side === 1 ? "w" : "b"} ${castleText(p.castle)} ${p.ep >= 0 ? name88(p.ep) : "-"} ${Math.trunc(p.half)} ${Math.trunc(p.full)}`;
}

// the repetition key: placement, side, castling, and the en passant square
// only when a pawn could take there
export function key(p) {
	let ep = "-";
	if (p.ep >= 0) {
		const from = p.ep - 16 * p.side; // the squares a capturer stands on
		for (const d of [-1, 1]) {
			const s = from + d;
			if ((s & 0x88) === 0 && p.b[s] === p.side) {
				ep = name88(p.ep);
			}
		}
	}
	return placement(p) + (p.side === 1 ? "w" : "b") + castleText(p.castle) + ep;
}

// ------------------------------------------------------------------ attacks
// is sq attacked by side `by` (1 white, -1 black)?
export function attacked(p, sq, by) {
	const b = p.b;
	// pawns: a white pawn on s attacks s + 15 and s + 17
	const back = by === 1 ? -15 : 15;
	const back2 = by === 1 ? -17 : 17;
	let s = sq + back;
	if ((s & 0x88) === 0 && b[s] === by) return true;
	s = sq + back2;
	if ((s & 0x88) === 0 && b[s] === by) return true;
	const knight = 2 * by, king = 6 * by;
	for (const d of KNIGHT) {
		s = sq + d;
		if ((s & 0x88) === 0 && b[s] === knight) return true;
	}
	for (const d of KING) {
		s = sq + d;
		if ((s & 0x88) === 0 && b[s] === king) return true;
	}
	const bishop = 3 * by, rook = 4 * by, queen = 5 * by;
	for (const d of DIAG) {
		s = sq + d;
		while ((s & 0x88) === 0) {
			const q = b[s];
			if (q !== 0) {
				if (q === bishop || q === queen) return true;
				break;
			}
			s += d;
		}
	}
	for (const d of ORTHO) {
		s = sq + d;
		while ((s & 0x88) === 0) {
			const q = b[s];
			if (q !== 0) {
				if (q === rook || q === queen) return true;
				break;
			}
			s += d;
		}
	}
	return false;
}

export function inCheck(p) {
	return attacked(p, p.side === 1 ? p.kw : p.kb, -p.side);
}

// ------------------------------------------------------------------ generation
// every pseudo-legal move for the side to move (capturesOnly: captures and
// promotions, for the quiescence search)
function pseudo(p, capturesOnly) {
	const out = [];
	const b = p.b, side = p.side;
	const dir = 16 * side;
	const startRank = side === 1 ? 1 : 6;
	const promoRank = side === 1 ? 7 : 0;
	for (let sq = 0; sq <= 119; sq++) {
		if ((sq & 0x88) !== 0) continue;
		const piece = b[sq];
		if (piece === 0 || (piece > 0) !== (side > 0)) continue;
		const t = piece > 0 ? piece : -piece;
		if (t === 1) {
			const one = sq + dir;
			if ((one & 0x88) === 0 && b[one] === 0) {
				if (one >> 4 === promoRank) {
					for (let promo = 5; promo >= 2; promo--) out.push(enc(sq, one, 0, promo));
				} else if (!capturesOnly) {
					out.push(enc(sq, one, 0, 0));
					const two = one + dir;
					if (sq >> 4 === startRank && b[two] === 0) {
						out.push(enc(sq, two, 1, 0));
					}
				}
			}
			for (const d of [dir - 1, dir + 1]) {
				const to = sq + d;
				if ((to & 0x88) === 0) {
					const q = b[to];
					if (q !== 0 && (q > 0) !== (side > 0)) {
						if (to >> 4 === promoRank) {
							for (let promo = 5; promo >= 2; promo--) out.push(enc(sq, to, 0, promo));
						} else {
							out.push(enc(sq, to, 0, 0));
						}
					} else if (to === p.ep) {
						out.push(enc(sq, to, 2, 0));
					}
				}
			}
		} else if (t === 2 || t === 6) {
			const steps = t === 2 ? KNIGHT : KING;
			for (const d of steps) {
				const to = sq + d;
				if ((to & 0x88) === 0) {
					const q = b[to];
					if (q === 0) {
						if (!capturesOnly) out.push(enc(sq, to, 0, 0));
					} else if ((q > 0) !== (side > 0)) {
						out.push(enc(sq, to, 0, 0));
					}
				}
			}
			if (t === 6 && !capturesOnly) {
				// castling: rights, an empty path, and no square the king
				// crosses under attack
				const home = side === 1 ? 4 : 116;
				const kBit = side === 1 ? 1 : 4;
				const qBit = side === 1 ? 2 : 8;
				if (sq === home) {
					if ((p.castle & kBit) !== 0 && b[home + 1] === 0 && b[home + 2] === 0 && b[home + 3] === 4 * side) {
						if (!attacked(p, home, -side) && !attacked(p, home + 1, -side) && !attacked(p, home + 2, -side)) {
							out.push(enc(home, home + 2, 3, 0));
						}
					}
					if ((p.castle & qBit) !== 0 && b[home - 1] === 0 && b[home - 2] === 0 && b[home - 3] === 0 && b[home - 4] === 4 * side) {
						if (!attacked(p, home, -side) && !attacked(p, home - 1, -side) && !attacked(p, home - 2, -side)) {
							out.push(enc(home, home - 2, 3, 0));
						}
					}
				}
			}
		} else {
			const dirs = t === 3 ? DIAG : t === 4 ? ORTHO : KING;
			for (const d of dirs) {
				let to = sq + d;
				while ((to & 0x88) === 0) {
					const q = b[to];
					if (q === 0) {
						if (!capturesOnly) out.push(enc(sq, to, 0, 0));
					} else {
						if ((q > 0) !== (side > 0)) out.push(enc(sq, to, 0, 0));
						break;
					}
					to += d;
				}
			}
		}
	}
	return out;
}

// ------------------------------------------------------------------ make / unmake
export function make(p, m) {
	const [from, to, flag, promo] = decode(m);
	const b = p.b;
	const piece = b[from];
	const ply = p.ply + 1;
	p.ply = ply;
	p.uCastle[ply] = p.castle;
	p.uEp[ply] = p.ep;
	p.uHalf[ply] = p.half;
	let capSq = to;
	if (flag === 2) capSq = to - 16 * p.side;
	const cap = b[capSq];
	p.uCap[ply] = cap;
	p.uCapSq[ply] = capSq;
	b[capSq] = 0;
	b[from] = 0;
	b[to] = promo > 0 ? promo * p.side : piece;
	if (flag === 3) {
		if (to > from) {
			b[from + 1] = b[from + 3];
			b[from + 3] = 0;
		} else {
			b[from - 1] = b[from - 4];
			b[from - 4] = 0;
		}
	}
	if (piece === 6) p.kw = to;
	else if (piece === -6) p.kb = to;
	p.half = piece === 1 || piece === -1 || cap !== 0 ? 0 : p.half + 1;
	p.ep = flag === 1 ? (from + to) >> 1 : -1;
	p.castle = p.castle & KEEP[from] & KEEP[to];
	if (p.side === -1) p.full += 1;
	p.side = -p.side;
}

export function unmake(p, m) {
	const [from, to, flag, promo] = decode(m);
	const b = p.b;
	const ply = p.ply;
	p.side = -p.side;
	if (p.side === -1) p.full -= 1;
	const piece = promo > 0 ? p.side : b[to];
	b[from] = piece;
	b[to] = 0;
	b[p.uCapSq[ply]] = p.uCap[ply];
	if (flag === 3) {
		if (to > from) {
			b[from + 3] = b[from + 1];
			b[from + 1] = 0;
		} else {
			b[from - 4] = b[from - 1];
			b[from - 1] = 0;
		}
	}
	if (piece === 6) p.kw = from;
	else if (piece === -6) p.kb = from;
	p.castle = p.uCastle[ply];
	p.ep = p.uEp[ply];
	p.half = p.uHalf[ply];
	p.ply = ply - 1;
}

// is the move just made legal (the mover's king not left attacked)?
function leftSafe(p) {
	// p.side is now the opponent: the mover is -p.side
	return !attacked(p, p.side === 1 ? p.kb : p.kw, p.side);
}

export function legalMoves(p) {
	const out = [];
	for (const m of pseudo(p)) {
		make(p, m);
		if (leftSafe(p)) out.push(m);
		unmake(p, m);
	}
	return out;
}

// the legal move from -> to (0..63), or null; promo 2..5 (a promotion with
// none given is a queen)
export function find(p, from, to, promo) {
	if (typeof from !== "number" || typeof to !== "number" || Number.isNaN(from) || Number.isNaN(to)) {
		return null;
	}
	from = Math.floor(from);
	to = Math.floor(to);
	if (from < 0 || from > 63 || to < 0 || to > 63) return null;
	const f88 = to88(from), t88 = to88(to);
	const want = typeof promo === "number" && promo >= 2 && promo <= 5 ? Math.floor(promo) : 5;
	for (const m of legalMoves(p)) {
		const [mf, mt, , mp] = decode(m);
		if (mf === f88 && mt === t88 && (mp === 0 || mp === want)) return m;
	}
	return null;
}

// ------------------------------------------------------------------ the result
// "play", or how it ended: "checkmate" (the side to move lost), "stalemate",
// "threefold", "fifty", "material"
function insufficient(p) {
	let minors = 0;
	const bishops = [];
	for (let sq = 0; sq <= 119; sq++) {
		if ((sq & 0x88) === 0) {
			const t = Math.abs(p.b[sq]);
			if (t === 1 || t === 4 || t === 5) {
				return false;
			} else if (t === 2 || t === 3) {
				minors += 1;
				if (t === 3) bishops.push(((sq >> 4) + (sq % 16)) % 2);
			}
		}
	}
	if (minors <= 1) return true;
	// only bishops, all on one colour of square
	if (minors === bishops.length) {
		for (const c of bishops) {
			if (c !== bishops[0]) return false;
		}
		return true;
	}
	return false;
}

// -> [result, check]: result is "play" | "checkmate" | "stalemate" |
// "material" | "threefold" | "fifty"; check: the side to move is in check
export function status(p) {
	const check = inCheck(p);
	if (legalMoves(p).length === 0) {
		return [check ? "checkmate" : "stalemate", check];
	}
	if (insufficient(p)) return ["material", check];
	if ((p.rep[key(p)] ?? 0) >= 3) return ["threefold", check];
	if (p.half >= 100) return ["fifty", check];
	return ["play", check];
}

// the move in SAN (call before it's played)
export function san(p, m) {
	const [from, to, flag, promo] = decode(m);
	const piece = p.b[from];
	const t = Math.abs(piece);
	let s;
	if (flag === 3) {
		s = to > from ? "O-O" : "O-O-O";
	} else {
		const capture = p.b[to] !== 0 || flag === 2;
		s = SAN_LETTERS[t];
		if (t === 1) {
			if (capture) s = FILES[from % 16];
		} else {
			let sameFile = false, sameRank = false, other = false;
			for (const o of legalMoves(p)) {
				const [of, ot] = decode(o);
				if (ot === to && of !== from && p.b[of] === piece) {
					other = true;
					sameFile = sameFile || of % 16 === from % 16;
					sameRank = sameRank || of >> 4 === from >> 4;
				}
			}
			if (other) {
				if (!sameFile) s += FILES[from % 16];
				else if (!sameRank) s += String((from >> 4) + 1);
				else s += name88(from);
			}
		}
		if (capture) s += "x";
		s += name88(to);
		if (promo > 0) s += "=" + SAN_LETTERS[promo];
	}
	make(p, m);
	if (inCheck(p)) s += legalMoves(p).length === 0 ? "#" : "+";
	unmake(p, m);
	return s;
}

// play a legal move for good: SAN in the history, the repetition count, the
// last-move squares. Returns [san, took] (took: a piece code, 0 none)
export function play(p, m) {
	const sanText = san(p, m);
	const [from, to, flag] = decode(m);
	const took = flag === 2 ? -p.side : p.b[to];
	make(p, m);
	// (a played move can't be unmade: the stack stays small)
	p.ply = 0;
	p.history.push(sanText);
	const k = key(p);
	p.rep[k] = (p.rep[k] ?? 0) + 1;
	p.last = [from88(from), from88(to)];
	return [sanText, took];
}

// 64 piece codes, a1 first (index 0 = a1, 63 = h8)
export function board64(p) {
	const out = new Array(64).fill(0);
	for (let i = 0; i < 64; i++) out[i] = p.b[to88(i)];
	return out;
}

// the move as 0..63 squares + promo -> [from, to, promo]
export function parts(m) {
	const [from, to, , promo] = decode(m);
	return [from88(from), from88(to), promo];
}

// ------------------------------------------------------------------ the bot
const VALUE = [0, 100, 320, 330, 500, 900, 0]; // (index = piece type)
// piece-square tables, a8 first (white's view; black reads them mirrored)
const PST = [
	null,
	[ // pawn
		0, 0, 0, 0, 0, 0, 0, 0,
		50, 50, 50, 50, 50, 50, 50, 50,
		10, 10, 20, 30, 30, 20, 10, 10,
		5, 5, 10, 25, 25, 10, 5, 5,
		0, 0, 0, 20, 20, 0, 0, 0,
		5, -5, -10, 0, 0, -10, -5, 5,
		5, 10, 10, -20, -20, 10, 10, 5,
		0, 0, 0, 0, 0, 0, 0, 0,
	],
	[ // knight
		-50, -40, -30, -30, -30, -30, -40, -50,
		-40, -20, 0, 0, 0, 0, -20, -40,
		-30, 0, 10, 15, 15, 10, 0, -30,
		-30, 5, 15, 20, 20, 15, 5, -30,
		-30, 0, 15, 20, 20, 15, 0, -30,
		-30, 5, 10, 15, 15, 10, 5, -30,
		-40, -20, 0, 5, 5, 0, -20, -40,
		-50, -40, -30, -30, -30, -30, -40, -50,
	],
	[ // bishop
		-20, -10, -10, -10, -10, -10, -10, -20,
		-10, 0, 0, 0, 0, 0, 0, -10,
		-10, 0, 5, 10, 10, 5, 0, -10,
		-10, 5, 5, 10, 10, 5, 5, -10,
		-10, 0, 10, 10, 10, 10, 0, -10,
		-10, 10, 10, 10, 10, 10, 10, -10,
		-10, 5, 0, 0, 0, 0, 5, -10,
		-20, -10, -10, -10, -10, -10, -10, -20,
	],
	[ // rook
		0, 0, 0, 0, 0, 0, 0, 0,
		5, 10, 10, 10, 10, 10, 10, 5,
		-5, 0, 0, 0, 0, 0, 0, -5,
		-5, 0, 0, 0, 0, 0, 0, -5,
		-5, 0, 0, 0, 0, 0, 0, -5,
		-5, 0, 0, 0, 0, 0, 0, -5,
		-5, 0, 0, 0, 0, 0, 0, -5,
		0, 0, 0, 5, 5, 0, 0, 0,
	],
	[ // queen
		-20, -10, -10, -5, -5, -10, -10, -20,
		-10, 0, 0, 0, 0, 0, 0, -10,
		-10, 0, 5, 5, 5, 5, 0, -10,
		-5, 0, 5, 5, 5, 5, 0, -5,
		0, 0, 5, 5, 5, 5, 0, -5,
		-10, 5, 5, 5, 5, 5, 0, -10,
		-10, 0, 5, 0, 0, 0, 0, -10,
		-20, -10, -10, -5, -5, -10, -10, -20,
	],
	[ // king, middle game: stay home behind the pawns
		-30, -40, -40, -50, -50, -40, -40, -30,
		-30, -40, -40, -50, -50, -40, -40, -30,
		-30, -40, -40, -50, -50, -40, -40, -30,
		-30, -40, -40, -50, -50, -40, -40, -30,
		-20, -30, -30, -40, -40, -30, -30, -20,
		-10, -20, -20, -20, -20, -20, -20, -10,
		20, 20, 0, 0, 0, 0, 20, 20,
		20, 30, 10, 0, 0, 10, 30, 20,
	],
];
const KING_END = [ // the end game: walk to the middle
	-50, -40, -30, -20, -20, -30, -40, -50,
	-30, -20, -10, 0, 0, -10, -20, -30,
	-30, -10, 20, 30, 30, 20, -10, -30,
	-30, -10, 30, 40, 40, 30, -10, -30,
	-30, -10, 30, 40, 40, 30, -10, -30,
	-30, -10, 20, 30, 30, 20, -10, -30,
	-30, -30, 0, 0, 0, 0, -30, -30,
	-50, -30, -30, -30, -30, -30, -30, -50,
];

// a boss's taste (BOSSES[i].style): centipawn bonuses for the bot's own side
// only, so each boss plays its tactic and leaves a weakness
//   trade   per 100 of material off the board: swaps everything
//   pawns   per rank each pawn has marched: the pawn storm
//   attack  per piece within two squares of your king: all in
//   center  per man on the middle sixteen squares: the wall
//   shelter per pawn in front of its own king: the bunker
//   queen   its queen off the back rank: early raids

const START_MATERIAL = 2 * (8 * 100 + 2 * 320 + 2 * 330 + 2 * 500 + 900);

function styleBonus(p, st, me) {
	const b = p.b;
	let bonus = 0, material = 0;
	const enemyKing = me === 1 ? p.kb : p.kw;
	const myKing = me === 1 ? p.kw : p.kb;
	const ekr = enemyKing >> 4, ekf = enemyKing % 16;
	const mkr = myKing >> 4, mkf = myKing % 16;
	const pawns = st.pawns ?? 0, attack = st.attack ?? 0, center = st.center ?? 0, shelter = st.shelter ?? 0, queen = st.queen ?? 0;
	for (let sq = 0; sq <= 119; sq++) {
		if ((sq & 0x88) === 0) {
			const q = b[sq];
			if (q !== 0) {
				const t = q > 0 ? q : -q;
				material += VALUE[t];
				if ((q > 0) === (me > 0) && t !== 6) {
					const rank = sq >> 4, file = sq % 16;
					if (t === 1) {
						bonus += pawns * (me === 1 ? rank - 1 : 6 - rank);
						if (rank - mkr === me && Math.abs(file - mkf) <= 1) bonus += shelter;
					} else {
						if (Math.max(Math.abs(rank - ekr), Math.abs(file - ekf)) <= 2) bonus += attack;
						if (t === 5 && rank !== (me === 1 ? 0 : 7)) bonus += queen;
					}
					if (rank >= 2 && rank <= 5 && file >= 2 && file <= 5) bonus += center;
				}
			}
		}
	}
	bonus += ((st.trade ?? 0) * (START_MATERIAL - material)) / 100;
	return bonus;
}

// the score for the side to move, in centipawns (style: a boss's taste for
// side `me`)
export function evaluate(p, style, me) {
	const b = p.b;
	let score = 0, heavy = 0;
	for (let sq = 0; sq <= 119; sq++) {
		if ((sq & 0x88) === 0) {
			const q = b[sq];
			if (q !== 0 && q !== 6 && q !== -6) {
				const t = q > 0 ? q : -q;
				if (t >= 2) heavy += VALUE[t];
			}
		}
	}
	const endgame = heavy <= 2600;
	for (let sq = 0; sq <= 119; sq++) {
		if ((sq & 0x88) === 0) {
			const q = b[sq];
			if (q !== 0) {
				const t = q > 0 ? q : -q;
				const rank = sq >> 4, file = sq % 16;
				// (0-based here: Lua's idx minus one)
				const idx = q > 0 ? (7 - rank) * 8 + file : rank * 8 + file;
				const tbl = t === 6 && endgame ? KING_END : PST[t];
				const v = VALUE[t] + tbl[idx];
				score += q > 0 ? v : -v;
			}
		}
	}
	if (style && me) score += styleBonus(p, style, me) * me;
	return score * p.side;
}

const MATE = 100000;
const INF = 1000000;

// MVV-LVA: take the biggest piece with the smallest one first
function order(p, moves, first) {
	const keys = new Map();
	for (const m of moves) {
		const [from, to, flag, promo] = decode(m);
		let k = 0;
		const victim = flag === 2 ? 1 : Math.abs(p.b[to]);
		if (victim > 0) {
			k = 10 * VALUE[victim] - Math.floor(VALUE[Math.abs(p.b[from])] / 10) + 100000;
		}
		if (promo > 0) k += VALUE[promo] + 50000;
		if (m === first) k = 1000000;
		keys.set(m, k);
	}
	moves.sort((a, c) => keys.get(c) - keys.get(a));
}

function tick(s) {
	s.nodes += 1;
	if (s.nodes % 2048 === 0) {
		if (s.clock() > s.deadline || s.nodes > s.maxNodes) s.stop = true;
		const y = s.yield;
		if (y) y();
	}
}

function quiesce(p, alpha, beta, s, qd) {
	tick(s);
	const stand = evaluate(p, s.style, s.me);
	if (stand >= beta) return stand;
	if (stand > alpha) alpha = stand;
	if (qd <= 0 || s.stop) return alpha;
	const moves = pseudo(p, true);
	order(p, moves);
	for (const m of moves) {
		make(p, m);
		if (leftSafe(p)) {
			const v = -quiesce(p, -beta, -alpha, s, qd - 1);
			unmake(p, m);
			if (v >= beta) return v;
			if (v > alpha) alpha = v;
		} else {
			unmake(p, m);
		}
		if (s.stop) break;
	}
	return alpha;
}

function negamax(p, depth, alpha, beta, s, height) {
	tick(s);
	if (p.half >= 100) return 0;
	// a check is never the last ply: look one more (sees the mate behind it)
	const check = inCheck(p);
	if (check && height < 12) depth += 1;
	if (depth <= 0) return quiesce(p, alpha, beta, s, 6);
	const moves = pseudo(p);
	order(p, moves);
	let legal = 0;
	let best = -INF;
	for (const m of moves) {
		make(p, m);
		if (leftSafe(p)) {
			legal += 1;
			const v = -negamax(p, depth - 1, -beta, -alpha, s, height + 1);
			unmake(p, m);
			if (v > best) best = v;
			if (v > alpha) alpha = v;
			if (alpha >= beta || s.stop) break;
		} else {
			unmake(p, m);
		}
	}
	if (legal === 0) return check ? -MATE + height : 0;
	return best;
}

const defaultClock = () => (globalThis.performance?.now?.() ?? Date.now()) / 1000;

// the bot's move (null when there is none). Works on a copy of the board.
// opts (all optional):
//   depth      the deepest full-width search (iterative deepening up to it; 3)
//   timeBudget seconds before the search stops and keeps the last full depth (1)
//   maxNodes   the node cap (200000; the game used MAX_NODES = 60000)
//   noise      random centipawns on each root move (EASY plays loose)
//   blunder    0..1: the chance of a random legal move instead
//   gentle     0..1: on a random move, the chance it leaves your pieces alone (no capture, no mate)
//   yield      () => void, called every 2048 nodes (synchronous)
//   clock      () => seconds (performance.now() / 1000)
//   random     () => [0, 1) (Math.random)
//   style      a boss's taste (for the side to move)
//   book       a boss's opening, its own moves in SAN, played while they're legal
//   bookBonus  how much the book is worth (centipawns; 40)
export function bestMove(src, opts) {
	const o = opts ?? {};
	const p = newPos(fen(src));
	p.rep = src.rep; // read only: a root move back into a seen position scores a draw
	const moves = legalMoves(p);
	if (moves.length === 0) return null;
	// the boss's opening: its k-th own move, while it's legal and gives
	// nothing away (a small bonus in the search, not a blind play)
	let bookMove = null;
	const book = o.book;
	if (book) {
		// (games start from the start position: white moved first)
		const want = book[Math.floor(src.history.length / 2)];
		if (want !== undefined) {
			for (const m of moves) {
				if (san(p, m).replace(/[+#]/g, "") === want) bookMove = m;
			}
		}
	}
	const rand = o.random ?? Math.random;
	const nextInt = (n) => 1 + Math.floor(rand() * n); // Random:NextInteger(1, n)
	if ((o.blunder ?? 0) > 0 && rand() < (o.blunder ?? 0)) {
		if ((o.gentle ?? 0) > 0 && rand() < (o.gentle ?? 0)) {
			const quiet = [];
			for (const m of moves) {
				if (!/[x#]/.test(san(p, m))) quiet.push(m);
			}
			if (quiet.length > 0) return quiet[nextInt(quiet.length) - 1];
		}
		return moves[nextInt(moves.length) - 1];
	}
	const clock = o.clock ?? defaultClock;
	const s = {
		nodes: 0,
		stop: false,
		deadline: clock() + (o.timeBudget ?? 1),
		maxNodes: o.maxNodes ?? 200000,
		yield: o.yield,
		clock,
		style: o.style,
		me: p.side,
	};
	const noise = o.noise ?? 0;
	let best = moves[0];
	const maxDepth = Math.max(1, o.depth ?? 3);
	for (let depth = 1; depth <= maxDepth; depth++) {
		order(p, moves, best);
		let alpha = -INF;
		let found = null, foundScore = -INF;
		for (const m of moves) {
			make(p, m);
			// with noise every root move needs its own true score (full window)
			let v = (p.rep[key(p)] ?? 0) >= 1 ? 0 : -negamax(p, depth - 1, -INF, noise > 0 || bookMove !== null ? INF : -alpha, s, 1);
			unmake(p, m);
			if (s.stop) break;
			if (noise > 0) v += -noise + rand() * (2 * noise); // Random:NextNumber(-noise, noise)
			if (m === bookMove) v += o.bookBonus ?? 40;
			if (v > foundScore) {
				found = m;
				foundScore = v;
			}
			if (v > alpha) alpha = v;
		}
		if (s.stop) {
			// an unfinished depth only counts if its first (last best) move held
			if (found !== null && found === best) best = found;
			break;
		}
		if (found !== null) best = found;
		if (foundScore >= MATE - 100) break; // a mate found: no need to look deeper
	}
	return best;
}

// ------------------------------------------------------------------ self-test
export function perft(p, depth) {
	if (depth === 0) return 1;
	let n = 0;
	for (const m of pseudo(p)) {
		make(p, m);
		if (leftSafe(p)) n += depth === 1 ? 1 : perft(p, depth - 1);
		unmake(p, m);
	}
	return n;
}

// perft on the standard positions
export const PERFT = [
	{ name: "start", fen: START, counts: [20, 400, 8902] },
	{ name: "kiwipete", fen: "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1", counts: [48, 2039] },
	{ name: "position 3", fen: "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1", counts: [14, 191, 2812] },
	{ name: "position 4", fen: "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", counts: [6, 264, 9467] },
];

// -> [ok, report]: ok when every perft count and ending matches
export function selfTest() {
	const lines = [];
	let ok = true;
	for (const t of PERFT) {
		const p = newPos(t.fen);
		t.counts.forEach((want, i) => {
			const depth = i + 1;
			const got = perft(p, depth);
			const good = got === want;
			ok = ok && good;
			lines.push(`${t.name} d${depth}: ${got} ${good ? "ok" : "WANT " + want}`);
		});
		if (fen(p) !== t.fen) {
			ok = false;
			lines.push(`${t.name}: FEN round trip broke: ${fen(p)}`);
		}
	}
	// the endings
	const ends = (f, want) => {
		const [got] = status(newPos(f));
		ok = ok && got === want;
		lines.push(`${want}: ${got}${got === want ? "" : " WRONG"}`);
	};
	ends("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3", "checkmate"); // fool's mate
	ends("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1", "stalemate");
	ends("8/8/8/4k3/8/8/2B5/4K3 w - - 0 1", "material");
	ends("4k3/8/8/8/8/8/4P3/4K3 w - - 100 80", "fifty");
	return [ok, lines.join("\n")];
}

// ------------------------------------------------------------------ levels + bosses
// From Chess/Config.lua: only what the engine reads. time = seconds of search
// (timeBudget). A boss's `color` is the side it plays (1 white, -1 black).
export const MAX_NODES = 60000; // the search's node cap (Config.MaxNodes)
export const THINK = [0.6, 1.5]; // the game's "thinking" pause before a bot searches (seconds)

export const LEVELS = [
	{ id: "ROOKIE", name: "ROOKIE", blurb: "barely knows the moves", depth: 1, noise: 0, blunder: 1, gentle: 0.8, time: 0.2 },
	{ id: "BEGINNER", name: "BEGINNER", blurb: "just learning", depth: 1, noise: 800, blunder: 0.9, gentle: 0.5, time: 0.3 },
	{ id: "NOVICE", name: "NOVICE", blurb: "takes free pieces sometimes", depth: 1, noise: 600, blunder: 0.65, gentle: 0.25, time: 0.3 },
	{ id: "EASY", name: "EASY", blurb: "learning the moves", depth: 1, noise: 300, blunder: 0.35, time: 0.4 },
	{ id: "MEDIUM", name: "MEDIUM", blurb: "sees your threats", depth: 2, noise: 30, blunder: 0, time: 0.8 },
	{ id: "HARD", name: "HARD", blurb: "thinks four moves deep", depth: 4, noise: 0, blunder: 0, time: 1.3 },
];

export const BOSSES = [
	{ id: "Rustbucket", name: "RUSTBUCKET", title: "THE TRADER", color: 1, depth: 2, noise: 40, time: 0.6, style: { trade: 14 }, book: ["e4", "d4", "Nc3"] },
	{ id: "Piston", name: "PISTON", title: "THE PAWN STORM", color: -1, depth: 2, noise: 20, time: 0.7, style: { pawns: 9, attack: 4 }, book: ["g5", "h5", "f5"], bookBonus: 90 },
	{ id: "Sparkplug", name: "SPARKPLUG", title: "THE GAMBITEER", color: 1, depth: 3, noise: 15, time: 0.9, style: { attack: 14, queen: 6 }, book: ["e4", "f4", "Nf3", "Bc4"] },
	{ id: "Bulwark", name: "BULWARK", title: "THE IRON WALL", color: -1, depth: 3, noise: 10, time: 1.0, style: { center: 10, shelter: 14 }, book: ["d5", "Nf6", "e6", "Bd6", "O-O"] },
	{ id: "Qunit", name: "Q-UNIT", title: "THE QUEEN RAIDER", color: 1, depth: 3, noise: 10, time: 1.0, style: { queen: 30, attack: 6 }, book: ["e4", "Qh5", "Bc4"] },
	{ id: "Overlord", name: "THE OVERLORD", title: "LAST OF THE LADDER", color: 1, final: true, need: 5, depth: 4, noise: 0, time: 1.5, style: { attack: 4, center: 3 }, book: ["d4", "c4"] },
];

// the bestMove opts for a level or boss (an entry above, or its id), the way
// the game's ChessService built them; `extra` overrides (random, clock, yield...)
export function botOpts(def, extra) {
	const d = typeof def === "string" ? LEVELS.find((l) => l.id === def) ?? BOSSES.find((b) => b.id === def) : def;
	if (!d) throw new Error(`chess-engine: no level or boss "${def}"`);
	return {
		depth: d.depth,
		noise: d.noise,
		blunder: d.blunder,
		gentle: d.gentle,
		timeBudget: d.time,
		maxNodes: MAX_NODES,
		style: d.style,
		book: d.book,
		bookBonus: d.bookBonus,
		...extra,
	};
}

// everything as one object too: import Chess from "./chess-engine.js"; Chess.new()
const Chess = {
	START, to88, from88, squareName, decode, fromFen, newPos, new: newPos, placement, fen, key,
	attacked, inCheck, make, unmake, legalMoves, find, status, san, play, board64, parts,
	evaluate, bestMove, perft, PERFT, selfTest, LEVELS, BOSSES, MAX_NODES, THINK, botOpts,
};
export default Chess;
