import { useDispatch } from 'react-redux';
import { newGame } from '../store/gameSlice.js';
import * as peer from '../peer.js';
import StatusCard from './StatusCard.jsx';
import CapturedPieces from './CapturedPieces.jsx';
import MoveHistory from './MoveHistory.jsx';
import OnlinePlay from './OnlinePlay.jsx';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const dispatch = useDispatch();

  function handleNewGame() {
    dispatch(newGame());
    peer.send({ type: 'new-game' });
  }

  return (
    <div className={styles.sidebar}>
      <StatusCard />
      <CapturedPieces />
      <button className={styles.btnPrimary} onClick={handleNewGame}>New Game</button>
      <OnlinePlay />
      <MoveHistory />
    </div>
  );
}
