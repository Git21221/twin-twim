import { Router } from "express";
import { createOneOnOneChat, searchAvailabletwims, searchAvailableTwimToChat, searchAvailableTwimWithChat } from "../controller/chat.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getLastMessage } from "../controller/message.controller.js";

export const chatRoutes = Router();

chatRoutes.use(verifyJWT);
chatRoutes.get("/twims", searchAvailabletwims);
chatRoutes.get("/twimsWithChat", searchAvailableTwimWithChat);
chatRoutes.get("/twimsToCreateChat/:username", searchAvailableTwimToChat);
chatRoutes.post("/twims/:personToChatId", createOneOnOneChat);
chatRoutes.get("/last-message/:chatId", getLastMessage);