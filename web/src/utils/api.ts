import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { checkTokenExpiration, refreshAccessToken } from "./tokenRefresh";

// #!!##!!##!!##!!##!!# axios API client  #!!##!!##!!##!!##!!##!!# //

const api = axios.create({
  baseURL: import.meta.env.PROD ? "/api/v1" : "http://localhost:8080/api/v1",
  timeout: 10000,
  maxRedirects: 0, // Don't follow redirects automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    // Check if token needs refreshing before making any request
    if (checkTokenExpiration()) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      }
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get response as 401 Unauthorized -> we haven't already tried to refresh the token
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;

      // Try to refresh the token
      const newToken = await refreshAccessToken();

      if (newToken) {
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    // If token refresh failed or another error occurred
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // console.log("Received 401 unauthorized response");
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
