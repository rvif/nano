import { createSlice } from "@reduxjs/toolkit";

type AppearanceType = "light" | "dark";

const prefersDarkMode = localStorage.getItem("prefersDarkMode") == "true";

interface ThemeState {
  appearance: AppearanceType;
  accentColor: string;
  grayColor: string;
  panelBackground: string;
  radius: string;
  scaling: string;
}
const initialState: ThemeState = {
  appearance: prefersDarkMode ? "dark" : "light",
  accentColor: "iris",
  grayColor: "slate",
  panelBackground: "solid",
  radius: "small",
  scaling: "95%",
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleAppearance: (state) => {
      state.appearance = state.appearance === "light" ? "dark" : "light";
      localStorage.setItem(
        "prefersDarkMode",
        state.appearance === "dark" ? "true" : "false"
      );
    },
  },
});

export const { toggleAppearance } = themeSlice.actions;
export default themeSlice.reducer;
