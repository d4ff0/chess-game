import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as peer from '../peer.js';
import { store } from '../store/index.js';
import { applyRemoteMove, syncRemoteState, newGame } from '../store/gameSlice.js';
import { setMpColor, setMpStatus, setMpConnected, resetMp } from '../store/multiplayerSlice.js';
import styles from './Sidebar.module.css';

export default function OnlinePlay() {
  const dispatch   = useDispatch();
  const { status, isError, color, isConnected } = useSelector(s => s.mp);

  // Wire peer callbacks once — incoming data dispatches directly to Redux.
  useEffect(() => {
    peer.init({
      getGameState: () => store.getState().game,

      onData(data) {
        if (data.type === 'move') dispatch(applyRemoteMove(data));
        if (data.type === 'sync') dispatch(syncRemoteState(data.state));
        if (data.type === 'new-game') dispatch(newGame());
      },

      onStatus(message, isErr) {
        dispatch(setMpStatus({ message, isError: isErr }));
      },

      onConnected(color) {
        dispatch(setMpColor(color));
        dispatch(setMpConnected(true));
      },

      onDisconnected() {
        dispatch(setMpConnected(false));
      },
    });
  }, [dispatch]);

  function handleHost() {
    dispatch(resetMp());
    dispatch(setMpStatus({ message: 'Connecting…' }));
    peer.host();
  }

  function handleCancel() {
    peer.cancel();
    dispatch(resetMp());
  }

  const waiting = status.includes('Waiting') || status.includes('Connecting');

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Online Play</div>

      {!isConnected && !waiting && (
        <button className={styles.btnOutline} onClick={handleHost}>
          Share Link to Invite
        </button>
      )}

      {waiting && (
        <button className={styles.btnOutline} onClick={handleCancel}>
          Cancel
        </button>
      )}

      {isConnected && (
        <div className={styles.connBadge}>
          {color === 'white' ? '⬜' : '⬛'} Playing as {color}
        </div>
      )}

      {status && (
        <p className={`${styles.mpStatus} ${isError ? styles.mpError : ''}`}>
          {status}
        </p>
      )}
    </div>
  );
}
