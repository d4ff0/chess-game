import { createSlice, current } from '@reduxjs/toolkit';
import { makeStartBoard, applyMove as chessApplyMove } from '../chess/engine';

const makeInitialState = () => ({
  board: makeStartBoard(),
  turn: 'white',
  selected: null,
  epTarget: null,
  castle: { white: { k: true, q: true }, black: { k: true, q: true } },
  over: false,
  history: [],
  pendingPromo: null,
  lastMove: null,
  captured: { white: [], black: [] },
});

// Shared move application used by both local and remote move actions.
function runMove(state, fr, fc, tr, tc, promo) {
  const result = chessApplyMove(
    current(state.board),
    fr, fc, tr, tc,
    promo || 'queen',
    state.epTarget ? [state.epTarget[0], state.epTarget[1]] : null,
    { white: { ...state.castle.white }, black: { ...state.castle.black } },
    { white: [...state.captured.white], black: [...state.captured.black] },
  );
  state.board      = result.board;
  state.epTarget   = result.epTarget;
  state.castle     = result.castle;
  state.captured   = result.captured;
  state.turn       = result.nextTurn;
  state.over       = result.isOver;
  state.lastMove   = { fr, fc, tr, tc };
  state.selected   = null;
  state.pendingPromo = null;
  state.history.push({ note: result.notation, color: result.movedColor });
}

const gameSlice = createSlice({
  name: 'game',
  initialState: makeInitialState(),
  reducers: {
    newGame: () => makeInitialState(),

    selectSquare(state, { payload: { row, col } }) {
      if (row < 0) { state.selected = null; return; }
      const piece = state.board[row][col];
      if (piece?.c === state.turn) {
        const alreadySelected = state.selected?.[0] === row && state.selected?.[1] === col;
        state.selected = alreadySelected ? null : [row, col];
      } else {
        state.selected = null;
      }
    },

    executeMove(state, { payload: { fr, fc, tr, tc, promo } }) {
      runMove(state, fr, fc, tr, tc, promo);
    },

    applyRemoteMove(state, { payload: { fr, fc, tr, tc, promo } }) {
      runMove(state, fr, fc, tr, tc, promo);
    },

    setPendingPromo(state, { payload }) {
      state.pendingPromo = payload; // { fr, fc, tr, tc }
      state.selected = null;
    },

    syncRemoteState(state, { payload: s }) {
      state.board        = s.board;
      state.turn         = s.turn;
      state.epTarget     = s.epTarget;
      state.castle       = s.castle;
      state.history      = s.history;
      state.captured     = s.captured;
      state.lastMove     = s.lastMove;
      state.over         = s.over;
      state.selected     = null;
      state.pendingPromo = null;
    },
  },
});

export const {
  newGame, selectSquare, executeMove, applyRemoteMove, setPendingPromo, syncRemoteState,
} = gameSlice.actions;

export default gameSlice.reducer;
