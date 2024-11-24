import { apiErrorHandler } from "../utils/apiErrorHandler.util.js";
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { SOCKET_EVENTS } from "../../socketEvents.constants.js";

const createChatEvent = (socket) => {
  socket.on(SOCKET_EVENTS.CHAT, (chatId) => {
    console.log(`User with ID ${socket.user?._id.toString()} joined chatId:`, chatId);
    socket.join(chatId); // Joining room based on chat ID
    // socket.join(socket.user._id.toString()); // Joining room based on user ID
    console.log("Rooms user belongs to:", Array.from(socket.rooms));
  });
  
};

const createUserTyping = (socket) => {
  socket.on(SOCKET_EVENTS.TYPING, (chatId) => {
    socket.in(chatId).emit("typing", chatId);
  });
};

const createUserStoppedTyping = (socket) => {
  socket.on("stoppedTyping", (chatId) => {
    socket.in(chatId).emit("stoppedTyping", chatId);
  });
};

const createUserDisconnected = (socket) => {
  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (socket?.user?._id.toString()) {
      socket.leave(socket.user._id.toString());
    }
  });
};

export const connectSocket = (io) => {
  return io.on("connection", async (socket) => {
    let token = socket?.handshake?.headers?.cookie || "";
    if (!token) {
      token = socket?.handshake?.auth?.token;
    }
    if (!token) {
      return new apiErrorHandler(401, "Unauthorized");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);
    if (!user) {
      return new apiErrorHandler(401, "Unauthorized");
    }
    socket.user = user;
    socket.join(user._id.toString());
    socket.emit("connected");
    createChatEvent(socket);
    createUserTyping(socket);
    createUserStoppedTyping(socket);
    createUserDisconnected(socket);
  });
};

export const emitSocketEvent = (req, roomId, event, data) => {
  const io = req.app.get("io");
  
  console.log("Attempting to emit event:", event);
  console.log("Room ID:", roomId);
  console.log("Data:", data);

  if (!io) {
    console.error("Socket.IO instance not found!");
    return;
  }

  io.in(roomId.toString()).emit(event, data);
  console.log("Emitted event:", event, "to room:", roomId);
};

