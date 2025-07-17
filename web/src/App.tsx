// React imports
import React, { Suspense, useEffect, useRef, useState } from "react";

// Themes and styles
import "@radix-ui/themes/styles.css";
import "./App.css";
import { Theme, Spinner } from "@radix-ui/themes";

// Router
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

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
import PublicOnlyRoute from "./pages/utility/PublicOnlyRoute";

const APP_VERSION = "0.6.0"; // increment this on every deploy

const checkCacheVersion = () => {
  try {
    const cachedVersion = localStorage.getItem("app_version");
    if (cachedVersion !== APP_VERSION) {
      console.log("App version changed, clearing caches");
      localStorage.removeItem("cached_user");
      localStorage.removeItem("cached_user_urls");

      localStorage.setItem("app_version", APP_VERSION);
    }
  } catch (error) {
    console.error("Error checking cache version:", error);
  }
};

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

const RedirectingPage = React.lazy(
  () => import("./pages/utility/RedirectingPage")
);

// Navigation loader component -> to create loading states during client transitions
const NavigationLoader = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const navigationCompleteRef = useRef(false);

  useEffect(() => {
    // Start loading when location changes
    setIsLoading(true);
    navigationCompleteRef.current = false;

    // This will run after the rendering is complete
    const checkIfContentReady = () => {
      // Use requestAnimationFrame to check after browser has painted
      requestAnimationFrame(() => {
        if (!navigationCompleteRef.current) {
          navigationCompleteRef.current = true;
          setIsLoading(false);
        }
      });
    };

    // small delay to allow React to render the new route
    const timer = setTimeout(checkIfContentReady, 10);

    return () => {
      clearTimeout(timer);
      navigationCompleteRef.current = true;
    };
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
    // Check cache version on app load
    checkCacheVersion();

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
                path="health"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <HealthCheckPage />
                    </NavigationLoader>
                  </Suspense>
                }
              />

              {/* Slug route must come after specific routes but before the catch-all */}
              <Route
                path=":slug"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <RedirectingPage />
                    </NavigationLoader>
                  </Suspense>
                }
              />

              {/* Main layout catch-all */}
              <Route
                path="*"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NotFoundPage />
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
                    <NotFoundPage />
                  </Suspense>
                }
              />
              <Route
                path="login"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    </NavigationLoader>
                  </Suspense>
                }
              />
              <Route
                path="signup"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <PublicOnlyRoute>
                        <SignupPage />
                      </PublicOnlyRoute>
                    </NavigationLoader>
                  </Suspense>
                }
              />
              <Route
                path="forgot-password"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <PublicOnlyRoute>
                        <ForgotPassword />
                      </PublicOnlyRoute>
                    </NavigationLoader>
                  </Suspense>
                }
              />

              <Route
                path="reset-password"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NavigationLoader>
                      <PublicOnlyRoute>
                        <ResetPassword />
                      </PublicOnlyRoute>
                    </NavigationLoader>
                  </Suspense>
                }
              />

              {/* Auth layout catch-all */}
              <Route
                path="*"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NotFoundPage />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
        {/* <ThemePanel /> */}
      </Theme>
    </>
  );
}

export default App;
