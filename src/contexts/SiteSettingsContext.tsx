import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import {
  applySiteTheme,
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "@/lib/siteSettings";

type SiteSettingsContextType = {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  setSettings: (next: SiteSettings) => void;
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

function mergeSettings(partial: Partial<SiteSettings> | null | undefined): SiteSettings {
  if (!partial) return DEFAULT_SITE_SETTINGS;
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...partial,
    brand: { ...DEFAULT_SITE_SETTINGS.brand, ...partial.brand },
    theme: { ...DEFAULT_SITE_SETTINGS.theme, ...partial.theme },
    fonts: { ...DEFAULT_SITE_SETTINGS.fonts, ...partial.fonts },
    icons: {
      ...DEFAULT_SITE_SETTINGS.icons,
      ...partial.icons,
      features: partial.icons?.features ?? DEFAULT_SITE_SETTINGS.icons.features,
      categories: {
        ...DEFAULT_SITE_SETTINGS.icons.categories,
        ...partial.icons?.categories,
      },
      aboutAudiences:
        partial.icons?.aboutAudiences ?? DEFAULT_SITE_SETTINGS.icons.aboutAudiences,
    },
    home: {
      ...DEFAULT_SITE_SETTINGS.home,
      ...partial.home,
      categoryCounts: {
        ...DEFAULT_SITE_SETTINGS.home.categoryCounts,
        ...partial.home?.categoryCounts,
      },
      statsValues: partial.home?.statsValues ?? DEFAULT_SITE_SETTINGS.home.statsValues,
      previewItems: partial.home?.previewItems ?? DEFAULT_SITE_SETTINGS.home.previewItems,
      en: { ...DEFAULT_SITE_SETTINGS.home.en, ...partial.home?.en },
      ar: { ...DEFAULT_SITE_SETTINGS.home.ar, ...partial.home?.ar },
    },
    about: {
      en: {
        ...DEFAULT_SITE_SETTINGS.about.en,
        ...partial.about?.en,
        steps: partial.about?.en?.steps ?? DEFAULT_SITE_SETTINGS.about.en.steps,
        audiences: partial.about?.en?.audiences ?? DEFAULT_SITE_SETTINGS.about.en.audiences,
      },
      ar: {
        ...DEFAULT_SITE_SETTINGS.about.ar,
        ...partial.about?.ar,
        steps: partial.about?.ar?.steps ?? DEFAULT_SITE_SETTINGS.about.ar.steps,
        audiences: partial.about?.ar?.audiences ?? DEFAULT_SITE_SETTINGS.about.ar.audiences,
      },
    },
  };
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  const apply = useCallback((next: SiteSettings) => {
    setSettingsState(next);
    applySiteTheme(next.theme, next.fonts);
    if (typeof document !== "undefined") {
      document.title = next.brand.title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", next.brand.description);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<SiteSettings>("/public/site-settings");
      apply(mergeSettings(data));
    } catch {
      apply(DEFAULT_SITE_SETTINGS);
    }
  }, [apply]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const setSettings = useCallback(
    (next: SiteSettings) => {
      apply(mergeSettings(next));
    },
    [apply]
  );

  const value = useMemo(
    () => ({ settings, loading, refresh, setSettings }),
    [settings, loading, refresh, setSettings]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
}
