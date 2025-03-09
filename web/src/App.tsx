import "@radix-ui/themes/styles.css";
import "./App.css";
import { Text, Theme, ThemePanel } from "@radix-ui/themes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";

import { useAppSelector } from "./store/hooks";

function App() {
  const themeState = useAppSelector((state) => state.theme);
  return (
    <>
      <Theme
        appearance={themeState.appearance}
        accentColor="iris"
        grayColor="slate"
        panelBackground="solid"
        radius="small"
        scaling="95%"
      >
        <BrowserRouter>
          <Routes>
            {/* Main layout */}
            <Route path="/" element={<Layout />}>
              {/* index attr defines default route for current parent route */}
              <Route index element={<Text>Home</Text>} />
              <Route path="about" element={<Text>About</Text>} />
              <Route path="contact" element={<Text>Contact</Text>} />
            </Route>
          </Routes>
        </BrowserRouter>
        <ThemePanel />
      </Theme>
    </>
  );
}

export default App;
