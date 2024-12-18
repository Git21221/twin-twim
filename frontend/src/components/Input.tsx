import { AppDispatch } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { addNewMessage, submitMessage } from "../slices/messageSlice";
import { setTyping } from "../slices/ChatSlice";
import { useSocket } from "../context/SocketContext";

function Input({chatId}: {chatId: string}) {
  const dispatch = useDispatch<AppDispatch>();
  const { newMessage } = useSelector((state: any) => state.message);
  const {socket} = useSocket();
  return (
    <input
      value={newMessage}
      onChange={(e) => {
        dispatch(addNewMessage(e.target.value));
        socket?.emit("typing", chatId);
        setTimeout(() => {
          socket?.emit("stoppedTyping", chatId);
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
