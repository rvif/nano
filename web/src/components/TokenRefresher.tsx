import { useEffect, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import {
  checkTokenExpiration,
  refreshAccessToken,
} from "../utils/tokenRefresh";

// ts component doesn't render anything, it just manages token refresh and syncs it with the store
const TokenRefresher = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const refreshIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // only set up refresh checking if user is authenticated
    if (isAuthenticated) {
      // check for token on mount
      const checkAndRefresh = async () => {
        if (checkTokenExpiration()) {
          await refreshAccessToken();
        }
      };

      checkAndRefresh();

      // set up periodic checks every 15 minutes
      const intervalId = window.setInterval(() => {
        checkAndRefresh();
      }, 15 * 60 * 1000); // 15 minutes

      refreshIntervalRef.current = intervalId;

      return () => {
        if (refreshIntervalRef.current !== null) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }
  }, [isAuthenticated]);

  return null;
};

export default TokenRefresher;
