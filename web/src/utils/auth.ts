import { AxiosError } from "axios";
import { store } from "../store";
import { setUser, logout } from "../store/slices/authSlice";
import api from "./api";

export const fetchUserProfile = async () => {
  try {
    // try to use cached user data while waiting for API
    try {
      const cachedUser = localStorage.getItem("cached_user");
      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        store.dispatch(setUser(userData));
      }
    } catch (error) {
      console.error("Error loading cached user data:", error);
    }

    const response = await api.get("/me");
    if (response.status === 200) {
      store.dispatch(setUser(response.data));
      return response.data;
    }
  } catch (err) {
    const axiosError = err as AxiosError;

    if (axiosError.response) {
      if (axiosError.response.status === 401) {
        store.dispatch(logout());
      }
    }
    return null;
  }
};
