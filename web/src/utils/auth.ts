import { AxiosError } from "axios";
import { store } from "../store";
import { setUser, logout } from "../store/slices/authSlice";
import api from "./api";

export const fetchUserProfile = async () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return null;
  }

  try {
    const response = await api.get("/me");
    store.dispatch(setUser(response.data));
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      if (axiosError.response.status === 401) {
        store.dispatch(logout());
      }
    }
    return null;
  }
};
