import { asyncFuncHandler } from "../utils/asyncFuncHandler.util.js";
import { apiErrorHandler } from "../utils/apiErrorHandler.util.js";
import { apiResponseHandler } from "../utils/apiResponseHandler.util.js";
import { Chat } from "../model/chat.model.js";
import { Message } from "../model/message.model.js";
import mongoose from "mongoose";
import { emitSocketEvent } from "../socket/websocket.js";

const chatMessageCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
      },
    },
    {
      $addFields: {
        sender: {
          $first: "$sender",
        },
      },
    },
  ];
};

export const sendMessage = asyncFuncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;
  if (!message) {
    res.status(400);
    throw new apiErrorHandler(400, "Message is required");
  }
  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    res.status(404);
    throw new apiErrorHandler(404, "Chat not found");
  }

  const messagesOfChat = await Message.create({
    content: message,
    chat: new mongoose.Types.ObjectId(chatId),
    sender: new mongoose.Types.ObjectId(req.user._id),
  });

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        lastMessage: messagesOfChat._id,
      },
    },
    { new: true }
  );

  const messages = await Message.aggregate([
    {
      $match: {
        _id: messagesOfChat._id,
      },
    },
    ...chatMessageCommonAggregation(),
  ]);

  const receivedMessage = messages[0];

  updatedChat.participants.forEach((participantId) => {
    if (participantId.toString() === req.user._id.toString()) return;
    emitSocketEvent(req, participantId.toString(), "message", receivedMessage);
  });
  return res
    .status(200)
    .json(new apiResponseHandler(200, "Message sent", receivedMessage));
});

export const getAllMessages = asyncFuncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { page = 0, limit = 10 } = req.query; // Use page number and limit for pagination
  
  if (!chatId) {
    return res.status(400).json(new apiErrorHandler(400, "Chat ID is required"));
  }

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    return res.status(404).json(new apiErrorHandler(404, "Chat not found"));
  }

  if (!selectedChat.participants.includes(req.user._id)) {
    return res
      .status(401)
      .json(new apiErrorHandler(401, "User is not part of the chat"));
  }

  const totalMessages = await Message.countDocuments({ chat: chatId });

  const messages = await Message.aggregate([
    {
      $match: { chat: new mongoose.Types.ObjectId(chatId) },
    },
    {
      $sort: { createdAt: -1 }, // Fetch newest messages first
    },
    {
      $skip: page * limit, // Skip messages based on the current page
    },
    {
      $limit: parseInt(limit), // Limit the number of messages
    },
    ...chatMessageCommonAggregation(),
  ]);

  // Reverse the messages for ascending order
  messages.reverse();

  return res.status(200).json(
    new apiResponseHandler(200, "Messages", messages)
  );
});




export const getLastMessage = asyncFuncHandler(async (req, res) => {
  const { chatId } = req?.params;
  const lastMessage = await Chat.findById(chatId).populate("lastMessage");
  if (!lastMessage) {
    return res.status(404).json(new apiErrorHandler(404, "Chat not found"));
  }
  return res
    .status(200)
    .json(new apiResponseHandler(200, "Last message", lastMessage));
});
