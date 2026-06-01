import { SYM } from '../chess/constants.js';
import styles from './Square.module.css';

export default function Square({
  row, col, piece,
  isSelected, isDot, isRing, isInCheck, isLastFrom, isLastTo, isCaptureFlash,
  onClick,
}) {
  const isLight = (row + col) % 2 === 0;

  const cls = [
    styles.sq,
    isLight ? styles.light : styles.dark,
    isSelected  ? styles.selected  : '',
    isDot       ? styles.dot       : '',
    isRing      ? styles.ring      : '',
    isInCheck      ? styles.inCheck      : '',
    isLastFrom     ? styles.lastFrom     : '',
    isLastTo       ? styles.lastTo       : '',
    isCaptureFlash ? styles.captureFlash : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} onClick={onClick}>
      {piece && (
        <span className={`${styles.piece} ${piece.c === 'white' ? styles.pw : styles.pb}`}>
          {SYM[piece.t]}
        </span>
      )}
    </div>
  );
}
