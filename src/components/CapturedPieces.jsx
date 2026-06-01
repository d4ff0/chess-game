import { useSelector } from 'react-redux';
import { SYM } from '../chess/constants.js';
import styles from './Sidebar.module.css';
import sqStyles from './Square.module.css';

const ORDER = ['queen', 'rook', 'bishop', 'knight', 'pawn'];
const sort  = arr => [...arr].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));

export default function CapturedPieces() {
  const { captured } = useSelector(s => s.game);

  return (
    <div className={styles.card}>
      <Row label="White captured" pieces={sort(captured.white)} pieceClass={sqStyles.pb} />
      <Row label="Black captured" pieces={sort(captured.black)} pieceClass={sqStyles.pw} />
    </div>
  );
}

function Row({ label, pieces, pieceClass }) {
  return (
    <>
      <div className={styles.capturedLabel}>{label}</div>
      <div className={styles.capturedRow}>
        {pieces.map((t, i) => (
          <span key={i} className={`${sqStyles.piece} ${pieceClass}`} style={{ fontSize: 22 }}>
            {SYM[t]}
          </span>
        ))}
      </div>
    </>
  );
}
