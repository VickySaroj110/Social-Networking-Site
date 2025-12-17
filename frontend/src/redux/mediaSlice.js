import { createSlice } from "@reduxjs/toolkit";

const mediaSlice = createSlice({
  name: "media",
  initialState: {
    isMuted: true, // Global mute state
  },
  reducers: {
    setGlobalMute: (state, action) => {
      state.isMuted = action.payload;
    },
    toggleGlobalMute: (state) => {
      state.isMuted = !state.isMuted;
    },
  },
});

export const { setGlobalMute, toggleGlobalMute } = mediaSlice.actions;
export default mediaSlice.reducer;
