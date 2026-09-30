export type SiteTheme = {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  secondary: string;
  mutedForeground: string;
  card: string;
  border: string;
};

export type SiteFonts = {
  display: string;
  body: string;
};

export type SiteIcons = {
  heroBadge: string;
  heroStat1: string;
  heroStat2: string;
  heroStat3: string;
  heroCtaSecondary: string;
  features: string[];
  categories: Record<string, string>;
  aboutAudiences: string[];
};

export type HomeLocaleCopy = {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaStart: string;
  ctaView: string;
  statsLabels: string[];
  previewLabel: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
  categoriesTemplatesLabel: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: Array<{ title: string; desc: string }>;
  footerDescription: string;
};

export type AboutLocaleCopy = {
  eyebrow: string;
  title: string;
  body: string;
  audiencesTitle: string;
  steps: Array<{ title: string; body: string }>;
  audiences: Array<{ title: string; body: string }>;
  ctaTitle: string;
  ctaBody: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export type SiteSettings = {
  brand: {
    name: string;
    title: string;
    description: string;
    logoUrl: string | null;
  };
  theme: SiteTheme;
  fonts: SiteFonts;
  icons: SiteIcons;
  home: {
    statsValues: string[];
    categoryCounts: Record<string, number>;
    previewName: string;
    previewItems: Array<{ icon: string; name: string; price: string }>;
    en: HomeLocaleCopy;
    ar: HomeLocaleCopy;
  };
  about: {
    en: AboutLocaleCopy;
    ar: AboutLocaleCopy;
  };
  updatedAt?: string | null;
};

export const FONT_OPTIONS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Libre Baskerville",
  "Cairo",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
] as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand: {
    name: "Carta",
    title: "Carta — Digital menus for any table",
    description:
      "Design a digital menu for a restaurant, café, bakery, or shop. Arabic and English, ready to share.",
    logoUrl: null,
  },
  theme: {
    primary: "#CC6E33",
    accent: "#E8A826",
    background: "#F8F6F2",
    foreground: "#2F261E",
    secondary: "#F0EBE3",
    mutedForeground: "#7A6B5C",
    card: "#FDFCFA",
    border: "#E8E0D6",
  },
  fonts: {
    display: "Playfair Display",
    body: "Inter",
  },
  icons: {
    heroBadge: "Sparkles",
    heroStat1: "LayoutTemplate",
    heroStat2: "Sparkles",
    heroStat3: "UtensilsCrossed",
    heroCtaSecondary: "LayoutTemplate",
    features: ["Palette", "Layers", "QrCode", "Globe", "Smartphone", "Zap"],
    categories: {
      restaurant: "UtensilsCrossed",
      cafe: "Coffee",
      supermarket: "ShoppingCart",
      bakery: "Cake",
      bar: "Wine",
      fastfood: "Pizza",
    },
    aboutAudiences: ["UtensilsCrossed", "Store", "Languages", "QrCode"],
  },
  home: {
    statsValues: ["50+", "5K+", "20K+"],
    categoryCounts: {
      restaurant: 15,
      cafe: 12,
      supermarket: 8,
      bakery: 10,
      bar: 8,
      fastfood: 10,
    },
    previewName: "Al-Ahram",
    previewItems: [
      { icon: "UtensilsCrossed", name: "Mixed Grill", price: "120 EGP" },
      { icon: "Coffee", name: "Turkish Coffee", price: "25 EGP" },
      { icon: "Cake", name: "Basbousa", price: "35 EGP" },
    ],
    en: {
      badge: "Digital menus for restaurants, cafés, and shops anywhere",
      title: "Create Beautiful Digital Menus in Minutes",
      titleHighlight: "Digital Menus",
      subtitle:
        "Design stunning menus for your restaurant, café, or supermarket with our easy-to-use templates. No design skills needed – just pick, customize, and publish!",
      ctaStart: "Start Creating Free",
      ctaView: "View Templates",
      statsLabels: ["Templates", "Users", "Menus Created"],
      previewLabel: "Menu Preview Area",
      categoriesTitle: "Choose Your Category",
      categoriesSubtitle:
        "Select from our specialized menu templates designed for different business types",
      categoriesTemplatesLabel: "templates",
      featuresTitle: "Everything You Need",
      featuresSubtitle: "Everything you need to publish a menu guests can open on any phone",
      features: [
        {
          title: "Beautiful Templates",
          desc: "Choose from 50+ professionally designed templates for every business type",
        },
        {
          title: "Item Variants",
          desc: "Add sizes, types, and options to your items - perfect for drinks, pizzas, and more",
        },
        {
          title: "QR Code Ready",
          desc: "Generate QR codes instantly so customers can scan and view your menu",
        },
        {
          title: "Arabic & English",
          desc: "Full RTL support for Arabic menus with seamless bilingual options",
        },
        {
          title: "Mobile Optimized",
          desc: "Menus look perfect on any device - phones, tablets, or desktop",
        },
        {
          title: "Real-time Updates",
          desc: "Update prices and items instantly - changes go live immediately",
        },
      ],
      footerDescription: "Create a digital menu for any restaurant, café, bakery, or shop.",
    },
    ar: {
      badge: "قوائم رقمية للمطاعم والمقاهي والمتاجر في أي مكان",
      title: "أنشئ قوائم رقمية جميلة في دقائق",
      titleHighlight: "القوائم الرقمية",
      subtitle:
        "صمم قوائم مذهلة لمطعمك أو مقهاك أو متجرك باستخدام قوالبنا سهلة الاستخدام. لا حاجة لمهارات التصميم – فقط اختر، خصص، وانشر!",
      ctaStart: "ابدأ مجاناً",
      ctaView: "عرض القوالب",
      statsLabels: ["قالب", "مستخدم", "قائمة تم إنشاؤها"],
      previewLabel: "منطقة معاينة القائمة",
      categoriesTitle: "اختر فئتك",
      categoriesSubtitle: "اختر من قوالب القوائم المتخصصة المصممة لأنواع مختلفة من الأعمال",
      categoriesTemplatesLabel: "قالب",
      featuresTitle: "كل ما تحتاجه",
      featuresSubtitle: "كل ما تحتاجه لنشر قائمة يفتحها الضيف على أي هاتف",
      features: [
        {
          title: "قوالب جميلة",
          desc: "اختر من أكثر من 50 قالباً مصمماً باحتراف لكل نوع عمل",
        },
        {
          title: "خيارات الأصناف",
          desc: "أضف أحجاماً وأنواعاً وخيارات — مثالي للمشروبات والبيتزا والمزيد",
        },
        {
          title: "جاهز لرمز QR",
          desc: "أنشئ رموز QR فوراً ليمسحها العملاء ويعرضوا قائمتك",
        },
        {
          title: "عربي وإنجليزي",
          desc: "دعم كامل لاتجاه اليمين لليسار مع خيارات ثنائية اللغة",
        },
        {
          title: "متوافق مع الموبايل",
          desc: "القوائم تبدو مثالية على الهاتف والتابلت وسطح المكتب",
        },
        {
          title: "تحديثات فورية",
          desc: "حدّث الأسعار والأصناف فوراً — التغييرات تظهر مباشرة",
        },
      ],
      footerDescription: "أنشئ قائمة رقمية لأي مطعم أو مقهى أو مخبز أو متجر.",
    },
  },
  about: {
    en: {
      eyebrow: "About",
      title: "Digital menus that look like the card on the table",
      body: "{brand} is for restaurants, cafés, bakeries, and shops anywhere. You pick a layout you already know, write the dishes in Arabic or English, and publish a link guests open on their phone.",
      audiencesTitle: "Who it is for",
      steps: [
        {
          title: "Pick a design",
          body: "Templates drawn from real menus: a dining card, a café board, a wine list, or a price sheet.",
        },
        {
          title: "Write the menu",
          body: "Edit names, descriptions, and prices from the preview. Add pages, a currency, and Arabic text that reads right to left.",
        },
        {
          title: "Publish the link",
          body: "Guests open the menu on a phone, switch language, and download a PDF.",
        },
      ],
      audiences: [
        {
          title: "Restaurants",
          body: "Appetizers, mains, and desserts laid out across more than one page.",
        },
        {
          title: "Cafés, bakeries, and markets",
          body: "A board for today, a pastry card, or shelf price tags.",
        },
        {
          title: "Arabic and English",
          body: "Each menu can be read in the direction that matches the guest’s language.",
        },
        {
          title: "One link",
          body: "The same address stays on the table. Saving updates what the guest sees.",
        },
      ],
      ctaTitle: "Start from a template",
      ctaBody: "Choose a business type, edit the words, and save. The link becomes the guest menu.",
      ctaPrimary: "View templates",
      ctaSecondary: "Pricing",
    },
    ar: {
      eyebrow: "من نحن",
      title: "قوائم رقمية تشبه الورق الذي يضعه المطعم على الطاولة",
      body: "{brand} للعالم كله: صاحب مطعم أو مقهى أو مخبز أو متجر. تختار شكلاً تعرفه، تكتب الأطباق بالعربية أو الإنجليزية، وتنشر رابطاً يفتحه الضيف من هاتفه.",
      audiencesTitle: "لمن صُممت",
      steps: [
        {
          title: "اختر تصميماً",
          body: "قوالب مأخوذة من قوائم حقيقية: بطاقة طعام، سبورة مقهى، قائمة نبيذ، أو ورقة أسعار.",
        },
        {
          title: "اكتب قائمتك",
          body: "عدّل الاسم والوصف والسعر من المعاينة. أضف صفحات، عملة، ونصاً عربياً من اليمين لليسار.",
        },
        {
          title: "انشر الرابط",
          body: "الضيف يفتح القائمة على الموبايل، يبدل اللغة، ويحمّل نسخة PDF.",
        },
      ],
      audiences: [
        {
          title: "مطاعم",
          body: "أقسام المقبلات والأطباق والحلويات على أكثر من صفحة.",
        },
        {
          title: "مقاهٍ ومخابز وأسواق",
          body: "سبورة اليوم، بطاقة الحلويات، وبطاقات أسعار الرف.",
        },
        {
          title: "عربي وإنجليزي",
          body: "كل قائمة يمكن أن تُقرأ بالاتجاه المناسب للغة الضيف.",
        },
        {
          title: "رابط واحد",
          body: "نفس العنوان يبقى على الطاولة. الحفظ يحدّث ما يراه الضيف.",
        },
      ],
      ctaTitle: "ابدأ من قالب",
      ctaBody: "اختر نوع النشاط، عدّل النصوص، واحفظ. الرابط يصبح قائمة الضيوف.",
      ctaPrimary: "عرض القوالب",
      ctaSecondary: "الأسعار",
    },
  },
};

/** Convert #RRGGBB to "H S% L%" for CSS variables. */
export function hexToHslComponents(hex: string): string | null {
  const cleaned = hex.trim().replace(/^#/, "");
  if (!/^([0-9a-fA-F]{6})$/.test(cleaned)) return null;
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function lightenHex(hex: string, amount: number): string {
  const cleaned = hex.trim().replace(/^#/, "");
  if (!/^([0-9a-fA-F]{6})$/.test(cleaned)) return hex;
  const channel = (i: number) => {
    const v = parseInt(cleaned.slice(i, i + 2), 16);
    return Math.min(255, Math.round(v + (255 - v) * amount))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}

function darkenHex(hex: string, amount: number): string {
  const cleaned = hex.trim().replace(/^#/, "");
  if (!/^([0-9a-fA-F]{6})$/.test(cleaned)) return hex;
  const channel = (i: number) => {
    const v = parseInt(cleaned.slice(i, i + 2), 16);
    return Math.max(0, Math.round(v * (1 - amount)))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}

export function applySiteTheme(theme: SiteTheme, fonts: SiteFonts) {
  const root = document.documentElement;
  const set = (name: string, hex: string) => {
    const hsl = hexToHslComponents(hex);
    if (hsl) root.style.setProperty(name, hsl);
  };

  set("--primary", theme.primary);
  set("--ring", theme.primary);
  set("--terracotta", theme.primary);
  set("--terracotta-light", lightenHex(theme.primary, 0.25));
  set("--terracotta-dark", darkenHex(theme.primary, 0.2));
  set("--sidebar-primary", theme.primary);

  set("--accent", theme.accent);
  set("--golden", theme.accent);
  set("--golden-light", lightenHex(theme.accent, 0.25));

  set("--background", theme.background);
  set("--cream", theme.background);
  set("--sidebar-background", theme.background);

  set("--foreground", theme.foreground);
  set("--card-foreground", theme.foreground);
  set("--popover-foreground", theme.foreground);
  set("--secondary-foreground", theme.foreground);
  set("--accent-foreground", theme.foreground);

  set("--secondary", theme.secondary);
  set("--muted", theme.secondary);
  set("--cream-dark", theme.secondary);
  set("--sidebar-accent", theme.secondary);

  set("--muted-foreground", theme.mutedForeground);
  set("--card", theme.card);
  set("--popover", theme.card);
  set("--border", theme.border);
  set("--input", theme.border);
  set("--sidebar-border", theme.border);

  root.style.setProperty(
    "--gradient-hero",
    `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
  );
  root.style.setProperty("--font-display", `"${fonts.display}", serif`);
  root.style.setProperty("--font-sans", `"${fonts.body}", sans-serif`);
  document.body.style.fontFamily = `"${fonts.body}", sans-serif`;
}
