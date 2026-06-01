import styles from './GameOverBanner.module.css';

export default function GameOverBanner({ event, onDismiss }) {
  if (!event) return null;

  const isCheckmate = event.type === 'checkmate';
  const headline = isCheckmate
    ? `${event.winner === 'white' ? 'White' : 'Black'} wins!`
    : 'Draw!';
  const subline = isCheckmate ? 'Checkmate' : 'Stalemate';

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.banner} onClick={e => e.stopPropagation()}>
        <div className={styles.headline}>{headline}</div>
        <div className={styles.subline}>{subline}</div>
        <button className={styles.dismiss} onClick={onDismiss}>Continue</button>
      </div>
    </div>
  );
}
