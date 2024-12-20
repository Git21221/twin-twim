import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { fetchAvailableUsers, fetchUserProfile } from "../../slices/userSlice";
import { setIsOnline } from "../../slices/ChatSlice";
import { useSocket } from "../../context/SocketContext";
import { DisabledByDefault } from "@mui/icons-material";

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
}: {
  setEmptyChat: any;
  setPersonToChat: any;
  setChatId: any;
  chatId: string;
}) => {
  const { users, error } = useSelector(
    (state: RootState) => state.users
  );
  const dispatch = useDispatch<AppDispatch>();
  const {onlineUsers} = useSelector((state: RootState) => state.availableUser);
  const navigate = useNavigate();
  const [id, setId] = React.useState("");

  // Fetch profile only if it's not available or we are in error state
  useEffect(() => {
    try {
      dispatch(fetchUserProfile());
      dispatch(fetchAvailableUsers());
      // dispatch(getLastMessage(chatId));
    } catch (error: any) {
      console.log(error.message);
      if (error.message === "Unauthorized") {
        navigate("/login");
      }
    }
  }, [dispatch]);

  const handleChatClick = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/twims/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ to: id }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.message == "Chat created") {
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

  // Loading state
  // if (loading) return <p>Loading...</p>;

  return (
    <div className="overflow-y-auto max-w-[350px] h-[calc(100vh-207px)]">
      {users?.length > 0 ? (
        <>
          {error ? (
            <p>{error}</p> // Show error message if any
          ) : users?.length > 0 ? (
            users.map((user: any) => (
              <div
                key={user._id}
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
                      <p
                        className="text-[15px] font-medium"
                        onClick={() =>
                          handleChatClick(user._id)
                        }
                      >
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
                        {user.lastMessage ? user.lastMessage.content : ""}
                      </span>
                      <span className="count bg-[--highlighted-color] rounded-full text-[--main-chat-text-color] flex items-center justify-center text-sm font-semibold px-[6px]">
                        5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No available users.</p>
          )}
        </>
      ) : (
        <p>No available users.</p>
      )}
    </div>
  );
};

export default AvailableUserChat;
