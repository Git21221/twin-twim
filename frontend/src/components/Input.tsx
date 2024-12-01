import React from "react";
import { AppDispatch } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { addNewMessage, submitMessage } from "../slices/messageSlice";

function Input() {
  const dispatch = useDispatch<AppDispatch>();
  const { newMessage } = useSelector((state: any) => state.message);
  return (
    <input
      value={newMessage}
      onChange={(e) => {
        dispatch(addNewMessage(e.target.value));
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          dispatch(submitMessage());
        }
      }}
      type="text"
      placeholder="Type a message"
      className="w-full p-3 outline-none bg-transparent"
    />
  );
}

export default Input;
