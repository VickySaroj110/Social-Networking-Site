import { createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

// Socket instance
let socket = null;

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    onlineUsers: [],
    connected: false,
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
      console.log("Inside reducer - Online users:", action.payload);
    },
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
  },
});

export const { setOnlineUsers, setConnected } = socketSlice.actions;

// Socket connection function
export const connectSocket = (userId, dispatch) => {
  if (socket?.connected) {
    console.log("Socket already connected, skipping connection");
    return;
  }

  console.log("Attempting to connect socket with userId:", userId);

  socket = io("http://localhost:8000", {
    query: {
      userId: userId,
    },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected successfully:", socket.id);
    dispatch(setConnected(true));
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
    dispatch(setConnected(false));
    dispatch(setOnlineUsers([]));
  });

  socket.on("getOnlineUsers", (users) => {
    console.log("📥 Online users received from server:", users);
    dispatch(setOnlineUsers(users));
  });

  socket.on("connect_error", (error) => {
    console.error("🚨 Socket connection error:", error.message);
    console.error("Full error:", error);
  });
};

// Socket disconnect function
export const disconnectSocket = (dispatch) => {
  if (socket) {
    socket.disconnect();
    socket = null;
    dispatch(setConnected(false));
    dispatch(setOnlineUsers([]));
  }
};

// Get socket instance
export const getSocket = () => socket;

export default socketSlice.reducer;
