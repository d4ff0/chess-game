import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styles from './Sidebar.module.css';

export default function MoveHistory() {
  const history  = useSelector(s => s.game.history);
  const listRef  = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [history]);

  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({ num: i / 2 + 1, white: history[i], black: history[i + 1] });
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Move History</div>
      <div className={styles.moveList} ref={listRef}>
        {pairs.map(({ num, white, black }, i) => {
          const isLast = i === pairs.length - 1;
          return (
            <div key={num} className={styles.movePair}>
              <span className={styles.moveNum}>{num}.</span>
              <span className={`${styles.moveWhite} ${isLast && !black ? styles.latest : ''}`}>
                {white?.note ?? ''}
              </span>
              <span className={`${styles.moveBlack} ${isLast && black ? styles.latest : ''}`}>
                {black?.note ?? ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
