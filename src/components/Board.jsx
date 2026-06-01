import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Square from './Square.jsx';
import { selectSquare, executeMove, setPendingPromo } from '../store/gameSlice.js';
import { legalMoves, isInCheck } from '../chess/engine.js';
import * as peer from '../peer.js';
import styles from './Board.module.css';

export default function Board() {
  const dispatch = useDispatch();
  const { board, turn, selected, epTarget, castle, over, pendingPromo, lastMove, lastEvent } = useSelector(s => s.game);
  const mpColor = useSelector(s => s.mp.color);

  // Legal move targets for the currently selected piece
  const legalSet = useMemo(() => {
    if (!selected) return new Set();
    const moves = legalMoves(board, selected[0], selected[1], turn, epTarget, castle);
    return new Set(moves.map(([r, c]) => `${r},${c}`));
  }, [board, selected, turn, epTarget, castle]);

  // King in check position
  const checkedKing = useMemo(() => {
    if (over || !isInCheck(board, turn)) return null;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c]?.t === 'king' && board[r][c]?.c === turn) return `${r},${c}`;
    return null;
  }, [board, turn, over]);

  // Capture flash: highlight the destination square briefly when a piece is taken
  const [flashSquare, setFlashSquare] = useState(null);
  const prevEvent = useRef(null);

  useEffect(() => {
    if (!lastEvent || lastEvent === prevEvent.current) return;
    prevEvent.current = lastEvent;
    if (lastEvent.type === 'capture' && lastMove) {
      const key = `${lastMove.tr},${lastMove.tc}`;
      setFlashSquare(key);
      const id = setTimeout(() => setFlashSquare(null), 420);
      return () => clearTimeout(id);
    }
  }, [lastEvent, lastMove]);

  const handleClick = useCallback((row, col) => {
    if (over || pendingPromo) return;
    if (mpColor && turn !== mpColor) return;

    const piece = board[row][col];
    const key   = `${row},${col}`;

    if (selected) {
      const [sr, sc] = selected;

      if (legalSet.has(key)) {
        const movingPiece = board[sr][sc];
        if (movingPiece.t === 'pawn' && (row === 0 || row === 7)) {
          dispatch(setPendingPromo({ fr: sr, fc: sc, tr: row, tc: col }));
        } else {
          const move = { fr: sr, fc: sc, tr: row, tc: col, promo: 'queen' };
          dispatch(executeMove(move));
          peer.send({ type: 'move', ...move });
        }
        return;
      }

      if (piece?.c === turn) { dispatch(selectSquare({ row, col })); return; }
      dispatch(selectSquare({ row: -1, col: -1 }));
      return;
    }

    if (piece?.c === turn) dispatch(selectSquare({ row, col }));
  }, [board, turn, selected, legalSet, over, pendingPromo, mpColor, dispatch]);

  return (
    <div className={styles.board}>
      {board.map((rowArr, r) =>
        rowArr.map((piece, c) => {
          const key = `${r},${c}`;
          return (
            <Square
              key={key}
              row={r}
              col={c}
              piece={piece}
              isSelected={selected?.[0] === r && selected?.[1] === c}
              isDot={!piece && legalSet.has(key)}
              isRing={!!piece && legalSet.has(key)}
              isInCheck={checkedKing === key}
              isLastFrom={lastMove?.fr === r && lastMove?.fc === c}
              isLastTo={lastMove?.tr === r && lastMove?.tc === c}
              isCaptureFlash={flashSquare === key}
              onClick={() => handleClick(r, c)}
            />
          );
        })
      )}
    </div>
  );
}
