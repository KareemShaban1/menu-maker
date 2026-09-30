import { z } from "zod";

const planEnum = z.enum(["free", "restaurant", "business"]);
const roleEnum = z.enum(["user", "super_admin"]);
const subscriptionStatusEnum = z.enum(["active", "trial", "past_due", "canceled", "expired"]);
const templateCategoryEnum = z.enum([
  "restaurant",
  "cafe",
  "supermarket",
  "bakery",
  "bar",
  "fastfood",
]);

export const listQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const userIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).nullable().optional(),
  plan: planEnum.optional(),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
});

export const updatePlanConfigSchema = z.object({
  nameEn: z.string().trim().min(1).max(80).optional(),
  nameAr: z.string().trim().min(1).max(80).optional(),
  priceMonthly: z.number().int().min(0).optional(),
  maxMenus: z.number().int().min(0).nullable().optional(),
  featuresEn: z.array(z.string().max(200)).max(20).optional(),
  featuresAr: z.array(z.string().max(200)).max(20).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const planKeyParamsSchema = z.object({
  key: planEnum,
});

export const createSubscriptionSchema = z.object({
  userId: z.string().min(1),
  plan: planEnum,
  status: subscriptionStatusEnum.default("active"),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  syncUserPlan: z.boolean().optional().default(true),
});

export const updateSubscriptionSchema = z.object({
  plan: planEnum.optional(),
  status: subscriptionStatusEnum.optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  syncUserPlan: z.boolean().optional().default(true),
});

export const subscriptionIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listSubscriptionsQuerySchema = listQuerySchema.extend({
  status: subscriptionStatusEnum.optional(),
  plan: planEnum.optional(),
  userId: z.string().min(1).optional(),
});

export const createTemplateSchema = z.object({
  category: templateCategoryEnum,
  localId: z.number().int().min(1),
  name: z.string().trim().min(1).max(120),
  nameAr: z.string().trim().max(120).nullable().optional(),
  style: z.string().trim().min(1).max(120),
  styleAr: z.string().trim().max(120).nullable().optional(),
  layoutKey: z.string().trim().min(1).max(64),
  gradient: z.string().trim().min(1),
  accentColor: z.string().trim().min(1).max(32),
  iconKey: z.string().trim().min(1).max(64),
  pattern: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const updateTemplateSchema = createTemplateSchema.partial().omit({ category: true, localId: true }).extend({
  category: templateCategoryEnum.optional(),
  localId: z.number().int().min(1).optional(),
});

export const templateIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listMenusQuerySchema = listQuerySchema.extend({
  published: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  ownerId: z.string().min(1).optional(),
});

export const updateMenuAdminSchema = z.object({
  isPublished: z.boolean().optional(),
  slug: z.string().trim().min(1).max(80).nullable().optional(),
  name: z.string().trim().min(1).max(200).optional(),
});

export const menuIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePlanConfigInput = z.infer<typeof updatePlanConfigSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type UpdateMenuAdminInput = z.infer<typeof updateMenuAdminSchema>;

/** Full site settings document — validated loosely as a JSON object. */
export const updateSiteSettingsSchema = z.object({
  brand: z
    .object({
      name: z.string().trim().min(1).max(80),
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(500),
      logoUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
    })
    .optional(),
  theme: z
    .object({
      primary: z.string().min(4).max(32),
      accent: z.string().min(4).max(32),
      background: z.string().min(4).max(32),
      foreground: z.string().min(4).max(32),
      secondary: z.string().min(4).max(32),
      mutedForeground: z.string().min(4).max(32),
      card: z.string().min(4).max(32),
      border: z.string().min(4).max(32),
    })
    .optional(),
  fonts: z
    .object({
      display: z.string().trim().min(1).max(80),
      body: z.string().trim().min(1).max(80),
    })
    .optional(),
  icons: z.record(z.any()).optional(),
  home: z.record(z.any()).optional(),
  about: z.record(z.any()).optional(),
});

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
