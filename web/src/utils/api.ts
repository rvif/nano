import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { checkTokenExpiration, refreshAccessToken } from "./tokenRefresh";

// API client with updated baseURL handling
const api = axios.create({
  // The main issue was here - we need to modify how the base URL works
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_API_URL // In production, use relative path with nginx proxy
    : "/api/v1", // In development, use direct api/v1 path
  timeout: 30000, // Increased timeout for uploads
  maxRedirects: 0,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add debug info for troubleshooting
const isProduction = import.meta.env.PROD;
if (!isProduction) {
  console.log("API client running in development mode");
}

// request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    // For debugging - log the full URL being requested
    if (!isProduction) {
      console.debug(`Making request to: ${config.baseURL}${config.url}`);
    }

    // Check if token needs refreshing before making any request
    if (checkTokenExpiration()) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      }
    }

    // Special handling for multipart/form-data
    if (config.data instanceof FormData) {
      // Let the browser set the Content-Type with boundary
      delete config.headers["Content-Type"];
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

    // Log the error details in development
    if (!isProduction) {
      console.error("API Error:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    }

    // If we get response as 401 Unauthorized -> we haven't already tried to refresh the token
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;

      // Try to refresh the token
      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        if (!isProduction) {
          console.error("Token refresh failed:", refreshError);
        }
        // If refresh fails, logout
        store.dispatch(logout());
        return Promise.reject(error);
      }
    }

    // If token refresh failed or another error occurred
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
