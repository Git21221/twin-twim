import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppDispatch } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  getAllChats,
  resetMessages,
  setTyping,
} from "../../slices/ChatSlice";
import { useSocket } from "../../context/SocketContext";
// import { parse } from "cookie";

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
  chatId: string;
}

export function Chats({ chatId }: ChatsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading } = useSelector((state: any) => state.chat);
  const { profile } = useSelector((state: any) => state.users);
  const { socket } = useSocket(); // Use the WebSocket instance from Context
  const [page, setPage] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Utility to determine message date label
  const getDateLabel = (messageDate: string) => {
    const messageTime = new Date(messageDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (
      messageTime.getDate() === today.getDate() &&
      messageTime.getMonth() === today.getMonth() &&
      messageTime.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    } else if (
      messageTime.getDate() === yesterday.getDate() &&
      messageTime.getMonth() === yesterday.getMonth() &&
      messageTime.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    } else {
      return messageTime.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    return messages.reduce((acc: any, message: Message) => {
      const dateLabel = getDateLabel(message.createdAt);
      if (!acc[dateLabel]) {
        acc[dateLabel] = [];
      }
      acc[dateLabel].push(message);
      return acc;
    }, {});
  }, [messages]);

  // Scroll to bottom on message update
  useEffect(() => {
    if (chatContainerRef.current && page === 0) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    if(container.scrollTop === 0 && !loading && messages.length > 0){
      const previousHeight = container.scrollHeight;
      setPage(page + 1);
      dispatch(getAllChats({ chatId, page: page + 1, limit: 10 })).then(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - previousHeight;
      });
    }
  }, [chatId, dispatch, loading, messages.length, page]);

  // scroll to bottom of the chat
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  // Reset messages and load the first page when the chatId changes
  useEffect(() => {
    setPage(0);
    dispatch(resetMessages());
    dispatch(getAllChats({ chatId, page: 0, limit: 10 }));

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatId, dispatch]);

  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    // Join the chat room
    socket.emit("chat", chatId);

    // Listen for new messages
    socket.on("message", (message: any) => {
      if (message.chat === chatId) {
        dispatch(addMessage(message));
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      }
    });

    // Listen for typing events
    socket.on("typing", (e) => {
      console.log("Typing event", e);

      dispatch(setTyping({ _id: e, isTyping: true }));
    });

    // Listen for stopped typing events
    socket.on("stoppedTyping", (e) => {
      dispatch(setTyping({ _id: e, isTyping: false }));
    });

    return () => {
      socket.off("message");
      socket.off("typing");
      socket.off("stoppedTyping");
    };
  }, [chatId, socket, dispatch]);

  // Render the chat messages
  return (
    <div
      ref={chatContainerRef}
      className="scroll-smooth border-l border-[--main-background-color] h-[calc(100vh-185px)] w-[calc(100vw-406px)] overflow-y-auto"
    >
      <div className="max-w-[1266px] mx-auto">
        {Object.keys(groupedMessages).map((dateLabel) => (
          <div key={dateLabel}>
            {/* Date label */}
            <div className="text-center bg-[--chat-active-color] my-4 mx-auto w-fit p-2 rounded-md">
              {dateLabel}
            </div>
            {/* Messages for this date */}
            {groupedMessages[dateLabel].map((message: Message, i: any) => (
              <div
                key={i}
                className={`pb-6 pt-4 flex ${
                  message.sender._id === profile._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
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
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </p>
        )}
      </div>
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
