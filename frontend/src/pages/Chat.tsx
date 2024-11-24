import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { parse } from "cookie";
import "./Chat.css";

function Chat() {
  const cookie = parse(document.cookie);
  const [loginUser, setLoginUser] = useState<any>(localStorage.getItem("loggedInUser"));
  console.log(loginUser.username);

  const { personToChat, name } = useParams();
  const [value, setValue] = useState<string>("");
  const [chat, setChat] = useState<any[]>([]); // Store messages as objects
  const socket = useRef<Socket | null>(null);

  // Fetch all messages for a particular chat on component mount
  useEffect(() => {
    setLoginUser(JSON.parse(localStorage.getItem("loggedInUser") || "{}"));
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/messages/${personToChat}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const messages = await response.json();
        console.log(messages);
        setChat(
          messages.data?.map((message: any) => ({
            sender: message.sender.firstName,
            username: message.sender.username,
            content: message.content,
            createdAt: message.createdAt,
          }))
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [personToChat]);

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

    socket.current?.on("disconnect", (reason) => {
      console.error("Disconnected:", reason);
    });

    // Listen for incoming messages and update the chat state with the new message
    socket.current?.on("message", (message: any) => {
      console.log(message);
      
      if (
        message.chat === personToChat // Message is from the person you're chatting with
      ) {
        setChat((prev) => [
          ...prev,
          {
            chatId: message.chatId,
            sender: message.sender.firstName,
            username: message.sender.username,
            content: message.content,
            createdAt: new Date(message.createdAt).toLocaleTimeString(),
          },
        ]);
      }
    });

    return () => {
      socket.current?.disconnect();
      socket.current = null;
    };
  }, [personToChat, cookie.accessToken]);

  const sendMessage = async () => {
    if (!value.trim()) return; // Prevent sending empty messages

    // Optimistically add the message to the chat
    setChat((prev) => [
      ...prev,
      {
        chatId: personToChat,
        sender: loginUser.firstName,
        username: loginUser.username,
        content: value,
        createdAt: new Date().toLocaleTimeString(),
      },
    ]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/messages/${personToChat}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: value }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      const data = await response.json();
      console.log(data);
      setValue(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h3>Chat with {name}</h3>
      </header>
      <div className="chat-messages">
        {chat.map((message, index) => (
          <div
            key={`${message.content}-${index}`}
            className={`message ${
              message.username === loginUser.username ? "sent" : "received"
            }`}
          >
            <div className="message-info">
              {loginUser.username === message.username ? (
                <strong>you</strong>
              ) : (
                <strong>{message.sender}</strong>
              )}
              <span className="message-time">{message.createdAt}</span>
            </div>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
