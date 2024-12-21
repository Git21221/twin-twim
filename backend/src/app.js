import express from "express";
import cors from "cors";
import "dotenv/config";
import { userRoutes } from "./route/user.route.js";
import { chatRoutes } from "./route/chat.route.js";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import { messageRoutes } from "./route/message.route.js";
import {
  createChatEvent,
  createOnlineUsersEvent,
  createUserDisconnected,
  createUserStoppedTyping,
  createUserTyping,
  onlineUsers,
} from "./socket/websocket.js";
import { User } from "./model/user.model.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { SOCKET_EVENTS } from "../socketEvents.constants.js";
import path from "path";

export const app = express();

// HTTP and WebSocket server
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: process.env.CORS_ORIGIN, // Secure for production
    // credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log("A user connected");
  socket.on("hii", (data) => {
    console.log(data);
  });
  try {
    const cookies = cookie.parse(socket?.handshake?.headers?.cookie || "");
    let token = cookies.accessToken;
    if (!token) {
      console.error("Missing token");
      return socket.disconnect(true);
    }

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);
    if (!user) {
      console.error("User not found");
      return socket.disconnect(true);
    }

    console.log("User authenticated:", user._id.toString());
    socket.user = user;
    socket.join(user._id.toString());

    socket.emit(SOCKET_EVENTS.CONNECTED);
    onlineUsers[user._id.toString()] = socket.id;

    createChatEvent(socket);
    createUserTyping(socket);
    createOnlineUsersEvent(socket, io);
    createUserStoppedTyping(socket);
    createUserDisconnected(socket, io);
  } catch (err) {
    console.error("Error during connection:", err.message);
    return socket.disconnect(true);
  }
});

// Attach io to Express app for access in routes
app.set("io", io);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
// app.use(morgan("dev")); // Logger

app.use("/api", userRoutes, chatRoutes, messageRoutes);
// if (process.env.DEV_ENV === "false") {
  const __dirname = path.resolve();
  console.log(__dirname);
  
  app.use(express.static("./frontend/dist"));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "./frontend/dist", "index.html"))
  );
// }
