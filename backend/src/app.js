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

export const app = express();

// HTTP and WebSocket server
export const httpServer = createServer(app);

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
