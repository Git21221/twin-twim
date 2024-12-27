import { useEffect } from "react";
import Settings from "../Settings";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/store";
import { fetchUserProfile } from "../../slices/userSlice";
import { RiVerifiedBadgeFill } from "react-icons/ri";

function Profile() {
  const {profile} = useSelector((state: any) => state.users);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);
  return (
    <div className="sticky bottom flex items-center justify-between px-[15px] py-[10px] border-t border-[--main-background-color]">
      <div className="profile flex gap-[14px] items-center">
        <div className="profilePic">
          <div className="circle h-10 w-10 rounded-full bg-[--main-text-color]"></div>
        </div>
        <div className="names">
          <div className="userFullName font-medium word-wrap line-clamp-1 max-w-[230px] flex items-center gap-1">{profile?.firstName} {profile?.lastName} {profile?.isVerified ? <RiVerifiedBadgeFill className="text-[--highlighted-color]" /> : null}</div>
          <div className="userBio word-wrap line-clamp-1 font-light text-[13px]">Hello, I am using Twin Twim.</div>
        </div>
      </div>
      <div className="settings">
        <Settings />
      </div>
    </div>
  );
}

export default Profile;
