import { useDispatch, useSelector } from 'react-redux';
import { executeMove, setPendingPromo } from '../store/gameSlice.js';
import { SYM, PROMO_TYPES } from '../chess/constants.js';
import * as peer from '../peer.js';
import sqStyles from './Square.module.css';
import styles from './PromoModal.module.css';

export default function PromoModal() {
  const dispatch     = useDispatch();
  const pendingPromo = useSelector(s => s.game.pendingPromo);
  const turn         = useSelector(s => s.game.turn);

  if (!pendingPromo) return null;

  function choose(promoType) {
    const move = { ...pendingPromo, promo: promoType };
    dispatch(executeMove(move));
    peer.send({ type: 'move', ...move });
  }

  const pieceClass = turn === 'white' ? sqStyles.pw : sqStyles.pb;

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <h2 className={styles.title}>Promote Pawn</h2>
        <div className={styles.choices}>
          {PROMO_TYPES.map(type => (
            <button key={type} className={styles.btn} onClick={() => choose(type)}>
              <span className={`${sqStyles.piece} ${pieceClass}`}>{SYM[type]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
