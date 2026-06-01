import { createSlice } from '@reduxjs/toolkit';

const multiplayerSlice = createSlice({
  name: 'mp',
  initialState: {
    color: null,       // 'white' | 'black' | null
    status: '',
    isError: false,
    isConnected: false,
  },
  reducers: {
    setMpColor(state, { payload }) { state.color = payload; },
    setMpStatus(state, { payload: { message, isError = false } }) {
      state.status  = message;
      state.isError = isError;
    },
    setMpConnected(state, { payload }) { state.isConnected = payload; },
    resetMp(state) {
      state.color       = null;
      state.status      = '';
      state.isError     = false;
      state.isConnected = false;
    },
  },
});

export const { setMpColor, setMpStatus, setMpConnected, resetMp } = multiplayerSlice.actions;
export default multiplayerSlice.reducer;
