import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import multiplayerReducer from './multiplayerSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    mp: multiplayerReducer,
  },
});
