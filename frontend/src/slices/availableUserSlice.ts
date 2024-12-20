import { createSlice } from "@reduxjs/toolkit";

interface wda {
  user: object | null;
  onlineUsers: string[] | null;
}

const initialState: wda = {
  user: null,
  onlineUsers: null,
};

const availableUserSlice = createSlice({
  name: "availableUser",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const { setUser, setOnlineUsers } = availableUserSlice.actions;
export default availableUserSlice;
