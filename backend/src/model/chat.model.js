import mongoose, { mongo, Schema } from "mongoose";

const chatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: String,
      ref: "Message",
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
