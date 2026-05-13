// Centralized SEO helpers. Update SITE_URL when the production domain changes.
export const SITE_URL = "https://mazaj.lovable.app";

export const absUrl = (path: string = "/") => {
  if (!path) return SITE_URL + "/";
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : `/${path}`);
};
