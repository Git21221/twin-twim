import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import {
  fetchAvailableUsersWithChat,
  fetchUserProfile,
  setUser,
} from "../../slices/userSlice";
import { setIsOnline } from "../../slices/ChatSlice";
import { useSocket } from "../../context/SocketContext";

interface AvailableUserChatProps {
  setEmptyChat: React.Dispatch<React.SetStateAction<boolean>>;
  setPersonToChat: React.Dispatch<React.SetStateAction<string>>;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
  chatId: string;
}

const AvailableUserChat: React.FC<AvailableUserChatProps> = ({
  setEmptyChat,
  setPersonToChat,
  setChatId,
}) => {
  const { users, error } = useSelector((state: RootState) => state.users);
  interface TypingState {
    isTyping: boolean;
    senderId: string;
    receiverId: string;
    chatId: string;
  }

  const [typing, setTyping] = useState<TypingState>({
    isTyping: false,
    senderId: "",
    receiverId: "",
    chatId: "",
  });
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [sortedUsers, setSortedUsers] = useState<any[]>([]); // To hold sorted users
  const [id, setId] = useState<string>("");
  const { socket } = useSocket();

  // Fetch user data and profile on mount
  useEffect(() => {
    try {
      dispatch(fetchUserProfile());
      dispatch(fetchAvailableUsersWithChat());
    } catch (error: any) {
      console.log(error.message);
      if (error.message === "Unauthorized") {
        navigate("/login");
      }
    }
  }, [dispatch, navigate]);

  // Sort users by lastMessage date
  useEffect(() => {
    const sorted = [...users].sort((a, b) => {
      const dateA = a?.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const dateB = b?.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return dateB - dateA;
    });
    setSortedUsers(sorted);
  }, [users]);

  // Handle new message event
  useEffect(() => {
    const handleNewMessage = (newMessage: any) => {
      // Dispatch the setUser action to update the Redux state
      if (newMessage?.sender?._id) {
        dispatch(
          setUser({
            _id: newMessage.sender._id,
            firstName: newMessage.sender.firstName,
            lastName: newMessage.sender.lastName,
            lastMessage: {
              id: newMessage._id,
              sender: newMessage.sender._id,
              content: newMessage.content,
              createdAt: newMessage.createdAt,
            },
          })
        );
      }
    };

    // Listen for the message event on the WebSocket
    const messageEvent = (event: any) => {
      console.log("New message received:", event);
      handleNewMessage(event);
    };

    socket?.on("message", messageEvent);

    socket?.on("typing", (data: any) => {
      console.log("Typing event received:", data);
      setTyping({...data, isTyping: true});
    });
    socket?.on("stoppedTyping", (data: any) => {
      console.log("Stopped typing event received:", data);
      setTyping({...data, isTyping: false});
    });

    return () => {
      socket?.off("message", messageEvent);
    };
  }, [dispatch, socket]);

  const handleChatClick = async (id: string) => {
    try {
      const response = await fetch(`/api/twims/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: id }),
        credentials: "include",
      });

      const data = await response.json();
      if (data.message === "Chat created") {
        setChatId(data?.data[0]?._id);
        setId(data?.data[0]?._id);
        dispatch(setIsOnline(true));
      } else {
        setChatId(data?.data?._id);
        setId(data?.data?._id);
      }
      setEmptyChat(false);
      setPersonToChat(id);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return (
    <div className="overflow-y-auto max-w-[350px] h-[calc(100vh-207px)]">
      {sortedUsers?.length > 0 ? (
        <>
          {error ? (
            <p>{error}</p>
          ) : (
            sortedUsers.map((user: any) => (
              console.log(user),
              <div
                key={user._id}
                onClick={() => handleChatClick(user._id)}
                className={`max-w-[338px] p-4 hover:bg-[--chat-hover-color] m-[6px] rounded-lg ${
                  id === user?.lastMessage?.chat
                    ? "bg-[--chat-active-color]"
                    : ""
                }`}
              >
                <div className="flex gap-[22px] items-center">
                  <div className="profilePic">
                    <div className="circle w-10 h-10 rounded-full bg-[--main-text-color]"></div>
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                      <p className="text-[15px] font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <div className="time text-sm font-light">
                        {user?.lastMessage?.createdAt
                          ? new Date(
                              user.lastMessage.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : ""}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-light break-words line-clamp-1 max-w-[220px]">
                        {typing && typing?.senderId === user._id && typing.isTyping ? (
                          <span className="text-[--highlighted-color]">
                            typing...
                          </span>
                        ) : user.lastMessage?.content ? (
                          user.lastMessage.content
                        ) : (
                          <span className="text-gray-500">No messages yet</span>
                        )}
                      </span>

                      <span className="count bg-[--highlighted-color] rounded-full text-[--main-chat-text-color] flex items-center justify-center text-sm font-semibold px-[6px]">
                        5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      ) : (
        <p>No available users.</p>
      )}
    </div>
  );
};

export default AvailableUserChat;
