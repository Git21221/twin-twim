import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { fetchAvailableUsers, fetchUserProfile } from "../../slices/userSlice";

interface AvailableUserChatProps {
  setEmptyChat: React.Dispatch<React.SetStateAction<boolean>>;
  setPersonToChat: React.Dispatch<React.SetStateAction<string>>;
}

const AvailableUserChat: React.FC<AvailableUserChatProps> = ({
  setEmptyChat,
  setPersonToChat,
}: {
  setEmptyChat: any;
  setPersonToChat: any;
}) => {
  const { users, profile, loading, error } = useSelector(
    (state: RootState) => state.users
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Fetch profile only if it's not available or we are in error state
  useEffect(() => {
    try {
      dispatch(fetchUserProfile());
      dispatch(fetchAvailableUsers());
    } catch (error: any) {
      console.log(error.message);
      if (error.message === "Unauthorized") {
        navigate("/login");
      }
    }
  }, [dispatch]);

  const handleChatClick = async (id: string, name: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/twims/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ to: id }),
          credentials: "include",
        }
      );

      const data = await response.json();
      // navigate(`/chat/${data.data?._id}/${name}`);
      setEmptyChat(false);
      setPersonToChat(data?.data?._id);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // Loading state
  if (loading) return <p>Loading...</p>;

  return (
    <div className="overflow-y-auto max-w-[350px] h-[calc(100vh-220px)]">
      {users?.length > 0 ? (
        <>
          {error ? (
            <p>{error}</p> // Show error message if any
          ) : users?.length > 0 ? (
            users.map((user: any) => (
              <div
                key={user._id}
                className="max-w-[338px] p-4 hover:bg-[--chat-hover-color] m-[6px] rounded-lg"
              >
                <div className="flex gap-[22px] items-center">
                  <div className="profilePic">
                    <div className="circle w-10 h-10 rounded-full bg-[--main-text-color]"></div>
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                      <p
                        className="text-[15px] font-medium"
                        onClick={() =>
                          handleChatClick(user._id, user.firstName)
                        }
                      >
                        {user.firstName} {user.lastName}
                      </p>
                      <div className="time text-sm font-light">2:41 AM</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-light break-words line-clamp-1 max-w-[220px]">
                        last message wda dwa wdahwda jhwda jhwdsa hwda wdha
                      </p>
                      <div className="count bg-[--highlighted-color] rounded-full h-6 w-6 text-[--main-chat-text-color] flex items-center justify-center text-sm font-semibold">
                        5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No available users.</p>
          )}
        </>
      ) : (
        <p>No available users.</p>
      )}
    </div>
  );
};

export default AvailableUserChat;
