import { createSlice } from "@reduxjs/toolkit";

interface MessageState {
  newMessage: string;
  submit: boolean;
}

const initialState:MessageState = {
  newMessage: "",
  submit: false,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addNewMessage: (state, action) => {
      state.newMessage = action.payload;
    },
    submitMessage: (state) => {
      state.submit = true;
    },
    resetSubmit: (state) => {
      state.submit = false;
    },
    resetMessage: (state) => {
      state.newMessage = "";
    },
  },
});

export const { addNewMessage, submitMessage, resetSubmit, resetMessage } = messageSlice.actions;
export default messageSlice;