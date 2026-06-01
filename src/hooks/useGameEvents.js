import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { playCapture, playCheckmate, playStalemate } from '../audio.js';

// Watches lastEvent in Redux and fires sounds + optional callbacks.
// Called once at the App level.
export function useGameEvents({ onGameOver } = {}) {
  const lastEvent = useSelector(s => s.game.lastEvent);
  const prev = useRef(null);

  useEffect(() => {
    // null means new game reset or initial mount — nothing to do
    if (lastEvent === null) { prev.current = null; return; }
    // Same object reference = StrictMode double-fire or spurious re-render
    if (lastEvent === prev.current) return;
    prev.current = lastEvent;

    if (lastEvent.type === 'capture') {
      playCapture();
    } else if (lastEvent.type === 'checkmate') {
      playCheckmate();
      onGameOver?.(lastEvent);
    } else if (lastEvent.type === 'stalemate') {
      playStalemate();
      onGameOver?.(lastEvent);
    }
  }, [lastEvent, onGameOver]);
}
