import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id?: string;
  username?: string;
  email?: string;
  pfpUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: (() => {
    try {
      const cachedUser = localStorage.getItem("cached_user");
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch (error) {
      console.error("Error loading cached user:", error);
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
      state.loading = false;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      try {
        // Cache user data when it's set
        if (action.payload) {
          localStorage.setItem("cached_user", JSON.stringify(action.payload));
        } else {
          localStorage.removeItem("cached_user");
        }
      } catch (error) {
        console.error("Error caching user data:", error);
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      try {
        localStorage.removeItem("cached_user");
        localStorage.removeItem("cached_user_urls");
        localStorage.removeItem("token");
      } catch (error) {
        console.error("Error clearing cached data:", error);
      }
    },
  },
});

export const { loginStart, loginSuccess, setUser, logout } = authSlice.actions;

export default authSlice.reducer;
