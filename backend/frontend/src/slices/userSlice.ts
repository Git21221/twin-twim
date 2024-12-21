import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types for the state
interface User {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface UserProfile {
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
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/twims`, {
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
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/me`, {
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
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/user/${userId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

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
  reducers: {},
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
      // Handle user profile
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
