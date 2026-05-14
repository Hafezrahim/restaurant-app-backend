import React from "react";
import { Helmet } from "react-helmet-async";
import { useSeoSettings } from "@/hooks/useSeoSettings";

/**
 * Injects sitewide SEO defaults managed from the Admin SEO page.
 * Per-route Helmet calls still override title/description/og:* as needed.
 */
export const SeoFromSettings: React.FC = () => {
  const { seo } = useSeoSettings();

  let orgJson: string | null = null;
  if (seo.organization_json?.trim()) {
    try {
      // validate
      JSON.parse(seo.organization_json);
      orgJson = seo.organization_json;
    } catch {
      orgJson = null;
    }
  }

  return (
    <Helmet>
      {seo.default_title && <title>{seo.default_title}</title>}
      {seo.default_description && (
        <meta name="description" content={seo.default_description} />
      )}
      {seo.default_keywords && (
        <meta name="keywords" content={seo.default_keywords} />
      )}
      <meta
        name="robots"
        content={seo.robots_index ? "index, follow" : "noindex, nofollow"}
      />
      {seo.og_image && <meta property="og:image" content={seo.og_image} />}
      {seo.twitter_handle && (
        <meta name="twitter:site" content={seo.twitter_handle} />
      )}
      {seo.gsc_verification && (
        <meta
          name="google-site-verification"
          content={seo.gsc_verification}
        />
      )}
      {seo.ga_measurement_id && (
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${seo.ga_measurement_id}`}
        />
      )}
      {seo.ga_measurement_id && (
        <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${seo.ga_measurement_id}');`}</script>
      )}
      {orgJson && (
        <script type="application/ld+json">{orgJson}</script>
      )}
    </Helmet>
  );
};
