/**
 * Formats a profile picture URL to ensure it's a complete URL
 * @param pfpUrl The profile picture URL from the API
 * @returns A complete URL that can be used in an <img> src attribute
 */
export const formatProfileImageUrl = (pfpUrl: string | undefined): string => {
  if (!pfpUrl) return "";

  if (pfpUrl.startsWith("http")) return pfpUrl;

  if (import.meta.env.DEV) {
    return `http://localhost:8080${
      pfpUrl.startsWith("/") ? pfpUrl : "/" + pfpUrl
    }`;
  }

  // for prod, assume the backend serves static files at the same domain
  return pfpUrl.startsWith("/") ? pfpUrl : "/" + pfpUrl;
};
