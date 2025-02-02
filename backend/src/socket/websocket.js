import { apiErrorHandler } from "../utils/apiErrorHandler.util.js";
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { SOCKET_EVENTS } from "../../socketEvents.constants.js";
import cookie from "cookie";

export const onlineUsers = {};

export const createOnlineUsersEvent = (socket, io) => {
  socket.emit(SOCKET_EVENTS.ONLINE_USERS, Object.keys(onlineUsers));
  io.emit(SOCKET_EVENTS.ONLINE_USERS, Object.keys(onlineUsers));
};

export const createChatEvent = (socket) => {
  socket.on(SOCKET_EVENTS.CHAT, (chatId) => {
    console.log(
      `User with ID ${socket.user?._id.toString()} joined chatId:`,
      chatId
    );
    socket.join(chatId);
  });
};

export const createUserTyping = (socket) => {
  socket.on(SOCKET_EVENTS.TYPING, ({chatId, senderId, receiverId}) => {
    console.log("user is typing");
    socket.to(receiverId).emit(SOCKET_EVENTS.TYPING, {chatId, senderId, receiverId});
  });
};

export const createUserStoppedTyping = (socket) => {
  socket.on(SOCKET_EVENTS.STOPPED_TYPING, ({chatId, senderId, receiverId}) => {
    socket.to(receiverId).emit(SOCKET_EVENTS.STOPPED_TYPING, {chatId, senderId, receiverId});
  });
};

export const createUserDisconnected = (socket, io) => {
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log("user disconnected");
    if (socket?.user?._id.toString()) {
      socket.leave(socket.user._id.toString());
      delete onlineUsers[socket.user._id.toString()];
      io.emit(SOCKET_EVENTS.ONLINE_USERS, Object.keys(onlineUsers));
    }
  });
};

// export const connectSocket = (io) => {
//   return io.on("connection", async (socket) => {
//     const cookies = cookie.parse(socket?.handshake?.headers?.cookie || "");
//     let token = cookies.accessToken;

//     if (!token) {
//       return new apiErrorHandler(401, "Unauthorized");
//     }

//     const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
//     const user = await User.findById(decodedToken._id);
//     if (!user) {
//       return new apiErrorHandler(401, "Unauthorized");
//     }
//     socket.user = user;
//     socket.join(user._id.toString());
//     socket.emit(SOCKET_EVENTS.CONNECTED);
//     console.log("User connected:", user._id.toString());
//     onlineUsers[user._id.toString()] = socket.id;
//     createChatEvent(socket);
//     createUserTyping(socket);
//     createOnlineUsersEvent(socket, io);
//     createUserStoppedTyping(socket);
//     createUserDisconnected(socket, io);
//   });
// };

export const emitSocketEvent = (req, roomId, event, data) => {
  const io = req.app.get("io");

  if (!io) {
    console.error("Socket.IO instance not found!");
    return;
  }

  io.in(roomId.toString()).emit(event, data);
  console.log("Emitted event:", event, "to room:", roomId);
};
