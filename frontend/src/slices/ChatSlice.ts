import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
}

interface ChatState {
  loading: boolean;
  messages: ChatMessage[];
  error: string | null;
}

const initialState: ChatState = {
  loading: false,
  messages: [],
  error: null,
};

export const getAllChats = createAsyncThunk<ChatMessage[], string, { rejectValue: string }>(
  "chat/getMessages",
  async (personToChat, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/messages/${personToChat}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "An unknown error occurred");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllChats.fulfilled, (state, action: PayloadAction<ChatMessage[]>) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(getAllChats.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.messages = [];
        state.error = action.payload || "Failed to fetch messages";
      });
  },
});

export default chatSlice;

export const { addMessage } = chatSlice.actions;
