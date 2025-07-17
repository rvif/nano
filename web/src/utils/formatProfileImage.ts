/**
 * Formats a profile picture URL to ensure it's a complete URL
 * @param pfpUrl The profile picture URL from the API
 * @returns A complete URL that can be used in an <img> src attribute
 */
export const formatProfileImageUrl = (pfpUrl: string | undefined): string => {
  if (!pfpUrl) return "/images/default_pfp.jpg";

  if (pfpUrl.startsWith("http")) return pfpUrl;

  const apiBaseUrl =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://url-shortener-backend-1218228353.asia-south1.run.app"
      : "http://localhost:8080");

  // ensure the path starts with a slash
  const normalizedPath = pfpUrl.startsWith("/") ? pfpUrl : "/" + pfpUrl;

  return `${apiBaseUrl}${normalizedPath}`;
};
