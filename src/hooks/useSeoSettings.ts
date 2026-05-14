import { useMemo } from "react";
import { useRestaurantSettings, useSaveSettings } from "@/hooks/useSettingsData";

export type SeoSettings = {
  site_url: string;
  default_title: string;
  default_description: string;
  default_keywords: string;
  og_image: string;
  twitter_handle: string;
  robots_index: boolean;
  ga_measurement_id: string;
  gsc_verification: string;
  organization_json: string;
};

export const SEO_DEFAULTS: SeoSettings = {
  site_url: "https://mazaj.lovable.app",
  default_title: "مطعم مزاج - أشهى الأطباق العربية والعالمية",
  default_description:
    "اكتشف قائمة مطعم مزاج، اطلب أطباقك المفضلة بسهولة، واستمتع بتجربة طعام لا تُنسى.",
  default_keywords: "مطعم, طعام, توصيل, مزاج, أطباق عربية",
  og_image: "",
  twitter_handle: "",
  robots_index: true,
  ga_measurement_id: "",
  gsc_verification: "",
  organization_json: "",
};

const SEO_KEY_PREFIX = "seo_";

export const useSeoSettings = () => {
  const { data: settings, isLoading } = useRestaurantSettings();

  const seo = useMemo<SeoSettings>(() => {
    if (!settings) return SEO_DEFAULTS;
    const get = (k: keyof SeoSettings) => {
      const raw = settings[`${SEO_KEY_PREFIX}${k}`];
      if (raw === undefined || raw === null) return SEO_DEFAULTS[k];
      // values may be JSONB primitives
      return typeof raw === "object" && raw && "value" in (raw as any)
        ? (raw as any).value
        : raw;
    };
    return {
      site_url: get("site_url") as string,
      default_title: get("default_title") as string,
      default_description: get("default_description") as string,
      default_keywords: get("default_keywords") as string,
      og_image: get("og_image") as string,
      twitter_handle: get("twitter_handle") as string,
      robots_index: Boolean(get("robots_index")),
      ga_measurement_id: get("ga_measurement_id") as string,
      gsc_verification: get("gsc_verification") as string,
      organization_json: get("organization_json") as string,
    };
  }, [settings]);

  return { seo, isLoading };
};

export const useSaveSeoSettings = () => {
  const save = useSaveSettings();
  return {
    ...save,
    mutateAsync: (next: Partial<SeoSettings>) => {
      const payload: Record<string, any> = {};
      Object.entries(next).forEach(([k, v]) => {
        payload[`${SEO_KEY_PREFIX}${k}`] = v;
      });
      return save.mutateAsync(payload);
    },
  };
};
