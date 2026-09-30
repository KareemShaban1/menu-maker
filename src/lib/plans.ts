import type { ApiUser } from "@/lib/api";

export type PlanId = ApiUser["plan"];

export type PlanInfo = {
  id: PlanId;
  nameEn: string;
  nameAr: string;
  priceEn: string;
  priceAr: string;
  periodEn: string;
  periodAr: string;
  /** null = unlimited */
  maxMenus: number | null;
  featuresEn: string[];
  featuresAr: string[];
};

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    nameEn: "Free",
    nameAr: "مجاني",
    priceEn: "0",
    priceAr: "0",
    periodEn: "EGP forever",
    periodAr: "للأبد",
    maxMenus: 1,
    featuresEn: ["1 published menu", "Every template design", "Arabic and English with RTL", "Share link and PDF download"],
    featuresAr: ["قائمة منشورة واحدة", "كل تصاميم القوالب", "عربي وإنجليزي مع اتجاه من اليمين", "رابط مشاركة وتحميل PDF"],
  },
  {
    id: "restaurant",
    nameEn: "Restaurant",
    nameAr: "المطعم",
    priceEn: "199",
    priceAr: "199",
    periodEn: "EGP / month",
    periodAr: "جنيه / شهر",
    maxMenus: 5,
    featuresEn: ["Up to 5 menus", "Multiple currencies and pages", "Type controls for every text", "Your logo on the menu"],
    featuresAr: ["حتى 5 قوائم", "عملات متعددة وصفحات متعددة", "تنسيق الخط لكل نص", "شعار المطعم على القائمة"],
  },
  {
    id: "business",
    nameEn: "Business",
    nameAr: "الأعمال",
    priceEn: "499",
    priceAr: "499",
    periodEn: "EGP / month",
    periodAr: "جنيه / شهر",
    maxMenus: null,
    featuresEn: ["Unlimited menus", "Separate menus per branch", "Priority WhatsApp support", "Price changes go live for guests"],
    featuresAr: ["قوائم بلا حد", "فروع وقوائم منفصلة", "دعم أولوية على واتساب", "تحديث الأسعار يظهر فوراً للضيوف"],
  },
];

export const PLAN_LIMITS: Record<PlanId, number | null> = {
  free: 1,
  restaurant: 5,
  business: null,
};

export function getPlanInfo(plan: PlanId): PlanInfo {
  return PLANS.find((p) => p.id === plan) ?? PLANS[0];
}

export function canCreateMenu(plan: PlanId, currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan];
  if (limit === null) return true;
  return currentCount < limit;
}

export function formatPlanLimit(plan: PlanId, ar = false): string {
  const limit = PLAN_LIMITS[plan];
  if (limit === null) return ar ? "بلا حد" : "Unlimited";
  return String(limit);
}
