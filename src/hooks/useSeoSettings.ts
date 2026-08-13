import { useMemo } from "react";
import { useRestaurantSettings, useSaveSettings } from "@/hooks/useSettingsData";

export type SeoLanguage = {
  code: string;        // e.g. "ar", "en"
  locale: string;      // e.g. "ar_SA", "en_US"
  label: string;       // display name
  enabled: boolean;
  isDefault?: boolean; // becomes x-default
};

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
  languages: SeoLanguage[];
};

export const DEFAULT_LANGUAGES: SeoLanguage[] = [
  { code: "ar", locale: "ar_SA", label: "العربية", enabled: true, isDefault: true },
];

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
  languages: DEFAULT_LANGUAGES,
};

const SEO_KEY_PREFIX = "seo_";

const unwrap = (raw: any) =>
  typeof raw === "object" && raw && "value" in raw ? raw.value : raw;

export const useSeoSettings = () => {
  const { data: settings, isLoading } = useRestaurantSettings();

  const seo = useMemo<SeoSettings>(() => {
    if (!settings) return SEO_DEFAULTS;
    const get = (k: keyof SeoSettings) => {
      const raw = settings[`${SEO_KEY_PREFIX}${k}`];
      if (raw === undefined || raw === null) return SEO_DEFAULTS[k];
      return unwrap(raw);
    };
    let languages = get("languages") as any;
    if (!Array.isArray(languages) || languages.length === 0) {
      languages = DEFAULT_LANGUAGES;
    }
    return {
      site_url: (get("site_url") as string) || SEO_DEFAULTS.site_url,
      default_title: get("default_title") as string,
      default_description: get("default_description") as string,
      default_keywords: get("default_keywords") as string,
      og_image: get("og_image") as string,
      twitter_handle: get("twitter_handle") as string,
      robots_index: Boolean(get("robots_index")),
      ga_measurement_id: get("ga_measurement_id") as string,
      gsc_verification: get("gsc_verification") as string,
      organization_json: get("organization_json") as string,
      languages: languages as SeoLanguage[],
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
