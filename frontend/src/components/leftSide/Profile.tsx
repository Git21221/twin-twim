import React from "react";
import Settings from "../Settings";

function Profile() {
  return (
    <div className="sticky bottom flex items-center justify-between p-[15px]">
      <div className="profile flex gap-[14px] items-center">
        <div className="profilePic">
          <div className="circle h-10 w-10 rounded-full bg-[--main-text-color]"></div>
        </div>
        <div className="names">
          <div className="userFullName font-medium word-wrap line-clamp-1 max-w-[230px]">Saikat Das</div>
          <div className="userBio word-wrap line-clamp-1 font-light text-sm">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugiat, perferendis.</div>
        </div>
      </div>
      <div className="settings">
        <Settings />
      </div>
    </div>
  );
}

export default Profile;
