import { Router } from "express";
import { createOneOnOneChat, searchAvailabletwims } from "../controller/chat.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { connectSocket } from "../socket/websocket.js";
import { getLastMessage } from "../controller/message.controller.js";

export const chatRoutes = Router();

chatRoutes.use(verifyJWT);
chatRoutes.get("/twims", searchAvailabletwims);
chatRoutes.post("/twims/:personToChatId", createOneOnOneChat);
chatRoutes.get("/last-message/:chatId", getLastMessage);