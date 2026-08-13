import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * Injects browser-enforceable security headers as <meta http-equiv>.
 *
 * Notes:
 * - HSTS, X-Frame-Options and true HTTP-only headers MUST be set at the
 *   CDN/edge layer (Cloudflare/Netlify/Vercel/_headers). They are documented
 *   in the Security admin page and cannot be enforced via <meta>.
 * - The CSP below is intentionally tight but allows Supabase, Lovable preview,
 *   Unsplash images, Google Fonts, GA/GTM and Leaflet/OSM tiles which the app
 *   already depends on.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://www.google-analytics.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://nominatim.openstreetmap.org https://www.google-analytics.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

export const SecurityHeaders: React.FC = () => (
  <Helmet>
    <meta httpEquiv="Content-Security-Policy" content={CSP} />
    <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(self), geolocation=(self), payment=()" />
  </Helmet>
);

export const RECOMMENDED_EDGE_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=(self), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "Content-Security-Policy": CSP,
};

export { CSP };
