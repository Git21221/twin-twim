import ChatLogo from "../components/outsideOptions/ChatLogo.tsx";
import Logo from "../components/outsideOptions/Logo.tsx";
import AvailableUserChat from "../components/leftSide/AvailableUserChat.tsx";
import Searchbar from "../components/leftSide/Searchbar.tsx";
import Profile from "../components/leftSide/Profile.tsx";
import { Chats, EmptyChat } from "../components/rightSide/Chats.tsx";
import { useEffect, useState } from "react";
import Profiletop from "../components/rightSide/Profiletop.tsx";
import InputAndReaction from "../components/rightSide/InputAndReaction.tsx";
import { AppDispatch } from "../store/store.ts";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext.tsx";
import { setIsOnline } from "../slices/ChatSlice.ts";

const Home = () => {
  const [emptyChat, setEmptyChat] = useState(true);
  const [personToChat, setPersonToChat] = useState("");
  const [chatId, setChatId] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const {socket} = useSocket();
  const {isOnline} = useSelector((state: any) => state.chat);
  console.log(isOnline);
  useEffect(() => {
    socket?.on("connected", (data) => {
      console.log(data.userId === chatId);
      dispatch(setIsOnline(data?.status === "online"));
    });
    socket?.on("disconnected", (data) => {
      dispatch(setIsOnline(data?.status === "online"));
    });
    return () => {
      socket?.off("connected");
      socket?.off("disconnected");
    };
  }, [chatId, dispatch]);

  return (
    <>
      <div className="top">
        <div className="topBar flex items-center h-[50px]">
          <Logo /> Twin Twim
        </div>
      </div>
      <div className="bottom flex">
        <div className="sidebarOptions relative w-min h-[calc(100vh-50px)]">
          <ChatLogo />
        </div>
        <div className="chatInterface absolute flex bg-[var(--main-chat-background-color)] left-[56px] h-[calc(100vh-50px)] w-[calc(100vw-56px)] rounded-tl-[20px]">
          <div className="leftSide w-[350px]">
            <Searchbar />
            <AvailableUserChat
              setEmptyChat={setEmptyChat}
              setPersonToChat={setPersonToChat}
              setChatId={setChatId}
              chatId={chatId}
            />
            <Profile />
          </div>
          <div className="rightSide">
            {emptyChat ? "" : <Profiletop personToChat={personToChat} />}
            {emptyChat ? <EmptyChat /> : <Chats chatId={chatId} />}
            {emptyChat ? "" : <InputAndReaction chatId={chatId} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
