import { apiErrorHandler } from "../utils/apiErrorHandler.util.js";
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { SOCKET_EVENTS } from "../../socketEvents.constants.js";
import cookie from "cookie";

const onlineUsers = {};

const createOnlineUsersEvent = (socket, io) => {
  socket.emit(SOCKET_EVENTS.ONLINE_USERS, Object.keys(onlineUsers));
  io.emit(SOCKET_EVENTS.ONLINE_USERS, Object.keys(onlineUsers));
};

const createChatEvent = (socket) => {
  socket.on(SOCKET_EVENTS.CHAT, (chatId) => {
    console.log(
      `User with ID ${socket.user?._id.toString()} joined chatId:`,
      chatId
    );
    socket.join(chatId);
  });
};

const createUserTyping = (socket) => {
  socket.on(SOCKET_EVENTS.TYPING, (chatId) => {
    console.log("user is typing");
    socket.in(chatId).emit(SOCKET_EVENTS.TYPING, chatId);
  });
};

const createUserStoppedTyping = (socket) => {
  socket.on(SOCKET_EVENTS.STOPPED_TYPING, (chatId) => {
    socket.in(chatId).emit(SOCKET_EVENTS.STOPPED_TYPING, chatId);
  });
};

const createUserDisconnected = (socket, io) => {
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log("user disconnected");
    if (socket?.user?._id.toString()) {
      socket.leave(socket.user._id.toString());
      delete onlineUsers[socket.user._id.toString()];
      io.emit(SOCKET_EVENTS.ONLINE_USERS, Object.keys(onlineUsers));
    }
  });
};

export const connectSocket = (io) => {
  console.log("Socket.IO connected");
  io.on("connection", async (socket) => {
    console.log("inside io");
    
    const cookies = cookie.parse(socket?.handshake?.headers?.cookie || "");
    let token = cookies.accessToken;

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
    socket.emit(SOCKET_EVENTS.CONNECTED);
    console.log("User connected:", user._id.toString());
    onlineUsers[user._id.toString()] = socket.id;
    createChatEvent(socket);
    createUserTyping(socket);
    createOnlineUsersEvent(socket, io);
    createUserStoppedTyping(socket);
    createUserDisconnected(socket, io);
  });
};

export const emitSocketEvent = (req, roomId, event, data) => {
  const io = req.app.get("io");

  if (!io) {
    console.error("Socket.IO instance not found!");
    return;
  }

  io.in(roomId.toString()).emit(event, data);
  console.log("Emitted event:", event, "to room:", roomId);
};
