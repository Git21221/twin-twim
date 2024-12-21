import express from "express";
import cors from "cors";
import "dotenv/config";
import { userRoutes } from "./route/user.route.js";
import { chatRoutes } from "./route/chat.route.js";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import {Server} from "socket.io";
import morgan from "morgan";
import { messageRoutes } from "./route/message.route.js";
import { createChatEvent, createOnlineUsersEvent, createUserDisconnected, createUserStoppedTyping, createUserTyping, onlineUsers } from "./socket/websocket.js";
import { User } from "./model/user.model.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { SOCKET_EVENTS } from "../socketEvents.constants.js";

export const app = express();

// HTTP and WebSocket server
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  pingTimeout: 1000,
  pingInterval: 2000,
  cors: {
    origin: "*", // Secure for production
    methods: ["GET", "POST"],
  },
});

// Attach io to Express app for access in routes
app.set("io", io);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
// app.use(morgan("dev")); // Logger

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/", userRoutes, chatRoutes, messageRoutes);

// connectSocket(io);
io.on("connection", async (socket) => {
  console.log("A user connected");
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