import React from "react";
import { Helmet } from "react-helmet-async";
import { absUrl } from "@/lib/seo";
import { useSeoSettings } from "@/hooks/useSeoSettings";

interface SeoLinksProps {
  /** Route path, e.g. "/menu" or "/dish/123". */
  path: string;
}

/**
 * Emits canonical, og:url and hreflang tags as absolute HTTPS URLs.
 * Hreflang entries are driven by the Admin SEO languages settings,
 * so dynamic routes (e.g. /dish/:id) automatically get the right
 * alternates per language.
 */
export const SeoLinks: React.FC<SeoLinksProps> = ({ path }) => {
  const { seo } = useSeoSettings();
  const url = absUrl(path);

  const enabled = (seo.languages || []).filter((l) => l.enabled);
  const defaultLang =
    enabled.find((l) => l.isDefault) || enabled[0] || null;

  return (
    <Helmet>
      <link rel="canonical" href={url} />
      {enabled.map((l) => (
        <link key={l.code} rel="alternate" hrefLang={l.code} href={url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={url} />
      <meta property="og:url" content={url} />
      {defaultLang && (
        <meta property="og:locale" content={defaultLang.locale} />
      )}
      {enabled
        .filter((l) => l.code !== defaultLang?.code)
        .map((l) => (
          <meta
            key={`alt-${l.code}`}
            property="og:locale:alternate"
            content={l.locale}
          />
        ))}
    </Helmet>
  );
};
