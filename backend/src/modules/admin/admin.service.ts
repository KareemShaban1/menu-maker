import type { Plan, PlanConfig, Prisma, Subscription, MenuTemplate } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";
import { DEFAULT_SITE_SETTINGS } from "../../lib/siteSettingsDefaults";
import { toPublicUser, type PublicUser } from "../auth/auth.service";
import { toMenuData } from "../menus/menus.service";
import type {
  CreateSubscriptionInput,
  CreateTemplateInput,
  UpdateMenuAdminInput,
  UpdatePlanConfigInput,
  UpdateSiteSettingsInput,
  UpdateSubscriptionInput,
  UpdateTemplateInput,
  UpdateUserInput,
} from "./admin.schema";

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const prev = out[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      prev &&
      typeof prev === "object" &&
      !Array.isArray(prev)
    ) {
      out[key] = deepMerge(prev as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function toPlanConfigDto(row: PlanConfig) {
  return {
    id: row.id,
    key: row.key,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    priceMonthly: row.priceMonthly,
    maxMenus: row.maxMenus,
    featuresEn: asStringArray(row.featuresEn),
    featuresAr: asStringArray(row.featuresAr),
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toSubscriptionDto(
  row: Subscription & { user?: { id: string; email: string; name: string | null } }
) {
  return {
    id: row.id,
    userId: row.userId,
    plan: row.plan,
    status: row.status,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    user: row.user
      ? { id: row.user.id, email: row.user.email, name: row.user.name }
      : undefined,
  };
}

export function toTemplateDto(row: MenuTemplate) {
  return {
    id: row.id,
    category: row.category,
    localId: row.localId,
    name: row.name,
    nameAr: row.nameAr,
    style: row.style,
    styleAr: row.styleAr,
    layoutKey: row.layoutKey,
    gradient: row.gradient,
    accentColor: row.accentColor,
    iconKey: row.iconKey,
    pattern: row.pattern,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getStats() {
  const [
    users,
    activeUsers,
    menus,
    publishedMenus,
    subscriptions,
    activeSubscriptions,
    templates,
    activeTemplates,
    byPlan,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.menu.count(),
    prisma.menu.count({ where: { isPublished: true } }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.menuTemplate.count(),
    prisma.menuTemplate.count({ where: { isActive: true } }),
    prisma.user.groupBy({ by: ["plan"], _count: { _all: true } }),
  ]);

  return {
    users: { total: users, active: activeUsers },
    menus: { total: menus, published: publishedMenus },
    subscriptions: { total: subscriptions, active: activeSubscriptions },
    templates: { total: templates, active: activeTemplates },
    usersByPlan: byPlan.map((row) => ({ plan: row.plan, count: row._count._all })),
  };
}

export async function listUsers(opts: { q?: string; page: number; pageSize: number }) {
  const where: Prisma.UserWhereInput = opts.q
    ? {
        OR: [
          { email: { contains: opts.q } },
          { name: { contains: opts.q } },
        ],
      }
    : {};

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (opts.page - 1) * opts.pageSize,
      take: opts.pageSize,
      include: {
        _count: { select: { menus: true, subscriptions: true } },
      },
    }),
  ]);

  return {
    items: rows.map((row) => ({
      ...toPublicUser(row),
      menuCount: row._count.menus,
      subscriptionCount: row._count.subscriptions,
    })),
    total,
    page: opts.page,
    pageSize: opts.pageSize,
  };
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { menus: true, subscriptions: true } },
      subscriptions: { orderBy: { createdAt: "desc" }, take: 10 },
      menus: {
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          slug: true,
          isPublished: true,
          updatedAt: true,
        },
      },
    },
  });
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found");

  return {
    ...toPublicUser(user),
    menuCount: user._count.menus,
    subscriptionCount: user._count.subscriptions,
    subscriptions: user.subscriptions.map((s) => toSubscriptionDto(s)),
    menus: user.menus.map((m) => ({
      ...m,
      updatedAt: m.updatedAt.toISOString(),
    })),
  };
}

export async function updateUser(id: string, input: UpdateUserInput, actorId: string) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "User not found");

  if (existing.id === actorId && input.role && input.role !== "super_admin") {
    throw new AppError(400, "INVALID", "You cannot remove your own super admin role");
  }
  if (existing.id === actorId && input.isActive === false) {
    throw new AppError(400, "INVALID", "You cannot disable your own account");
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: input.name === undefined ? undefined : input.name,
      plan: input.plan,
      role: input.role,
      isActive: input.isActive,
    },
  });

  if (input.plan && input.plan !== existing.plan) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: input.plan,
        status: "active",
        notes: "Plan changed by super admin",
      },
    });
  }

  return toPublicUser(user) as PublicUser;
}

export async function deleteUser(id: string, actorId: string) {
  if (id === actorId) {
    throw new AppError(400, "INVALID", "You cannot delete your own account");
  }
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "User not found");
  await prisma.user.delete({ where: { id } });
  return { deleted: true };
}

export async function listPlanConfigs() {
  const rows = await prisma.planConfig.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(toPlanConfigDto);
}

export async function updatePlanConfig(key: Plan, input: UpdatePlanConfigInput) {
  const existing = await prisma.planConfig.findUnique({ where: { key } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Plan not found");

  const row = await prisma.planConfig.update({
    where: { key },
    data: {
      nameEn: input.nameEn,
      nameAr: input.nameAr,
      priceMonthly: input.priceMonthly,
      maxMenus: input.maxMenus === undefined ? undefined : input.maxMenus,
      featuresEn:
        input.featuresEn === undefined
          ? undefined
          : (input.featuresEn as Prisma.InputJsonValue),
      featuresAr:
        input.featuresAr === undefined
          ? undefined
          : (input.featuresAr as Prisma.InputJsonValue),
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    },
  });

  return toPlanConfigDto(row);
}

export async function listSubscriptions(opts: {
  q?: string;
  page: number;
  pageSize: number;
  status?: Subscription["status"];
  plan?: Plan;
  userId?: string;
}) {
  const where: Prisma.SubscriptionWhereInput = {
    status: opts.status,
    plan: opts.plan,
    userId: opts.userId,
  };

  if (opts.q) {
    where.user = {
      OR: [{ email: { contains: opts.q } }, { name: { contains: opts.q } }],
    };
  }

  const [total, rows] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (opts.page - 1) * opts.pageSize,
      take: opts.pageSize,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    }),
  ]);

  return {
    items: rows.map((row) => toSubscriptionDto(row)),
    total,
    page: opts.page,
    pageSize: opts.pageSize,
  };
}

export async function createSubscription(input: CreateSubscriptionInput) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found");

  const row = await prisma.subscription.create({
    data: {
      userId: input.userId,
      plan: input.plan,
      status: input.status,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      endsAt: input.endsAt === undefined ? undefined : input.endsAt ? new Date(input.endsAt) : null,
      notes: input.notes ?? null,
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (input.syncUserPlan) {
    await prisma.user.update({
      where: { id: input.userId },
      data: { plan: input.plan },
    });
  }

  return toSubscriptionDto(row);
}

export async function updateSubscription(id: string, input: UpdateSubscriptionInput) {
  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Subscription not found");

  const row = await prisma.subscription.update({
    where: { id },
    data: {
      plan: input.plan,
      status: input.status,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      endsAt: input.endsAt === undefined ? undefined : input.endsAt ? new Date(input.endsAt) : null,
      notes: input.notes === undefined ? undefined : input.notes,
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (input.syncUserPlan && (input.plan || input.status === "active")) {
    await prisma.user.update({
      where: { id: existing.userId },
      data: { plan: input.plan ?? existing.plan },
    });
  }

  return toSubscriptionDto(row);
}

export async function deleteSubscription(id: string) {
  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Subscription not found");
  await prisma.subscription.delete({ where: { id } });
  return { deleted: true };
}

export async function listTemplates(opts?: { includeInactive?: boolean }) {
  const rows = await prisma.menuTemplate.findMany({
    where: opts?.includeInactive ? undefined : { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { localId: "asc" }],
  });
  return rows.map(toTemplateDto);
}

export async function createTemplate(input: CreateTemplateInput) {
  const clash = await prisma.menuTemplate.findUnique({
    where: { category_localId: { category: input.category, localId: input.localId } },
  });
  if (clash) {
    throw new AppError(409, "TEMPLATE_EXISTS", "A template with this category and localId already exists");
  }

  const row = await prisma.menuTemplate.create({
    data: {
      category: input.category,
      localId: input.localId,
      name: input.name,
      nameAr: input.nameAr ?? null,
      style: input.style,
      styleAr: input.styleAr ?? null,
      layoutKey: input.layoutKey,
      gradient: input.gradient,
      accentColor: input.accentColor,
      iconKey: input.iconKey,
      pattern: input.pattern ?? null,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  return toTemplateDto(row);
}

export async function updateTemplate(id: string, input: UpdateTemplateInput) {
  const existing = await prisma.menuTemplate.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Template not found");

  if (
    (input.category !== undefined || input.localId !== undefined) &&
    (input.category !== existing.category || input.localId !== existing.localId)
  ) {
    const category = input.category ?? existing.category;
    const localId = input.localId ?? existing.localId;
    const clash = await prisma.menuTemplate.findUnique({
      where: { category_localId: { category, localId } },
    });
    if (clash && clash.id !== id) {
      throw new AppError(409, "TEMPLATE_EXISTS", "A template with this category and localId already exists");
    }
  }

  const row = await prisma.menuTemplate.update({
    where: { id },
    data: {
      category: input.category,
      localId: input.localId,
      name: input.name,
      nameAr: input.nameAr === undefined ? undefined : input.nameAr,
      style: input.style,
      styleAr: input.styleAr === undefined ? undefined : input.styleAr,
      layoutKey: input.layoutKey,
      gradient: input.gradient,
      accentColor: input.accentColor,
      iconKey: input.iconKey,
      pattern: input.pattern === undefined ? undefined : input.pattern,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    },
  });
  return toTemplateDto(row);
}

export async function deleteTemplate(id: string) {
  const existing = await prisma.menuTemplate.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Template not found");
  await prisma.menuTemplate.delete({ where: { id } });
  return { deleted: true };
}

export async function listAllMenus(opts: {
  q?: string;
  page: number;
  pageSize: number;
  published?: boolean;
  ownerId?: string;
}) {
  const where: Prisma.MenuWhereInput = {
    isPublished: opts.published,
    ownerId: opts.ownerId,
  };
  if (opts.q) {
    where.OR = [
      { name: { contains: opts.q } },
      { nameAr: { contains: opts.q } },
      { slug: { contains: opts.q } },
      { owner: { email: { contains: opts.q } } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.menu.count({ where }),
    prisma.menu.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (opts.page - 1) * opts.pageSize,
      take: opts.pageSize,
      include: {
        owner: { select: { id: true, email: true, name: true } },
      },
    }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      nameAr: row.nameAr,
      currency: row.currency,
      pages: row.pages,
      isPublished: row.isPublished,
      templateCategory: row.templateCategory,
      templateId: row.templateId,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      owner: row.owner,
    })),
    total,
    page: opts.page,
    pageSize: opts.pageSize,
  };
}

export async function getMenuAdmin(id: string) {
  const row = await prisma.menu.findUnique({
    where: { id },
    include: { owner: { select: { id: true, email: true, name: true } } },
  });
  if (!row) throw new AppError(404, "NOT_FOUND", "Menu not found");
  return { ...toMenuData(row), owner: row.owner };
}

export async function updateMenuAdmin(id: string, input: UpdateMenuAdminInput) {
  const existing = await prisma.menu.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Menu not found");

  if (input.slug) {
    const clash = await prisma.menu.findUnique({ where: { slug: input.slug } });
    if (clash && clash.id !== id) {
      throw new AppError(409, "SLUG_TAKEN", "This slug is already in use");
    }
  }

  const row = await prisma.menu.update({
    where: { id },
    data: {
      isPublished: input.isPublished,
      slug: input.slug === undefined ? undefined : input.slug,
      name: input.name,
    },
    include: { owner: { select: { id: true, email: true, name: true } } },
  });

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr,
    isPublished: row.isPublished,
    updatedAt: row.updatedAt.toISOString(),
    owner: row.owner,
  };
}

export async function deleteMenuAdmin(id: string) {
  const existing = await prisma.menu.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Menu not found");
  await prisma.menu.delete({ where: { id } });
  return { deleted: true };
}

export async function getSiteSettings() {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!row) {
    return {
      ...DEFAULT_SITE_SETTINGS,
      updatedAt: null as string | null,
    };
  }
  const data = row.data as Record<string, unknown>;
  const merged = deepMerge(
    DEFAULT_SITE_SETTINGS as unknown as Record<string, unknown>,
    data
  );
  return {
    ...merged,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateSiteSettings(input: UpdateSiteSettingsInput) {
  const current = await getSiteSettings();
  const { updatedAt: _ignore, ...currentData } = current as Record<string, unknown> & {
    updatedAt?: string | null;
  };

  const patch: Record<string, unknown> = { ...input };
  if (patch.brand && typeof patch.brand === "object") {
    const brand = { ...(patch.brand as Record<string, unknown>) };
    if (brand.logoUrl === "") brand.logoUrl = null;
    patch.brand = brand;
  }

  const next = deepMerge(currentData as Record<string, unknown>, patch);

  const row = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      data: next as Prisma.InputJsonValue,
    },
    update: {
      data: next as Prisma.InputJsonValue,
    },
  });

  return {
    ...next,
    updatedAt: row.updatedAt.toISOString(),
  };
}
