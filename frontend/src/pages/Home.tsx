import ChatLogo from "../components/outsideOptions/ChatLogo.tsx";
import Logo from "../components/outsideOptions/Logo.tsx";
import AvailableUserChat from "../components/leftSide/AvailableUserChat.tsx";
import Searchbar from "../components/leftSide/Searchbar.tsx";
import Profile from "../components/leftSide/Profile.tsx";
import { Chats, EmptyChat } from "../components/rightSide/Chats.tsx";
import { useState } from "react";

const Home = () => {
  const [emptyChat, setEmptyChat] = useState(true);
  const [personToChat, setPersonToChat] = useState("");

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
          <div className="leftSide max-w-[350px]">
            <Searchbar />
            <AvailableUserChat
              setEmptyChat={setEmptyChat}
              setPersonToChat={setPersonToChat}
            />
            <Profile />
          </div>
          <div className="rightSide">
            {emptyChat ? <EmptyChat /> : <Chats personToChat={personToChat} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
