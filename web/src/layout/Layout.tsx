// Logic ✅

import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-auto">
        {/* this outlet acts as a placeholder for the child route components in the parent route component. 
        <Route:Layout> {<Route /> <Route /> ... } </Route>
        */}
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
