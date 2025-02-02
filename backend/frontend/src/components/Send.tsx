import { useEffect } from "react";
import { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../slices/ChatSlice";
import { resetMessage, resetSubmit } from "../slices/messageSlice";
import { setUser } from "../slices/userSlice";

function Send({ chatId, personToChat }: { chatId: string, personToChat: string }) {
  const { newMessage, submit } = useSelector(
    (state: RootState) => state.message
  );
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: any) => state.users);

  useEffect(() => {
    if (submit) {
      handleSendMessage().then(() => {
        dispatch(resetSubmit());
      });
    }
  }, [submit]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    //optimistic update
    dispatch(
      addMessage({
        id: profile?._id,
        sender: profile,
        content: newMessage,
        createdAt: new Date().toISOString(),
      })
    );

    try {
      const response = await fetch(`/api/messages/${chatId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      const data = await response.json();
      console.log("Message sent:", data);
      if (data.statusCode === 200) {
        dispatch(
          setUser({
            _id: personToChat,
            firstName: "",
            lastName: "",
            lastMessage: {
              id: data.message._id,
              sender: profile, // Use "me" or your current user ID
              content: newMessage,
              createdAt: new Date().toISOString(),
            },
          })
        );
      }
      dispatch(resetMessage()); // Clear input after sending
    } catch (error) {}
  };
  return (
    <div onClick={handleSendMessage} className="p-3">
      <svg
        width="21"
        height="21"
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.5612 0.438999C20.3726 0.250498 20.1371 0.115688 19.879 0.048456C19.621 -0.018776 19.3497 -0.0159996 19.093 0.0564992H19.079L1.08461 5.5165C0.792481 5.60069 0.53283 5.77166 0.340066 6.00676C0.147302 6.24185 0.0305249 6.52997 0.00521012 6.83294C-0.0201046 7.1359 0.047238 7.4394 0.198314 7.70323C0.34939 7.96705 0.577067 8.17874 0.851173 8.31025L8.81242 12.1877L12.6843 20.1443C12.8047 20.4013 12.9962 20.6185 13.2361 20.7701C13.476 20.9218 13.7542 21.0017 14.038 21.0002C14.0812 21.0002 14.1243 20.9984 14.1674 20.9946C14.4701 20.9701 14.7581 20.8536 14.9927 20.6607C15.2273 20.4678 15.3973 20.2078 15.4799 19.9156L20.9362 1.92119C20.9362 1.9165 20.9362 1.91181 20.9362 1.90712C21.0096 1.65115 21.0136 1.38024 20.9477 1.12223C20.8818 0.864215 20.7484 0.628396 20.5612 0.438999ZM14.0465 19.4862L14.0418 19.4993V19.4927L10.2862 11.7771L14.7862 7.27712C14.9209 7.13533 14.9949 6.94651 14.9924 6.75094C14.9899 6.55537 14.9111 6.36852 14.7728 6.23022C14.6345 6.09191 14.4476 6.01311 14.252 6.01061C14.0565 6.0081 13.8677 6.0821 13.7259 6.21681L9.22586 10.7168L1.50742 6.96119H1.50086H1.51399L19.4999 1.50025L14.0465 19.4862Z"
          fill="#F0F8FF"
        />
      </svg>
    </div>
  );
}

export default Send;
