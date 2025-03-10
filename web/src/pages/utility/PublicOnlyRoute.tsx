import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

/**
 * PublicOnlyRoute - A wrapper component that prevents authenticated users from
 * accessing routes that should only be available to unauthenticated users (like login pages).
 *
 * If the user is authenticated, they will be redirected to the home page.
 */
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // if the user is authenticated, redirect them to the home page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // otherwise, render the children (the auth page)
  return <>{children}</>;
};

export default PublicOnlyRoute;
