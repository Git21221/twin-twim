import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types for the state
interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
}
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  lastMessage: ChatMessage | null;
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export interface OtherUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  _id: string;
}

interface UserState {
  users: User[];
  profile: UserProfile | null;
  otherUserProfile: OtherUserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  profile: null,
  otherUserProfile: null,
  loading: false,
  error: null,
};

// Async thunk for fetching available users
export const fetchAvailableUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchAvailableUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/twims`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available users");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchAvailableUsersWithChat = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchAvailableUsersWithChat", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/twimsWithChat`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available users");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>("users/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/me`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized");
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchUserById = createAsyncThunk<
  OtherUserProfile,
  string,
  { rejectValue: string }
>("user/fetchUserById", async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/user/${userId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      const { _id, lastMessage } = action.payload;
      const userIndex = state.users.findIndex((user) => user._id === _id);

      if (userIndex !== -1) {
        // Update existing user's lastMessage
        state.users[userIndex].lastMessage = lastMessage;
      } else {
        // Add new user if not found
        state.users.push(action.payload);
      }

      // Sort users by the most recent message
      state.users.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const dateB = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return dateB - dateA;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle available users
      .addCase(fetchAvailableUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAvailableUsers.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.loading = false;
          state.users = action.payload;
        }
      )
      .addCase(
        fetchAvailableUsers.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error =
            action.payload || "An error occurred while fetching users.";
        }
      )
      .addCase(fetchAvailableUsersWithChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAvailableUsersWithChat.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.loading = false;
          state.users = action.payload;
        }
      )
      .addCase(
        fetchAvailableUsersWithChat.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error =
            action.payload || "An error occurred while fetching users.";
        }
      )
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<UserProfile>) => {
          state.loading = false;
          state.error = null;
          state.profile = action.payload;
        }
      )
      .addCase(
        fetchUserProfile.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.profile = null;
          state.error =
            action.payload ||
            "An error occurred while fetching the user profile.";
        }
      )
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserById.fulfilled,
        (state, action: PayloadAction<OtherUserProfile>) => {
          state.loading = false;
          state.error = null;
          state.otherUserProfile = action.payload;
        }
      )
      .addCase(
        fetchUserById.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.otherUserProfile = null;
          state.error =
            action.payload ||
            "An error occurred while fetching the user profile.";
        }
      );
  },
});

export default userSlice;
export const { setUser } = userSlice.actions;
