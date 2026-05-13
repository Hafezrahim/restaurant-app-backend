import React from "react";
import { Helmet } from "react-helmet-async";
import { absUrl } from "@/lib/seo";

interface SeoLinksProps {
  /** Route path, e.g. "/menu" or "/dish/123". */
  path: string;
}

/**
 * Emits canonical, og:url and hreflang tags as absolute HTTPS URLs.
 * The site is Arabic-only today, so we publish ar + x-default pointing
 * at the same URL. When an English mirror ships, add an `en` entry.
 */
export const SeoLinks: React.FC<SeoLinksProps> = ({ path }) => {
  const url = absUrl(path);
  return (
    <Helmet>
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ar" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="ar_SA" />
    </Helmet>
  );
};
