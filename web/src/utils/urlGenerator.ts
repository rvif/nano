/**
 * Generates absolute URLs for your application based on environment
 * @param path The relative path (e.g., a short URL slug)
 * @returns A complete URL that can be used for redirects or sharing
 */
export const generateAbsoluteUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  if (import.meta.env.PROD) {
    const frontendUrl = window.location.origin;
    return `${frontendUrl}/${cleanPath}`;
  } else {
    return `http://localhost:5173/${cleanPath}`;
  }
};
