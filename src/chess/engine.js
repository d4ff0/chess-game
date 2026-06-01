// Pure chess logic — no side effects, no imports

export function makeStartBoard() {
  const back = c => [
    { t: 'rook', c }, { t: 'knight', c }, { t: 'bishop', c }, { t: 'queen', c },
    { t: 'king', c }, { t: 'bishop', c }, { t: 'knight', c }, { t: 'rook', c },
  ];
  const pawns = c => Array(8).fill(0).map(() => ({ t: 'pawn', c }));
  const empty = () => Array(8).fill(null);
  return [
    back('black'), pawns('black'),
    empty(), empty(), empty(), empty(),
    pawns('white'), back('white'),
  ];
}

export function cloneBoard(b) {
  return b.map(r => r.map(p => (p ? { ...p } : null)));
}

export function pseudoMoves(board, r, c, epTarget) {
  const p = board[r][c];
  if (!p) return [];
  const { t, c: col } = p;
  const opp = col === 'white' ? 'black' : 'white';
  const ok  = (nr, nc) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8;
  const emp = (nr, nc) => ok(nr, nc) && !board[nr][nc];
  const foe = (nr, nc) => ok(nr, nc) && board[nr][nc]?.c === opp;
  const can = (nr, nc) => emp(nr, nc) || foe(nr, nc);
  const moves = [];

  const slide = (dr, dc) => {
    let nr = r + dr, nc = c + dc;
    while (ok(nr, nc)) {
      if (board[nr][nc]) { if (board[nr][nc].c === opp) moves.push([nr, nc]); break; }
      moves.push([nr, nc]);
      nr += dr; nc += dc;
    }
  };

  switch (t) {
    case 'pawn': {
      const d  = col === 'white' ? -1 : 1;
      const sr = col === 'white' ? 6  : 1;
      if (emp(r + d, c)) {
        moves.push([r + d, c]);
        if (r === sr && emp(r + 2 * d, c)) moves.push([r + 2 * d, c]);
      }
      for (const dc of [-1, 1]) {
        if (foe(r + d, c + dc)) moves.push([r + d, c + dc]);
        if (epTarget && r + d === epTarget[0] && c + dc === epTarget[1]) moves.push([r + d, c + dc]);
      }
      break;
    }
    case 'rook':   [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc]) => slide(dr, dc)); break;
    case 'bishop': [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => slide(dr, dc)); break;
    case 'queen':  [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => slide(dr, dc)); break;
    case 'knight': [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr,dc]) => { if (can(r+dr, c+dc)) moves.push([r+dr, c+dc]); }); break;
    case 'king':   [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => { if (can(r+dr, c+dc)) moves.push([r+dr, c+dc]); }); break;
  }
  return moves;
}

export function isAttacked(board, r, c, byColor) {
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.c !== byColor) continue;
      if (pseudoMoves(board, row, col, null).some(([mr, mc]) => mr === r && mc === c)) return true;
    }
  return false;
}

export function isInCheck(board, color) {
  const opp = color === 'white' ? 'black' : 'white';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.t === 'king' && board[r][c]?.c === color)
        return isAttacked(board, r, c, opp);
  return false;
}

export function legalMoves(board, r, c, turn, epTarget, castle) {
  const p = board[r][c];
  if (!p || p.c !== turn) return [];
  const opp = turn === 'white' ? 'black' : 'white';
  const legal = [];

  for (const [tr, tc] of pseudoMoves(board, r, c, epTarget)) {
    const tb = cloneBoard(board);
    if (p.t === 'pawn' && epTarget && tr === epTarget[0] && tc === epTarget[1])
      tb[p.c === 'white' ? tr + 1 : tr - 1][tc] = null;
    tb[tr][tc] = tb[r][c];
    tb[r][c] = null;
    if (!isInCheck(tb, p.c)) legal.push([tr, tc]);
  }

  if (p.t === 'king' && !isInCheck(board, turn)) {
    const kr = turn === 'white' ? 7 : 0;
    if (r === kr && c === 4) {
      const rights = castle[turn];
      if (rights.k && !board[kr][5] && !board[kr][6]
          && board[kr][7]?.t === 'rook' && board[kr][7]?.c === turn
          && !isAttacked(board, kr, 5, opp) && !isAttacked(board, kr, 6, opp))
        legal.push([kr, 6]);
      if (rights.q && !board[kr][3] && !board[kr][2] && !board[kr][1]
          && board[kr][0]?.t === 'rook' && board[kr][0]?.c === turn
          && !isAttacked(board, kr, 3, opp) && !isAttacked(board, kr, 2, opp))
        legal.push([kr, 2]);
    }
  }
  return legal;
}

export function hasAnyLegal(board, color, epTarget, castle) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.c !== color) continue;
      if (legalMoves(board, r, c, color, epTarget, castle).length > 0) return true;
    }
  return false;
}

// Applies a move; returns the full updated game state.
export function applyMove(board, fr, fc, tr, tc, promo, epTarget, castle, captured) {
  const b    = cloneBoard(board);
  const p    = b[fr][fc];
  const capt = b[tr][tc];
  const opp  = p.c === 'white' ? 'black' : 'white';

  const newCastle   = { white: { ...castle.white }, black: { ...castle.black } };
  const newCaptured = { white: [...captured.white], black: [...captured.black] };

  let note     = '';
  let isCastle = false;

  if (capt) newCaptured[p.c].push(capt.t);

  if (p.t === 'pawn' && epTarget && tr === epTarget[0] && tc === epTarget[1]) {
    const epRow = p.c === 'white' ? tr + 1 : tr - 1;
    newCaptured[p.c].push(b[epRow][tc].t);
    b[epRow][tc] = null;
  }

  const newEpTarget = (p.t === 'pawn' && Math.abs(tr - fr) === 2) ? [(fr + tr) / 2, tc] : null;

  if (p.t === 'king') {
    if (tc === 6 && fc === 4) { b[fr][5] = b[fr][7]; b[fr][7] = null; isCastle = true; note = 'O-O'; }
    if (tc === 2 && fc === 4) { b[fr][3] = b[fr][0]; b[fr][0] = null; isCastle = true; note = 'O-O-O'; }
    newCastle[p.c].k = newCastle[p.c].q = false;
  }
  if (p.t === 'rook') {
    if (fc === 0) newCastle[p.c].q = false;
    if (fc === 7) newCastle[p.c].k = false;
  }
  if (capt?.t === 'rook') {
    if (tc === 0) newCastle[opp].q = false;
    if (tc === 7) newCastle[opp].k = false;
  }

  b[tr][tc] = p;
  b[fr][fc] = null;

  let isPromo = false;
  if (p.t === 'pawn' && (tr === 0 || tr === 7)) {
    b[tr][tc] = { t: promo, c: p.c };
    isPromo = true;
  }

  if (!isCastle) {
    const LETTER = { king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: '' };
    const dest = String.fromCharCode(97 + tc) + (8 - tr);
    if (p.t === 'pawn') {
      note = capt || isPromo ? String.fromCharCode(97 + fc) + 'x' + dest : dest;
      if (isPromo) note += '=' + (LETTER[promo] || 'Q');
    } else {
      note = LETTER[p.t] + (capt ? 'x' : '') + dest;
    }
  }

  const nextColor = p.c === 'white' ? 'black' : 'white';
  const checked   = isInCheck(b, nextColor);
  const anyLegal  = hasAnyLegal(b, nextColor, newEpTarget, newCastle);

  if (checked) note += '+';
  const isOver = !anyLegal;
  const isMate = isOver && checked;
  if (isMate) note = note.slice(0, -1) + '#';

  return {
    board: b,
    epTarget: newEpTarget,
    castle: newCastle,
    captured: newCaptured,
    notation: note,
    movedColor: p.c,
    nextTurn: nextColor,
    isOver,
    isMate,
  };
}
