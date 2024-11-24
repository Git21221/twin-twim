import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store/store.ts"; // Adjust the path based on your setup
import { fetchAvailableUsers, fetchUserProfile } from "../slices/userSlice.ts";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/store.ts"; // Adjust the path based on your setup

const Home = () => {
  const { users, profile, loading, error } = useSelector(
    (state: RootState) => state.users
  );
  console.log(users, profile, loading, error);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Fetch profile only if it's not available or we are in error state
  useEffect(() => {
      try {
        dispatch(fetchUserProfile());
        dispatch(fetchAvailableUsers());
      } catch (error: any) {
        console.log(error.message);
        if(error.message === "Unauthorized") {
          navigate("/login");
        }
      }
  }, [dispatch]);
  
  const handleChatClick = async (id: string, name: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/twims/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: id }),
        credentials: "include",
      });

      const data = await response.json();
      navigate(`/chat/${data.data?._id}/${name}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // Loading state
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h3>Welcome, {profile?.firstName || "User"}!</h3>
      <h4>Your Profile:</h4>
      {profile ? (
        <div>
          <p>
            <strong>Name:</strong> {profile.firstName} {profile.lastName}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Username:</strong> {profile.username}
          </p>
        </div>
      ) : (
        <p>No profile found.</p>
      )}

      <h4>Available Users:</h4>
      {error ? (
        <p>{error}</p> // Show error message if any
      ) : users?.length > 0 ? (
        users.map((user: any) => (
          <div key={user._id}>
            <h4 onClick={() => handleChatClick(user._id, user.firstName)}>
              {user.firstName} {user.lastName}
            </h4>
          </div>
        ))
      ) : (
        <p>No available users.</p>
      )}
    </>
  );
};

export default Home;
