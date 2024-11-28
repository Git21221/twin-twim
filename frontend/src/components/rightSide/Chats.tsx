import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppDispatch } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, getAllChats } from "../../slices/ChatSlice";
import { io, Socket } from "socket.io-client";
import { parse } from "cookie";

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  chat: string;
  content: string;
  createdAt: string;
}

interface ChatsProps {
  personToChat: string;
}

export function Chats({ personToChat }: ChatsProps) {
  console.log(personToChat);
  const dispatch = useDispatch<AppDispatch>();
  const cookie = parse(document.cookie);
  const { messages, loading } = useSelector((state: any) => state.chat);
  const { profile } = useSelector((state: any) => state.users);
  const [newMessage, setNewMessage] = useState<string>("");
  const socket = useRef<Socket | any>(null);
  // console.log(profile);

  useEffect(() => {
    // Fetch messages for the specified person and log the result
    dispatch(getAllChats(personToChat)).unwrap();
  }, [dispatch, personToChat]);

  // Transform messages from Redux directly
  const chat = useMemo(
    () =>
      messages.map((message: any) => ({
        sender: message.sender.firstName,
        username: message.sender.username,
        content: message.content,
        createdAt: message.createdAt,
      })),
    [messages]
  );
  console.log(chat);

  useEffect(() => {
    if (!cookie.accessToken) {
      console.error("Access token missing!");
      return;
    }

    if (!socket.current) {
      socket.current = io("http://localhost:4000", {
        auth: {
          token: cookie.accessToken,
        },
      });
    }

    socket.current?.on("connected", () => {
      console.log("connected");
      socket.current?.emit("chat", personToChat);
    });

    socket.current?.on("disconnect", (reason: any) => {
      console.error("Disconnected:", reason);
    });

    // Listen for incoming messages and update the chat state with the new message
    socket.current?.on("message", (message: any) => {
      console.log(message);

      if (
        message.chat === personToChat // Message is from the person you're chatting with
      ) {
        dispatch(addMessage(message));
      }
    });

    return () => {
      socket.current?.disconnect();
      socket.current = null;
    };
  }, [personToChat, cookie.accessToken]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    //optimistic update
    dispatch(
      addMessage({
        id: profile._id,
        sender: profile,
        content: newMessage,
        createdAt: new Date().toISOString(),
      })
    );

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/messages/${personToChat}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: newMessage }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      const data = await response.json();
      console.log(data);
      setNewMessage(""); // Clear input after sending
    } catch (error) {}
  };

  return (
    <div className="border-l border-[--main-background-color] h-full w-[calc(100vw-406px)]">
      <div className="max-w-[1266px] mx-auto">
        {messages.length > 0 ? (
          messages.map((message: Message) => (
            <div
              key={message._id}
              className={`pb-6 pt-4 flex ${
                message.sender._id === profile._id
                  ? "justify-end"
                  : " justify-start"
              }`}
            >
              <div
                key={message._id}
                className={`p-3 rounded-md flex flex-col gap-1 ${
                  message.sender._id === profile._id
                    ? "text-right bg-[--own-chat-background-color]"
                    : "text-left bg-[--user-chat-background-color]"
                }`}
              >
                <p className="text-[--main-chat-text-color] flex items-start">
                  {message.content}
                </p>
                <p className="text-[--main-chat-text-color] flex justify-end text-xs">
                  {new Date(message.createdAt).getHours() % 12 || 12}:
                  {new Date(message.createdAt)
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}{" "}
                  {(new Date(message.createdAt).getHours() % 12 || 12) >= 12
                    ? "PM"
                    : "AM"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No messages yet. Start the conversation!</p>
        )}
      </div>

      {/* <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{
            width: "80%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: "10px",
            marginLeft: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div> */}
    </div>
  );
}

export function EmptyChat() {
  return (
    <div className="border-l border-[--main-background-color] h-full w-[calc(100vw-406px)] flex items-center justify-center">
      Nothing to show, select a chat
    </div>
  );
}
