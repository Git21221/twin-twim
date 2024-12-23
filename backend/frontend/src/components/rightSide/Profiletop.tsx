import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchUserById } from "../../slices/userSlice";
import SearchIcon from "../SearchIcon";
import { useSocket } from "../../context/SocketContext";

function Profiletop({
  personToChat,
}: {
  personToChat: string;
  chatId: string;
}) {
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
  console.log("person typing", typing);
  
  const dispatch = useDispatch<AppDispatch>();
  const { otherUserProfile, profile } = useSelector((state: RootState) => state.users);
  console.log("profile", profile);
  
  const { onlineUsers } = useSelector(
    (state: RootState) => state.availableUser
  );
  const { socket } = useSocket();
  console.log("other user profile", otherUserProfile);

  useEffect(() => {
    socket?.on("typing", (data: any) => {
      console.log("Typing event received:", data);
      setTyping({ ...data, isTyping: true });
    });
    socket?.on("stoppedTyping", (data: any) => {
      console.log("Stopped typing event received:", data);
      setTyping({ ...data, isTyping: false });
    });
    return () => {
      socket?.off("typing");
      socket?.off("stoppedTyping");
    };
  }, [socket]);
  useEffect(() => {
    dispatch(fetchUserById(personToChat));
  }, [dispatch, personToChat]);
  return (
    <div className="flex justify-between items-center border-b border-l border-[--main-background-color] px-6 py-3">
      <div className="profile flex gap-[22px] items-center">
        <div className="profilePic">
          <div className="circle h-[45px] w-[45px] rounded-full bg-[--main-text-color]"></div>
        </div>
        <div className="profileNameAndLastSeen flex flex-col gap-[2px]">
          <div className="profileName text-[var(--main-text-color)] font-semibold">
            {otherUserProfile?.firstName} {otherUserProfile?.lastName}
          </div>
          <div className="lastSeen text-[var(--main-text-color)] text-xs font-light">
            {typing && typing?.senderId === personToChat && typing.isTyping ? (
              <p className="text-[--highlighted-color]">typing...</p>
            ) : otherUserProfile?._id &&
              onlineUsers?.includes(otherUserProfile._id) ? (
              "online"
            ) : null}
          </div>
        </div>
      </div>
      <div className="search">
        <SearchIcon />
      </div>
    </div>
  );
}

export default Profiletop;
