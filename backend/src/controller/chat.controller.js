import mongoose from "mongoose";
import { Chat } from "../model/chat.model.js";
import { User } from "../model/user.model.js";
import { emitSocketEvent } from "../socket/websocket.js";
import { apiErrorHandler } from "../utils/apiErrorHandler.util.js";
import { apiResponseHandler } from "../utils/apiResponseHandler.util.js";
import { asyncFuncHandler } from "../utils/asyncFuncHandler.util.js";

const chatCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "participants",
        as: "participants",
      },
    },
    {
      $lookup: {
        from: "messages",
        foreignField: "_id",
        localField: "lastMessage",
        as: "lastMessage",
        pipeline: [
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
              sender: { $first: "$sender" },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        lastMessage: { $first: "$lastMessage" },
      },
    },
  ];
};

export const searchAvailabletwims = asyncFuncHandler(async (req, res) => {
  //search for available twims
  const twims = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: req.user._id,
        },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        firstName: 1,
        lastName: 1,
      },
    },
  ]); //search for twims
  const chats = await Chat.aggregate([
    {
      $match: {
        participants: {
          $elemMatch: { $eq: req.user._id },
        },
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        as: "lastMessage",
      },
    },
  ]);

  twims.forEach((twim) => {
    twim.lastMessage = chats.find((chat) =>
      chat.participants.find(
        (participant) => participant.toString() === twim._id.toString()
      )
    )?.lastMessage[0];
  });

  //if available send the list of twims
  if (twims.length !== 0) {
    res.status(200).json(new apiResponseHandler(200, "twims fetched", twims));
  } else {
    res.status(404).json(new apiErrorHandler(404, "No twims available"));
  }
});

export const createOneOnOneChat = asyncFuncHandler(async (req, res) => {
  const { personToChatId } = req?.params;
  //check if the user exists
  const receiver = await User.findById(personToChatId);

  if (!receiver) {
    return res.status(404).json(new apiErrorHandler(404, "User not found"));
  }

  //check if the user is chatting with himself
  if (receiver._id.toString() === req.user._id.toString()) {
    return res
      .status(400)
      .json(new apiErrorHandler(400, "You cannot chat with yourself"));
  }

  //check if the chat already exists
  const chat = await Chat.aggregate([
    {
      $match: {
        isGroupChat: false,
        $and: [
          {
            participants: { $elemMatch: { $eq: req.user._id } },
          },
          {
            participants: {
              $elemMatch: { $eq: new mongoose.Types.ObjectId(personToChatId) },
            },
          },
        ],
      },
    },
    ...chatCommonAggregation(),
  ]);

  // if(!isSocketConnected){
  //   //create a socket connection
  //   console.log("socket connection created");
  //   connectSocket(io);
  //   isSocketConnected = true;
  // }

  if (chat.length) {
    return res
      .status(200)
      .json(new apiResponseHandler(200, "Chat already exists", chat[0]));
  }

  //create a new chat
  const newChat = await Chat.create({
    name: "one on one chat",
    participants: [req.user._id, personToChatId],
    admin: req.user._id,
  });
  const createNewChat = await Chat.aggregate([
    {
      $match: {
        _id: newChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const data = createNewChat[0];

  if (!data) {
    return res
      .status(500)
      .json(new apiErrorHandler(500, "Error creating chat"));
  }

  data?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return;
    emitSocketEvent(req, participant._id?.toString(), "newChat", newChat);
  });
  return res
    .status(200)
    .json(new apiResponseHandler(200, "Chat created", createNewChat));
});

export const searchAvailableTwimToChat = asyncFuncHandler(async (req, res) => {
  const { username } = req?.params;
  const twim = await User.findOne({ username });
  if (!twim) {
    return res.status(404).json(new apiErrorHandler(404, "User not found"));
  }
  return res
    .status(200)
    .json(new apiResponseHandler(200, "Chat created", twim));
});

export const searchAvailableTwimWithChat = asyncFuncHandler(
  async (req, res) => {
    // Fetch all twims except the current user
    const twims = await User.aggregate([
      {
        $match: {
          _id: {
            $ne: req.user._id,
          },
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    // Fetch all chats of the current user
    const chats = await Chat.aggregate([
      {
        $match: {
          participants: {
            $elemMatch: { $eq: req.user._id },
          },
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "lastMessage",
          foreignField: "_id",
          as: "lastMessage",
        },
      },
    ]);

    // Attach the last message only to twims with an associated chat
    const twimsWithChats = twims.map((twim) => {
      const chat = chats.find((chat) =>
        chat.participants.some(
          (participant) => participant.toString() === twim._id.toString()
        )
      );
      if (chat) {
        twim.lastMessage = chat.lastMessage?.[0]; // Attach the last message
        return twim; // Include only twims with chats
      }
      return null;
    }).filter(Boolean); // Remove null values (twims without chats)

    // If twims with chats exist, return them
    if (twimsWithChats.length > 0) {
      res
        .status(200)
        .json(new apiResponseHandler(200, "twims fetched", twimsWithChats));
    } else {
      res.status(404).json(new apiErrorHandler(404, "No twims with chats available"));
    }
  }
);
