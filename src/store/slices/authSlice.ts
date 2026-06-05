import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, UserProfile } from "@/types";

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{ id: string; email: string } | null>
    ) {
      state.user = action.payload;
      state.isLoading = false;
    },

    setProfile(state, action: PayloadAction<UserProfile | null>) {
      state.profile = action.payload;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    logout(state) {
      state.user = null;
      state.profile = null;
      state.isLoading = false;
    },
  },
});

export const { setUser, setProfile, setLoading, logout } = authSlice.actions;

export default authSlice.reducer;
