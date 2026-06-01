import { useSelector } from 'react-redux';
import { isInCheck } from '../chess/engine.js';
import styles from './Sidebar.module.css';

export default function StatusCard() {
  const { board, turn, over } = useSelector(s => s.game);

  let dotColor = turn;
  let label    = `${turn === 'white' ? 'White' : 'Black'}'s turn`;
  let msg      = '';

  if (over) {
    const checked = isInCheck(board, turn);
    dotColor = checked ? (turn === 'white' ? 'black' : 'white') : turn;
    label    = 'Game Over';
    msg      = checked
      ? `${turn === 'white' ? 'Black' : 'White'} wins by checkmate!`
      : 'Stalemate — Draw!';
  } else if (isInCheck(board, turn)) {
    msg = 'Check!';
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Turn</div>
      <div className={styles.turnRow}>
        <div className={styles.turnDot} style={{ background: dotColor === 'white' ? '#f5f5f5' : '#111' }} />
        <span>{label}</span>
      </div>
      {msg && <div className={styles.statusMsg}>{msg}</div>}
    </div>
  );
}
