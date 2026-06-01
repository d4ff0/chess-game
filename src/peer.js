// Singleton PeerJS wrapper.
// Callbacks are registered once by OnlinePlay and fire on every event,
// dispatching directly to the Redux store so moves reflect immediately.

import Peer from 'peerjs';

export const HOSTED_URL = 'https://d4ff0.github.io/chess-game/';

let _peer = null;
let _conn = null;

// Registered by OnlinePlay via init()
let _onData        = null;
let _onStatus      = null;
let _onConnected   = null;
let _onDisconnected = null;
let _getGameState  = null;

export function init({ onData, onStatus, onConnected, onDisconnected, getGameState }) {
  _onData         = onData;
  _onStatus       = onStatus;
  _onConnected    = onConnected;
  _onDisconnected = onDisconnected;
  _getGameState   = getGameState;
}

export function send(data) {
  if (_conn?.open) _conn.send(data);
}

export function isOpen() {
  return _conn?.open ?? false;
}

export function host() {
  _cleanup();
  _peer = new Peer();

  _peer.on('open', id => {
    const url = `${HOSTED_URL}?room=${id}`;
    navigator.clipboard.writeText(url)
      .then(()  => _onStatus?.('Link copied! Send it to your friend. You play White.', false))
      .catch(()  => _onStatus?.(`Share this link:\n${url}`, false));
  });

  _peer.on('connection', c => {
    _conn = c;
    _wireConn(c);
    c.on('open', () => {
      _onStatus?.('Opponent joined — you play White.', false);
      // Push full game state so the guest is immediately in sync
      const state = _getGameState?.();
      if (state) c.send({ type: 'sync', state });
      _onConnected?.('white');
    });
  });

  _peer.on('error', e => _onStatus?.('Error: ' + e.type, true));
}

export function join(roomId) {
  _cleanup();
  _peer = new Peer();

  _peer.on('open', () => {
    _conn = _peer.connect(roomId, { reliable: true });
    _wireConn(_conn);
    _conn.on('open', () => {
      _onStatus?.('Connected — you play Black.', false);
      _onConnected?.('black');
    });
  });

  _peer.on('error', () =>
    _onStatus?.('Could not connect. The link may have expired.', true)
  );
}

export function cancel() {
  _cleanup();
}

function _wireConn(c) {
  c.on('data',  d => _onData?.(d));
  c.on('close', () => {
    _conn = null;
    _onStatus?.('Opponent disconnected.', true);
    _onDisconnected?.();
  });
}

function _cleanup() {
  if (_peer) { _peer.destroy(); _peer = null; _conn = null; }
}
