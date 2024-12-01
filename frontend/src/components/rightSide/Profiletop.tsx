import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchUserById } from "../../slices/userSlice";
import { Search } from "@mui/icons-material";
import SearchIcon from "../SearchIcon";

function Profiletop({ personToChat }: { personToChat: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const { otherUserProfile, loading, error } = useSelector(
    (state: RootState) => state.users
  );
  console.log(otherUserProfile);

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
          Last seen
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
