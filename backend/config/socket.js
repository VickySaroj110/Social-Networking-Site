import http from "http";
import express from "express";
import { Server } from "socket.io";
import User from "../models/user.model.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// used to store online users with their data
// { userId: { socketId, userData } }
const userSocketMap = {};

io.on("connection", async (socket) => {
  console.log("🔗 A user connected with socket ID:", socket.id);

  const userId = socket.handshake.query.userId;
  console.log("👤 User ID from query:", userId);

  if (userId && userId !== "undefined") {
    try {
      // Fetch user data from database
      const userData = await User.findById(userId).select(
        "userName fullName profileImg"
      );

      if (userData) {
        userSocketMap[userId] = {
          socketId: socket.id,
          userData: {
            _id: userData._id,
            userName: userData.userName,
            fullName: userData.fullName,
            profileImg: userData.profileImg,
          },
        };
        console.log("✅ User added to socket map:", userData.userName);
        console.log("📊 Current online users:", Object.keys(userSocketMap));

        // Emit online users with their data
        const onlineUsersData = Object.values(userSocketMap).map(
          (user) => user.userData
        );
        io.emit("getOnlineUsers", onlineUsersData);
        console.log(
          "📤 Emitted online users data to all clients:",
          onlineUsersData
        );
      } else {
        console.log("⚠️ User not found in database:", userId);
      }
    } catch (error) {
      console.log("❌ Error fetching user data:", error);
    }
  } else {
    console.log("⚠️ Invalid user ID received:", userId);
  }

  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId]) {
      const disconnectedUser = userSocketMap[userId].userData;
      delete userSocketMap[userId];
      console.log(
        "❌ User disconnected and removed:",
        disconnectedUser.userName
      );

      // Emit updated online users
      const onlineUsersData = Object.values(userSocketMap).map(
        (user) => user.userData
      );
      io.emit("getOnlineUsers", onlineUsersData);
      console.log("📤 Updated online users after disconnect:", onlineUsersData);
    }
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

const getreceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId]?.socketId;
};

export { io, app, server, getreceiverSocketId };
