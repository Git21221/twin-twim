import { createSlice } from "@reduxjs/toolkit";

interface wda {
  user: object | null;
}

const initialState: wda = {
  user: null,
};

const availableUserSlice = createSlice({
  name: "availableUser",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = availableUserSlice.actions;
export default availableUserSlice;
