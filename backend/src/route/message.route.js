import { Router } from "express";
import { getAllMessages, sendMessage } from "../controller/message.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const messageRoutes = Router();

messageRoutes.use(verifyJWT);
messageRoutes.post("/messages/:chatId", sendMessage);
messageRoutes.get("/messages/:chatId", getAllMessages);