import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AppearanceType = "light" | "dark";

interface ThemeState {
  appearance: AppearanceType;
  accentColor: string;
  grayColor: string;
  panelBackground: string;
  radius: string;
  scaling: string;
}
const initialState: ThemeState = {
  appearance: "light",
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
    },
  },
});

export const { toggleAppearance } = themeSlice.actions;
export default themeSlice.reducer;
