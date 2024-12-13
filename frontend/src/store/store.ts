import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../slices/authSlice.js";
import availableUserSlice from "../slices/availableUserSlice.js";
import userSlice from "../slices/userSlice.js";
import chatSlice from "../slices/ChatSlice.js";
import messageSlice from "../slices/messageSlice.js";
import { loginMiddleware } from "../slices/middleware.ts/loginMiddleware.js";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    availableUser: availableUserSlice.reducer,
    users: userSlice.reducer,
    chat: chatSlice.reducer,
    message: messageSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loginMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
