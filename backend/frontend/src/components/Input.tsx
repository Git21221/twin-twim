import { AppDispatch } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { addNewMessage, submitMessage } from "../slices/messageSlice";
import { useSocket } from "../context/SocketContext";

function Input({chatId, personToChat}: {chatId: string, personToChat: string}) {
  const dispatch = useDispatch<AppDispatch>();
  const { newMessage } = useSelector((state: any) => state.message);
  const {profile} = useSelector((state: any) => state.users);
  console.log("logged in user", profile);
  
  const {socket} = useSocket();
  return (
    <input
      value={newMessage}
      onChange={(e) => {
        dispatch(addNewMessage(e.target.value));
        socket?.emit("typing", {chatId, senderId: profile?._id, receiverId: personToChat});
        setTimeout(() => {
          socket?.emit("stoppedTyping", {chatId, senderId: profile?._id, receiverId: personToChat});
        }, 3000);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          dispatch(submitMessage());
        }
      }}
      type="text"
      placeholder="Type a message"
      className="w-full p-3 outline-none bg-transparent"
    />
  );
}

export default Input;
