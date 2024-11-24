import { createSlice } from "@reduxjs/toolkit";

interface AuthStateTypes {
  isAuthenticated: boolean;
  loggedInUser: object | null;
  loading: boolean;
}

const initialState: AuthStateTypes = {
  isAuthenticated: false,
  loggedInUser: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
    },
    login: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.loggedInUser = action.payload.user;
      state.loading = false;
    },
    loginFailure: (state) => {
      state.loading = false;
    },
  },
});

export const { startLoading, login, loginFailure } = authSlice.actions;
export default authSlice;
