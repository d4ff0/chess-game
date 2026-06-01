import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Board from './components/Board.jsx';
import Sidebar from './components/Sidebar.jsx';
import PromoModal from './components/PromoModal.jsx';
import GameOverBanner from './components/GameOverBanner.jsx';
import { useGameEvents } from './hooks/useGameEvents.js';
import { join as peerJoin } from './peer.js';
import styles from './App.module.css';

export default function App() {
  const over = useSelector(s => s.game.over);
  const [gameOverEvent, setGameOverEvent] = useState(null);

  const handleGameOver = useCallback(event => setGameOverEvent(event), []);
  useGameEvents({ onGameOver: handleGameOver });

  // Clear the banner whenever a new game starts
  useEffect(() => { if (!over) setGameOverEvent(null); }, [over]);

  // Auto-join a room if the URL contains ?room=<id>
  useEffect(() => {
    const roomId = new URLSearchParams(window.location.search).get('room');
    if (roomId) peerJoin(roomId);
  }, []);

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Chess</h1>
      <div className={styles.gameContainer}>
        <BoardArea />
        <Sidebar />
      </div>
      <PromoModal />
      <GameOverBanner event={gameOverEvent} onDismiss={() => setGameOverEvent(null)} />
    </div>
  );
}

function BoardArea() {
  return (
    <div className={styles.boardArea}>
      <RankLabels />
      <div>
        <Board />
        <FileLabels />
      </div>
    </div>
  );
}

function RankLabels() {
  return (
    <div className={styles.rankLabels}>
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className={styles.coordLabel}>{8 - i}</span>
      ))}
    </div>
  );
}

function FileLabels() {
  return (
    <div className={styles.fileLabels}>
      {'abcdefgh'.split('').map(f => (
        <span key={f} className={styles.coordLabel}>{f}</span>
      ))}
    </div>
  );
}
