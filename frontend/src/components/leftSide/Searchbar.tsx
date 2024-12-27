import React, { useState } from "react";
import SearchIcon from "../SearchIcon";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { searchTwim, setIsOnline } from "../../slices/ChatSlice";

interface SearchbarProps {
  setEmptyChat: React.Dispatch<React.SetStateAction<boolean>>;
  setPersonToChat: React.Dispatch<React.SetStateAction<string>>;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
}

const Searchbar: React.FC<SearchbarProps> = ({
  setEmptyChat,
  setPersonToChat,
  setChatId,
}: {
  setEmptyChat: any;
  setPersonToChat: any;
  setChatId: any;
}) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.chat);
  console.log(user);
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
      console.log(data);

      if (data.message === "Chat created") {
        setChatId(data?.data[0]?._id);
        dispatch(setIsOnline(true));
      } else {
        setChatId(data?.data?._id);
        dispatch(setIsOnline(true));
      }
      setEmptyChat(false);
      setPersonToChat(id);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };
  return (
    <div className="relative flex flex-col">
      <div className="sticky border border-b-[3px] border-[--main-background-color] px-4 py-3 m-5 rounded-lg flex gap-3 items-center">
        <SearchIcon />
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setOpenModal(true);
              dispatch(searchTwim(search));
            }
          }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder="Search with username"
          className="w-full bg-transparent outline-none border-none"
        />
      </div>
      {openModal && (
        <div
          className="absolute top-[60px] px-4 py-3 m-5 border border-[--main-background-color] rounded-lg flex items-center justify-between z-50 bg-[--main-chat-background-color] w-[-webkit-fill-available]"
          onClick={() => {
            if (user) {
              setOpenModal(false);
              handleChatClick(user?._id || "");
            }
          }}
        >
          {user ? (
            <p>
              {user?.firstName} {user?.lastName}
            </p>
          ) : (
            <span className="italic text-neutral-400">No such suer exist</span>
          )}
          <button onClick={() => {
            setOpenModal(false);
          }} className="py-1 px-3 rounded-full bg-cyan-800">X</button>
        </div>
      )}
    </div>
  );
};

export default Searchbar;
