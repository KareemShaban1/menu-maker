import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, type Plan, type Prisma } from "@prisma/client";
import { DEFAULT_SITE_SETTINGS } from "../src/lib/siteSettingsDefaults";

const prisma = new PrismaClient();

const PLAN_SEEDS: Array<{
  key: Plan;
  nameEn: string;
  nameAr: string;
  priceMonthly: number;
  maxMenus: number | null;
  featuresEn: string[];
  featuresAr: string[];
  sortOrder: number;
}> = [
  {
    key: "free",
    nameEn: "Free",
    nameAr: "مجاني",
    priceMonthly: 0,
    maxMenus: 1,
    featuresEn: [
      "1 published menu",
      "Every template design",
      "Arabic and English with RTL",
      "Share link and PDF download",
    ],
    featuresAr: [
      "قائمة منشورة واحدة",
      "كل تصاميم القوالب",
      "عربي وإنجليزي مع اتجاه من اليمين",
      "رابط مشاركة وتحميل PDF",
    ],
    sortOrder: 1,
  },
  {
    key: "restaurant",
    nameEn: "Restaurant",
    nameAr: "المطعم",
    priceMonthly: 199,
    maxMenus: 5,
    featuresEn: [
      "Up to 5 menus",
      "Multiple currencies and pages",
      "Type controls for every text",
      "Your logo on the menu",
    ],
    featuresAr: [
      "حتى 5 قوائم",
      "عملات متعددة وصفحات متعددة",
      "تنسيق الخط لكل نص",
      "شعار المطعم على القائمة",
    ],
    sortOrder: 2,
  },
  {
    key: "business",
    nameEn: "Business",
    nameAr: "الأعمال",
    priceMonthly: 499,
    maxMenus: null,
    featuresEn: [
      "Unlimited menus",
      "Separate menus per branch",
      "Priority WhatsApp support",
      "Price changes go live for guests",
    ],
    featuresAr: [
      "قوائم بلا حد",
      "فروع وقوائم منفصلة",
      "دعم أولوية على واتساب",
      "تحديث الأسعار يظهر فوراً للضيوف",
    ],
    sortOrder: 3,
  },
];

type TemplateSeed = {
  category: string;
  localId: number;
  name: string;
  nameAr?: string;
  style: string;
  layoutKey: string;
  gradient: string;
  accentColor: string;
  iconKey: string;
  pattern?: string;
  sortOrder: number;
};

const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    category: "restaurant",
    localId: 1,
    name: "Elegant Dining",
    nameAr: "تناول راقي",
    style: "Classic & Refined",
    layoutKey: "fine-print",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    accentColor: "#d4af37",
    iconKey: "Sparkles",
    pattern: "radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)",
    sortOrder: 1,
  },
  {
    category: "restaurant",
    localId: 2,
    name: "Modern Bistro",
    style: "Contemporary",
    layoutKey: "bistro",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    accentColor: "#667eea",
    iconKey: "Palette",
    sortOrder: 2,
  },
  {
    category: "restaurant",
    localId: 3,
    name: "Oriental Feast",
    style: "Middle Eastern",
    layoutKey: "levantine",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #f093fb 100%)",
    accentColor: "#f5576c",
    iconKey: "Moon",
    pattern: "radial-gradient(circle at 50% 0%, rgba(245, 87, 108, 0.15) 0%, transparent 70%)",
    sortOrder: 3,
  },
  {
    category: "restaurant",
    localId: 4,
    name: "Seafood Harbor",
    style: "Maritime",
    layoutKey: "harbor",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    accentColor: "#4facfe",
    iconKey: "Waves",
    pattern: "radial-gradient(ellipse at top, rgba(79, 172, 254, 0.2) 0%, transparent 50%)",
    sortOrder: 4,
  },
  {
    category: "restaurant",
    localId: 5,
    name: "Rustic Kitchen",
    style: "Homestyle",
    layoutKey: "tavern",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    accentColor: "#d97706",
    iconKey: "Home",
    sortOrder: 5,
  },
  {
    category: "restaurant",
    localId: 6,
    name: "Fine Dining",
    style: "Luxury",
    layoutKey: "tasting",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    accentColor: "#d4af37",
    iconKey: "Gem",
    pattern: "radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.2) 0%, transparent 60%)",
    sortOrder: 6,
  },
  {
    category: "cafe",
    localId: 1,
    name: "Coffee House",
    style: "Cozy & Warm",
    layoutKey: "chalkboard",
    gradient: "linear-gradient(135deg, #8b4513 0%, #d2691e 50%, #cd853f 100%)",
    accentColor: "#8b4513",
    iconKey: "Coffee",
    pattern: "radial-gradient(circle at 50% 50%, rgba(139, 69, 19, 0.15) 0%, transparent 70%)",
    sortOrder: 1,
  },
  {
    category: "cafe",
    localId: 2,
    name: "Urban Brew",
    style: "Modern Industrial",
    layoutKey: "brew-board",
    gradient: "linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)",
    accentColor: "#3498db",
    iconKey: "Factory",
    sortOrder: 2,
  },
  {
    category: "cafe",
    localId: 3,
    name: "Garden Café",
    style: "Fresh & Natural",
    layoutKey: "garden",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    accentColor: "#11998e",
    iconKey: "Sprout",
    pattern: "radial-gradient(ellipse at bottom, rgba(17, 153, 142, 0.2) 0%, transparent 50%)",
    sortOrder: 3,
  },
  {
    category: "cafe",
    localId: 4,
    name: "Parisian",
    style: "French Elegance",
    layoutKey: "bistrot",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    accentColor: "#e91e63",
    iconKey: "Flag",
    sortOrder: 4,
  },
  {
    category: "supermarket",
    localId: 1,
    name: "Clean Catalog",
    style: "Minimal",
    layoutKey: "shelf-tags",
    gradient: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    accentColor: "#4a5568",
    iconKey: "ClipboardList",
    sortOrder: 1,
  },
  {
    category: "supermarket",
    localId: 2,
    name: "Fresh Market",
    style: "Vibrant",
    layoutKey: "market",
    gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    accentColor: "#10b981",
    iconKey: "Apple",
    pattern: "radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)",
    sortOrder: 2,
  },
  {
    category: "supermarket",
    localId: 3,
    name: "Price List Pro",
    style: "Professional",
    layoutKey: "price-sheet",
    gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)",
    accentColor: "#3b82f6",
    iconKey: "Briefcase",
    sortOrder: 3,
  },
  {
    category: "bakery",
    localId: 1,
    name: "Sweet Treats",
    style: "Playful",
    layoutKey: "patisserie",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
    accentColor: "#ec4899",
    iconKey: "Cake",
    pattern: "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 70%)",
    sortOrder: 1,
  },
  {
    category: "bakery",
    localId: 2,
    name: "Artisan Bread",
    style: "Rustic",
    layoutKey: "kraft-bakery",
    gradient: "linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)",
    accentColor: "#92400e",
    iconKey: "Croissant",
    sortOrder: 2,
  },
  {
    category: "bakery",
    localId: 3,
    name: "Pastry Shop",
    style: "Elegant",
    layoutKey: "cake-card",
    gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
    accentColor: "#a855f7",
    iconKey: "CakeSlice",
    sortOrder: 3,
  },
  {
    category: "bar",
    localId: 1,
    name: "Cocktail Lounge",
    style: "Sophisticated",
    layoutKey: "speakeasy",
    gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)",
    accentColor: "#fbbf24",
    iconKey: "Martini",
    pattern: "radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.1) 0%, transparent 70%)",
    sortOrder: 1,
  },
  {
    category: "bar",
    localId: 2,
    name: "Wine Cellar",
    style: "Classic",
    layoutKey: "wine-list",
    gradient: "linear-gradient(135deg, #6b2c3e 0%, #8b3a4d 50%, #6b2c3e 100%)",
    accentColor: "#dc2626",
    iconKey: "Wine",
    sortOrder: 2,
  },
  {
    category: "bar",
    localId: 3,
    name: "Sports Bar",
    style: "Casual",
    layoutKey: "sports-board",
    gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    accentColor: "#f59e0b",
    iconKey: "Trophy",
    sortOrder: 3,
  },
  {
    category: "fastfood",
    localId: 1,
    name: "Quick Bites",
    style: "Bold & Fun",
    layoutKey: "combo-board",
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #ff6b6b 100%)",
    accentColor: "#dc2626",
    iconKey: "Sandwich",
    pattern: "radial-gradient(circle at 30% 30%, rgba(255, 107, 107, 0.2) 0%, transparent 60%)",
    sortOrder: 1,
  },
  {
    category: "fastfood",
    localId: 2,
    name: "Street Food",
    style: "Urban",
    layoutKey: "street-stall",
    gradient: "linear-gradient(135deg, #fad961 0%, #f76b1c 100%)",
    accentColor: "#f76b1c",
    iconKey: "CookingPot",
    sortOrder: 2,
  },
  {
    category: "fastfood",
    localId: 3,
    name: "Pizza Place",
    style: "Italian",
    layoutKey: "pizzeria",
    gradient: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
    accentColor: "#dc2626",
    iconKey: "Pizza",
    pattern: "radial-gradient(ellipse at top, rgba(201, 75, 75, 0.2) 0%, transparent 50%)",
    sortOrder: 3,
  },
];

async function seedPlans() {
  for (const plan of PLAN_SEEDS) {
    await prisma.planConfig.upsert({
      where: { key: plan.key },
      update: {
        nameEn: plan.nameEn,
        nameAr: plan.nameAr,
        priceMonthly: plan.priceMonthly,
        maxMenus: plan.maxMenus,
        featuresEn: plan.featuresEn,
        featuresAr: plan.featuresAr,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
      create: {
        key: plan.key,
        nameEn: plan.nameEn,
        nameAr: plan.nameAr,
        priceMonthly: plan.priceMonthly,
        maxMenus: plan.maxMenus,
        featuresEn: plan.featuresEn,
        featuresAr: plan.featuresAr,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
    });
  }
}

async function seedTemplates() {
  for (const t of TEMPLATE_SEEDS) {
    await prisma.menuTemplate.upsert({
      where: { category_localId: { category: t.category, localId: t.localId } },
      update: {
        name: t.name,
        nameAr: t.nameAr ?? null,
        style: t.style,
        layoutKey: t.layoutKey,
        gradient: t.gradient,
        accentColor: t.accentColor,
        iconKey: t.iconKey,
        pattern: t.pattern ?? null,
        sortOrder: t.sortOrder,
        isActive: true,
      },
      create: {
        category: t.category,
        localId: t.localId,
        name: t.name,
        nameAr: t.nameAr ?? null,
        style: t.style,
        layoutKey: t.layoutKey,
        gradient: t.gradient,
        accentColor: t.accentColor,
        iconKey: t.iconKey,
        pattern: t.pattern ?? null,
        sortOrder: t.sortOrder,
        isActive: true,
      },
    });
  }
}

async function seedSiteSettings() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      data: DEFAULT_SITE_SETTINGS as unknown as Prisma.InputJsonValue,
    },
  });
}

async function main() {
  await seedPlans();
  await seedTemplates();
  await seedSiteSettings();

  const adminEmail = "admin@carta.local";
  const adminPassword = "Admin123!";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "super_admin",
      isActive: true,
      plan: "business",
      name: "Super Admin",
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      name: "Super Admin",
      plan: "business",
      role: "super_admin",
      isActive: true,
    },
  });

  const adminSub = await prisma.subscription.findFirst({
    where: { userId: admin.id, status: "active" },
  });
  if (!adminSub) {
    await prisma.subscription.create({
      data: {
        userId: admin.id,
        plan: "business",
        status: "active",
        notes: "Super admin seed subscription",
      },
    });
  }

  const email = "demo@carta.local";
  const password = "Password123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: "Demo Owner",
      plan: "restaurant",
      role: "user",
    },
  });

  const demoSub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: "active" },
  });
  if (!demoSub) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "restaurant",
        status: "active",
        notes: "Demo seed subscription",
      },
    });
  }

  const existing = await prisma.menu.findFirst({
    where: { ownerId: user.id, slug: "elegant-dining" },
  });

  if (!existing) {
    const payload = {
      name: "Elegant Dining",
      nameAr: "تناول راقي",
      vendorName: "Casa Bella",
      currency: "EGP",
      language: "en" as const,
      pages: 1,
      theme: {
        primaryColor: "#d4af37",
        backgroundColor: "#1a1a2e",
        textColor: "#ffffff",
        cardColor: "#16213e",
        borderColor: "#d4af37",
        fontFamily: "Playfair Display",
        fontSize: "16",
        spacing: "5",
        layout: "fine-print",
      },
      categories: [
        {
          id: "cat_starters",
          name: "Starters",
          nameAr: "مقبلات",
          page: 1,
          items: [
            {
              id: "item_bruschetta",
              name: "Bruschetta",
              nameAr: "بروشيتا",
              description: "Toasted bread with tomatoes and basil",
              descriptionAr: "خبز محمص مع طماطم وريحان",
              price: 85,
              hasSizes: false,
              sizes: [],
              category: "cat_starters",
            },
            {
              id: "item_soup",
              name: "Soup of the Day",
              nameAr: "شوربة اليوم",
              description: "Ask your server for today's selection",
              descriptionAr: "اسأل النادل عن اختيار اليوم",
              price: 70,
              hasSizes: false,
              sizes: [],
              category: "cat_starters",
            },
          ],
        },
        {
          id: "cat_mains",
          name: "Mains",
          nameAr: "أطباق رئيسية",
          page: 1,
          items: [
            {
              id: "item_steak",
              name: "Grilled Steak",
              nameAr: "ستيك مشوي",
              description: "Served with seasonal vegetables",
              descriptionAr: "يقدم مع خضار الموسم",
              price: 320,
              hasSizes: true,
              sizes: [
                { name: "200g", price: 280 },
                { name: "300g", price: 320 },
              ],
              category: "cat_mains",
            },
          ],
        },
      ],
      designElements: [],
    };

    await prisma.menu.create({
      data: {
        ownerId: user.id,
        name: payload.name,
        nameAr: payload.nameAr,
        slug: "elegant-dining",
        data: payload as unknown as Prisma.InputJsonValue,
        isPublished: true,
        currency: "EGP",
        language: "en",
        pages: 1,
        templateCategory: "restaurant",
        templateId: 1,
      },
    });
  }

  console.log("Seed complete");
  console.log(`  Super admin: ${adminEmail} / ${adminPassword}`);
  console.log(`  Demo user:   ${email} / ${password}`);
  console.log(`  Public menu slug: elegant-dining`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
