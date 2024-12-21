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
  isTyping: boolean;
  isOnline: boolean;
  lastMessage: ChatMessage | null;
}

interface Props{
  chatId: string;
  page: number;
  limit: number;
}

const initialState: ChatState = {
  loading: false,
  messages: [],
  error: null,
  isTyping: false,
  isOnline: false,
  lastMessage: null,
};

export const getAllChats = createAsyncThunk<ChatMessage[], Props, { rejectValue: string }>(
  "chat/getMessages",
  async ({chatId, page, limit}, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/messages/${chatId}?page=${page}&limit=${limit}`,
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

export const getLastMessage = createAsyncThunk<ChatMessage, string, { rejectValue: string }>(
  "chat/getLastMessage",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/last-message/${chatId}`,
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
    resetMessages: (state) => {
      state.messages = [];
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    addLastMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.lastMessage = action.payload;
    },
    setIsOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllChats.fulfilled, (state, action: PayloadAction<ChatMessage[]>) => {
        state.loading = false;
        state.messages = [ ...action.payload, ...state.messages ];
      })
      .addCase(getAllChats.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.messages = [];
        state.error = action.payload || "Failed to fetch messages";
      })
      .addCase(getLastMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLastMessage.fulfilled, (state, action: PayloadAction<ChatMessage>) => {
        state.loading = false;
        state.messages = [action.payload];
      })
      .addCase(getLastMessage.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.messages = [];
        state.error = action.payload || "Failed to fetch messages";
      });
  },
});

export default chatSlice;

export const { addMessage, resetMessages, setTyping, addLastMessage, setIsOnline } = chatSlice.actions;
