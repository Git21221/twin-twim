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
import { connectSocket } from "./socket/websocket.js";

export const app = express();

// HTTP and WebSocket server
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  pingTimeout: 1000,
  pingInterval: 2000,
  cors: {
    origin: process.env.CORS_ORIGIN, // Secure for production
    credentials: true,
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

connectSocket(io);