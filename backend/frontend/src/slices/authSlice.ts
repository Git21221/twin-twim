import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface AuthStateTypes {
  isAuthenticated: boolean;
  loggedInUser: object | null;
  loading: boolean;
  getAuthentication: object | null;
}

const initialState: AuthStateTypes = {
  isAuthenticated: false,
  loggedInUser: null,
  loading: false,
  getAuthentication: null,
};

export const getAuth = createAsyncThunk("auth/getAuth", async () => {
  const res = await fetch("/api/auth", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await res.json();
  return data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
    },
    login: (state, action) => {
      state.isAuthenticated = true;
      state.loggedInUser = action.payload.user;
      state.loading = false;
    },
    loginFailure: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAuth.fulfilled, (state, action) => {
      state.getAuthentication = action.payload;
      state.loading = false;
    });
    builder.addCase(getAuth.rejected, (state) => {
      state.getAuthentication = null;
      state.loading = false;
    });
  },
});

export const { startLoading, login, loginFailure } = authSlice.actions;
export default authSlice;
