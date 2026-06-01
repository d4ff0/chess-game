// Web Audio API sound effects — no asset files required.

let _ctx = null;

function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}

function resume() {
  const c = ctx();
  if (c.state === 'suspended') c.resume();
  return c;
}

// Short percussive thump for piece captures.
export function playCapture() {
  try {
    const c = resume();
    const now = c.currentTime;
    [[120, 'sine', 0.55], [80, 'triangle', 0.35]].forEach(([freq, type, vol]) => {
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    });
  } catch (_) { /* browser may block audio before first interaction */ }
}

// Tense diminished chord for checkmate.
export function playCheckmate() {
  try {
    const c   = resume();
    const now = c.currentTime;
    [220, 261, 311].forEach((freq, i) => {
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3 - i * 0.03, now + 0.02);
      gain.gain.setValueAtTime(0.3 - i * 0.03, now + 0.32);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.92);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.95);
    });
  } catch (_) {}
}

// Hollow open fifth for stalemate — unresolved, neither winning nor losing.
export function playStalemate() {
  try {
    const c   = resume();
    const now = c.currentTime;
    [261, 392].forEach(freq => {
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
      gain.gain.setValueAtTime(0.22, now + 0.24);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.74);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.76);
    });
  } catch (_) {}
}
