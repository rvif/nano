// React imports
import React, { Suspense, useEffect, useState } from "react";

// Themes and styles
import "@radix-ui/themes/styles.css";
import "./App.css";
import { Theme, ThemePanel, Spinner } from "@radix-ui/themes";

// Router
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

// Store
import { useAppSelector } from "./store/hooks";

// Layouts
import Layout from "./layout/Layout";
import AuthLayout from "./layout/AuthLayout";
import ProtectedRoute from "./pages/utility/ProtectedRoutes";
import { fetchUserProfile } from "./utils/auth";
import ProfilePage from "./pages/ProfilePage";
import HealthCheckPage from "./pages/utility/HealthCheckPage";
import TokenRefresher from "./components/TokenRefresher";
import ForgotPassword from "./pages/auth/ForgotPassword";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-[800px]">
      <Spinner size="3" />
    </div>
  );
};

// Pages
const HomePage = React.lazy(() => import("./pages/HomePage"));
const ShortnerPage = React.lazy(() => import("./pages/ShortnerPage"));
const MyLinksPage = React.lazy(() => import("./pages/MyLinksPage"));
const LoginPage = React.lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = React.lazy(() => import("./pages/auth/SignupPage"));
const ResetPassword = React.lazy(() => import("./pages/auth/ResetPassword"));
const AnalyticsPage = React.lazy(() => import("./pages/AnalyticsPage"));

// Utility
const NotFoundPage = React.lazy(() => import("./pages/utility/NotFoundPage"));

// TODO: Implement after adding URL logic in the backend
const RedirectingPage = React.lazy(
  () => import("./pages/utility/RedirectingPage")
);
const SlugValidator = React.lazy(() => import("./pages/utility/SlugValidator"));

// Navigation loader component to create loading states during client transitions
const NavigationLoader = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  return <>{children}</>;
};

function App() {
  const themeState = useAppSelector((state) => state.theme);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user]);

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
        <TokenRefresher />

        <BrowserRouter>
          <Routes>
            {/* Main layout */}
            <Route path="/" element={<Layout />}>
              {/* index attr defines default route for current parent route */}
              <Route
                index
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <HomePage />
                    </NavigationLoader>
                  </Suspense>
                }
              />

              <Route
                path="shortner"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <ProtectedRoute>
                        <ShortnerPage />
                      </ProtectedRoute>
                    </NavigationLoader>
                  </Suspense>
                }
              />
              <Route
                path="my-links"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <ProtectedRoute>
                        <MyLinksPage />
                      </ProtectedRoute>
                    </NavigationLoader>
                  </Suspense>
                }
              />

              <Route
                path="analytics"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <ProtectedRoute>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    </NavigationLoader>
                  </Suspense>
                }
              />

              <Route
                path="me"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    </NavigationLoader>
                  </Suspense>
                }
              />

              {/* Public routes */}
              <Route
                path="/:slug"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <SlugValidator />
                    </NavigationLoader>
                  </Suspense>
                }
              />

              <Route
                path="not-found"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <NotFoundPage />
                    </NavigationLoader>
                  </Suspense>
                }
              />

              <Route
                path="health"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <HealthCheckPage />
                    </NavigationLoader>
                  </Suspense>
                }
              />
            </Route>
            {/* End of Main layout */}

            {/* Auth layout */}
            <Route path="auth" element={<AuthLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <NotFoundPage />
                    </NavigationLoader>
                  </Suspense>
                }
              />
              <Route
                path="login"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <LoginPage />
                    </NavigationLoader>
                  </Suspense>
                }
              />
              <Route
                path="signup"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <SignupPage />
                    </NavigationLoader>
                  </Suspense>
                }
              />
              <Route
                path="forgot-password"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <ForgotPassword />
                    </NavigationLoader>
                  </Suspense>
                }
              />

              <Route
                path="reset-password"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <ResetPassword />
                    </NavigationLoader>
                  </Suspense>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </BrowserRouter>
        {/* <ThemePanel /> */}
      </Theme>
    </>
  );
}

export default App;
