import { useEffect, useState } from "react";
import { Loader2, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminGetSiteSettingsRequest,
  adminUpdateSiteSettingsRequest,
  uploadImageRequest,
} from "@/lib/adminApi";
import {
  DEFAULT_SITE_SETTINGS,
  FONT_OPTIONS,
  applySiteTheme,
  type SiteSettings,
} from "@/lib/siteSettings";
import { ICON_OPTIONS, resolveIcon } from "@/lib/iconMap";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { getAuthErrorMessage } from "@/contexts/AuthContext";
import { toast } from "sonner";
import BrandLogo from "@/components/BrandLogo";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function IconSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const Icon = resolveIcon(value);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {ICON_OPTIONS.map((name) => {
            const OptIcon = resolveIcon(name);
            return (
              <SelectItem key={name} value={name}>
                <span className="inline-flex items-center gap-2">
                  <OptIcon className="h-4 w-4" />
                  {name}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <div className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs">
        <Icon className="h-4 w-4 text-primary" />
        Preview
      </div>
    </div>
  );
}

export default function AdminSite() {
  const { settings, setSettings } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locale, setLocale] = useState<"en" | "ar">("en");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminGetSiteSettingsRequest();
        if (!cancelled) setDraft({ ...DEFAULT_SITE_SETTINGS, ...data });
      } catch (err) {
        toast.error(getAuthErrorMessage(err, "Failed to load site settings"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live preview theme while editing; restore published theme on leave
  useEffect(() => {
    if (!loading) applySiteTheme(draft.theme, draft.fonts);
  }, [draft.theme, draft.fonts, loading]);

  useEffect(() => {
    return () => {
      applySiteTheme(settings.theme, settings.fonts);
    };
  }, [settings.theme, settings.fonts]);

  const save = async () => {
    setSaving(true);
    try {
      const saved = await adminUpdateSiteSettingsRequest(draft);
      setDraft(saved);
      setSettings(saved);
      toast.success("Site settings saved");
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const onUploadLogo = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadImageRequest(file);
      setDraft((d) => ({
        ...d,
        brand: { ...d.brand, logoUrl: uploaded.url },
      }));
      toast.success("Logo uploaded — click Save to publish");
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const homeCopy = draft.home[locale];
  const aboutCopy = draft.about[locale];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Site & branding</h2>
          <p className="text-sm text-muted-foreground">
            Logo, colors, fonts, icons, and landing page copy (home & about)
          </p>
        </div>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>

      <Tabs defaultValue="brand" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="brand">Brand & logo</TabsTrigger>
          <TabsTrigger value="theme">Colors</TabsTrigger>
          <TabsTrigger value="fonts">Fonts</TabsTrigger>
          <TabsTrigger value="icons">Icons</TabsTrigger>
          <TabsTrigger value="home">Home content</TabsTrigger>
          <TabsTrigger value="about">About content</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-soft space-y-4">
          <div className="flex items-center gap-4">
            {draft.brand.logoUrl ? (
              <img
                src={draft.brand.logoUrl}
                alt={draft.brand.name}
                className="h-16 w-16 rounded-lg object-contain border border-border"
              />
            ) : (
              <BrandLogo className="h-16 w-16" />
            )}
            <div className="text-sm text-muted-foreground">
              Logo preview — save to publish site-wide
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Brand name</Label>
              <Input
                value={draft.brand.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, brand: { ...d.brand, name: e.target.value } }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Page title (SEO)</Label>
              <Input
                value={draft.brand.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, brand: { ...d.brand, title: e.target.value } }))
                }
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Meta description</Label>
              <Textarea
                rows={2}
                value={draft.brand.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, brand: { ...d.brand, description: e.target.value } }))
                }
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Logo URL</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={draft.brand.logoUrl || ""}
                  placeholder="https://… or upload below"
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      brand: { ...d.brand, logoUrl: e.target.value || null },
                    }))
                  }
                />
                <Button variant="outline" asChild disabled={uploading}>
                  <label className="cursor-pointer">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => void onUploadLogo(e.target.files?.[0])}
                    />
                  </label>
                </Button>
                {draft.brand.logoUrl && (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setDraft((d) => ({ ...d, brand: { ...d.brand, logoUrl: null } }))
                    }
                  >
                    <X className="h-4 w-4" />
                    Use default SVG
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="theme" className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["primary", "Primary"],
                ["accent", "Accent / golden"],
                ["background", "Background"],
                ["foreground", "Text"],
                ["secondary", "Secondary"],
                ["mutedForeground", "Muted text"],
                ["card", "Card"],
                ["border", "Border"],
              ] as const
            ).map(([key, label]) => (
              <ColorField
                key={key}
                label={label}
                value={draft.theme[key]}
                onChange={(v) => setDraft((d) => ({ ...d, theme: { ...d.theme, [key]: v } }))}
              />
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-gradient-hero p-6 text-primary-foreground">
            <p className="font-display text-2xl font-bold">Theme preview</p>
            <p className="mt-1 text-sm opacity-90">Primary → accent gradient</p>
          </div>
        </TabsContent>

        <TabsContent value="fonts" className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-soft space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Display / headings</Label>
              <Select
                value={draft.fonts.display}
                onValueChange={(display) =>
                  setDraft((d) => ({ ...d, fonts: { ...d.fonts, display } }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Body</Label>
              <Select
                value={draft.fonts.body}
                onValueChange={(body) => setDraft((d) => ({ ...d, fonts: { ...d.fonts, body } }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-xl border border-border p-5">
            <p className="font-display text-3xl font-bold">Heading sample</p>
            <p className="mt-2 text-muted-foreground">
              Body text sample — digital menus for restaurants and cafés.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="icons" className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-soft space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <IconSelect
              label="Hero badge"
              value={draft.icons.heroBadge}
              onChange={(heroBadge) =>
                setDraft((d) => ({ ...d, icons: { ...d.icons, heroBadge } }))
              }
            />
            <IconSelect
              label="Hero stat 1"
              value={draft.icons.heroStat1}
              onChange={(heroStat1) =>
                setDraft((d) => ({ ...d, icons: { ...d.icons, heroStat1 } }))
              }
            />
            <IconSelect
              label="Hero stat 2"
              value={draft.icons.heroStat2}
              onChange={(heroStat2) =>
                setDraft((d) => ({ ...d, icons: { ...d.icons, heroStat2 } }))
              }
            />
            <IconSelect
              label="Hero stat 3"
              value={draft.icons.heroStat3}
              onChange={(heroStat3) =>
                setDraft((d) => ({ ...d, icons: { ...d.icons, heroStat3 } }))
              }
            />
            <IconSelect
              label="Hero secondary CTA"
              value={draft.icons.heroCtaSecondary}
              onChange={(heroCtaSecondary) =>
                setDraft((d) => ({ ...d, icons: { ...d.icons, heroCtaSecondary } }))
              }
            />
          </div>
          <div>
            <h3 className="mb-3 font-medium">Feature icons (6)</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {draft.icons.features.map((name, i) => (
                <IconSelect
                  key={i}
                  label={`Feature ${i + 1}`}
                  value={name}
                  onChange={(v) =>
                    setDraft((d) => {
                      const features = [...d.icons.features];
                      features[i] = v;
                      return { ...d, icons: { ...d.icons, features } };
                    })
                  }
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-medium">Category icons</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(draft.icons.categories).map(([key, name]) => (
                <IconSelect
                  key={key}
                  label={key}
                  value={name}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      icons: {
                        ...d.icons,
                        categories: { ...d.icons.categories, [key]: v },
                      },
                    }))
                  }
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-medium">About audience icons (4)</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {draft.icons.aboutAudiences.map((name, i) => (
                <IconSelect
                  key={i}
                  label={`Audience ${i + 1}`}
                  value={name}
                  onChange={(v) =>
                    setDraft((d) => {
                      const aboutAudiences = [...d.icons.aboutAudiences];
                      aboutAudiences[i] = v;
                      return { ...d, icons: { ...d.icons, aboutAudiences } };
                    })
                  }
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="home" className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-soft space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={locale === "en" ? "default" : "outline"}
              onClick={() => setLocale("en")}
            >
              English
            </Button>
            <Button
              size="sm"
              variant={locale === "ar" ? "default" : "outline"}
              onClick={() => setLocale("ar")}
            >
              العربية
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {draft.home.statsValues.map((v, i) => (
              <div key={i} className="space-y-1.5">
                <Label>Stat {i + 1} value</Label>
                <Input
                  value={v}
                  onChange={(e) =>
                    setDraft((d) => {
                      const statsValues = [...d.home.statsValues];
                      statsValues[i] = e.target.value;
                      return { ...d, home: { ...d.home, statsValues } };
                    })
                  }
                />
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ["badge", "Badge"],
                ["title", "Title"],
                ["titleHighlight", "Title highlight"],
                ["ctaStart", "Primary CTA"],
                ["ctaView", "Secondary CTA"],
                ["previewLabel", "Preview label"],
                ["categoriesTitle", "Categories title"],
                ["categoriesSubtitle", "Categories subtitle"],
                ["featuresTitle", "Features title"],
                ["featuresSubtitle", "Features subtitle"],
                ["footerDescription", "Footer description"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
                  value={homeCopy[key]}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      home: {
                        ...d.home,
                        [locale]: { ...d.home[locale], [key]: e.target.value },
                      },
                    }))
                  }
                />
              </div>
            ))}
            <div className="space-y-1.5 md:col-span-2">
              <Label>Subtitle</Label>
              <Textarea
                rows={3}
                value={homeCopy.subtitle}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    home: {
                      ...d.home,
                      [locale]: { ...d.home[locale], subtitle: e.target.value },
                    },
                  }))
                }
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-medium">Stat labels</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {homeCopy.statsLabels.map((label, i) => (
                <Input
                  key={i}
                  value={label}
                  onChange={(e) =>
                    setDraft((d) => {
                      const statsLabels = [...d.home[locale].statsLabels];
                      statsLabels[i] = e.target.value;
                      return {
                        ...d,
                        home: {
                          ...d.home,
                          [locale]: { ...d.home[locale], statsLabels },
                        },
                      };
                    })
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-medium">Feature cards</h3>
            <div className="space-y-3">
              {homeCopy.features.map((f, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-2">
                  <Input
                    value={f.title}
                    placeholder="Title"
                    onChange={(e) =>
                      setDraft((d) => {
                        const features = [...d.home[locale].features];
                        features[i] = { ...features[i], title: e.target.value };
                        return {
                          ...d,
                          home: {
                            ...d.home,
                            [locale]: { ...d.home[locale], features },
                          },
                        };
                      })
                    }
                  />
                  <Input
                    value={f.desc}
                    placeholder="Description"
                    onChange={(e) =>
                      setDraft((d) => {
                        const features = [...d.home[locale].features];
                        features[i] = { ...features[i], desc: e.target.value };
                        return {
                          ...d,
                          home: {
                            ...d.home,
                            [locale]: { ...d.home[locale], features },
                          },
                        };
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-medium">Hero preview card</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Preview restaurant name</Label>
                <Input
                  value={draft.home.previewName}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      home: { ...d.home, previewName: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {draft.home.previewItems.map((item, i) => (
                <div key={i} className="grid gap-2 md:grid-cols-3">
                  <Input
                    value={item.name}
                    placeholder="Item name"
                    onChange={(e) =>
                      setDraft((d) => {
                        const previewItems = [...d.home.previewItems];
                        previewItems[i] = { ...previewItems[i], name: e.target.value };
                        return { ...d, home: { ...d.home, previewItems } };
                      })
                    }
                  />
                  <Input
                    value={item.price}
                    placeholder="Price"
                    onChange={(e) =>
                      setDraft((d) => {
                        const previewItems = [...d.home.previewItems];
                        previewItems[i] = { ...previewItems[i], price: e.target.value };
                        return { ...d, home: { ...d.home, previewItems } };
                      })
                    }
                  />
                  <IconSelect
                    label=""
                    value={item.icon}
                    onChange={(icon) =>
                      setDraft((d) => {
                        const previewItems = [...d.home.previewItems];
                        previewItems[i] = { ...previewItems[i], icon };
                        return { ...d, home: { ...d.home, previewItems } };
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="about" className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-soft space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={locale === "en" ? "default" : "outline"}
              onClick={() => setLocale("en")}
            >
              English
            </Button>
            <Button
              size="sm"
              variant={locale === "ar" ? "default" : "outline"}
              onClick={() => setLocale("ar")}
            >
              العربية
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use {"{brand}"} in the body text to insert the brand name automatically.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ["eyebrow", "Eyebrow"],
                ["title", "Title"],
                ["audiencesTitle", "Audiences title"],
                ["ctaTitle", "CTA title"],
                ["ctaPrimary", "CTA primary button"],
                ["ctaSecondary", "CTA secondary button"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
                  value={aboutCopy[key]}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      about: {
                        ...d.about,
                        [locale]: { ...d.about[locale], [key]: e.target.value },
                      },
                    }))
                  }
                />
              </div>
            ))}
            <div className="space-y-1.5 md:col-span-2">
              <Label>Body</Label>
              <Textarea
                rows={3}
                value={aboutCopy.body}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    about: {
                      ...d.about,
                      [locale]: { ...d.about[locale], body: e.target.value },
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>CTA body</Label>
              <Textarea
                rows={2}
                value={aboutCopy.ctaBody}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    about: {
                      ...d.about,
                      [locale]: { ...d.about[locale], ctaBody: e.target.value },
                    },
                  }))
                }
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-medium">Steps (3)</h3>
            <div className="space-y-3">
              {aboutCopy.steps.map((step, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-2">
                  <Input
                    value={step.title}
                    placeholder="Step title"
                    onChange={(e) =>
                      setDraft((d) => {
                        const steps = [...d.about[locale].steps];
                        steps[i] = { ...steps[i], title: e.target.value };
                        return {
                          ...d,
                          about: {
                            ...d.about,
                            [locale]: { ...d.about[locale], steps },
                          },
                        };
                      })
                    }
                  />
                  <Input
                    value={step.body}
                    placeholder="Step body"
                    onChange={(e) =>
                      setDraft((d) => {
                        const steps = [...d.about[locale].steps];
                        steps[i] = { ...steps[i], body: e.target.value };
                        return {
                          ...d,
                          about: {
                            ...d.about,
                            [locale]: { ...d.about[locale], steps },
                          },
                        };
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-medium">Audiences (4)</h3>
            <div className="space-y-3">
              {aboutCopy.audiences.map((item, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-2">
                  <Input
                    value={item.title}
                    placeholder="Title"
                    onChange={(e) =>
                      setDraft((d) => {
                        const audiences = [...d.about[locale].audiences];
                        audiences[i] = { ...audiences[i], title: e.target.value };
                        return {
                          ...d,
                          about: {
                            ...d.about,
                            [locale]: { ...d.about[locale], audiences },
                          },
                        };
                      })
                    }
                  />
                  <Input
                    value={item.body}
                    placeholder="Body"
                    onChange={(e) =>
                      setDraft((d) => {
                        const audiences = [...d.about[locale].audiences];
                        audiences[i] = { ...audiences[i], body: e.target.value };
                        return {
                          ...d,
                          about: {
                            ...d.about,
                            [locale]: { ...d.about[locale], audiences },
                          },
                        };
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
