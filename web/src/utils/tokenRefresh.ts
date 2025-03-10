import { store } from "../store";
import { loginSuccess, logout } from "../store/slices/authSlice";
import api from "./api";

// Helper functions for TokenRefresher.tsx
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await api.post(
      "/auth/refresh-token",
      {},
      {
        headers: {
          Authorization: refreshToken,
        },
      }
    );

    const { access_token } = response.data;
    localStorage.setItem("accessToken", access_token);
    store.dispatch(
      loginSuccess({
        accessToken: access_token,
        refreshToken,
      })
    );

    return access_token;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    store.dispatch(logout());
    return null;
  }
};

export const checkTokenExpiration = (): boolean => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiryTime = payload.expiry * 1000; // milliseconds

    // check if the token will expire in the next hour
    return Date.now() > expiryTime - 3600000; // 3600000 ms = 1 hour
  } catch (error) {
    console.error("Error parsing token:", error);
    return false;
  }
};
