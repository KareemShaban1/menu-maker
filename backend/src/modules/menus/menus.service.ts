import type { Menu, Plan, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";
import { getPlanMaxMenus } from "../../lib/plans";
import { type MenuData, type MenuPayload } from "../../types/menu";
import type { MenuPatchInput, MenuUpsertInput } from "./menus.schema";

function extractPayload(input: MenuUpsertInput | MenuPatchInput): Partial<MenuPayload> {
  const {
    name,
    nameAr,
    titleStyle,
    vendorStyle,
    categories,
    designElements,
    vendorName,
    vendorLogo,
    theme,
    pages,
    currency,
    language,
  } = input;

  const payload: Partial<MenuPayload> = {};
  if (name !== undefined) payload.name = name;
  if (nameAr !== undefined) payload.nameAr = nameAr;
  if (titleStyle !== undefined) payload.titleStyle = titleStyle;
  if (vendorStyle !== undefined) payload.vendorStyle = vendorStyle;
  if (categories !== undefined) payload.categories = categories;
  if (designElements !== undefined) payload.designElements = designElements;
  if (vendorName !== undefined) payload.vendorName = vendorName;
  if (vendorLogo !== undefined) payload.vendorLogo = vendorLogo;
  if (theme !== undefined) payload.theme = theme;
  if (pages !== undefined) payload.pages = pages;
  if (currency !== undefined) payload.currency = currency;
  if (language !== undefined) payload.language = language;
  return payload;
}

export function toMenuData(row: Menu): MenuData {
  const data = (row.data ?? {}) as unknown as Partial<MenuPayload>;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr ?? data.nameAr,
    titleStyle: data.titleStyle,
    vendorStyle: data.vendorStyle,
    categories: data.categories ?? [],
    designElements: data.designElements,
    vendorName: data.vendorName,
    vendorLogo: data.vendorLogo,
    theme: data.theme,
    pages: row.pages,
    currency: row.currency,
    language: (row.language as "en" | "ar") || "en",
    isPublished: row.isPublished,
    templateCategory: row.templateCategory,
    templateId: row.templateId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export type MenuSummary = {
  id: string;
  slug: string | null;
  name: string;
  nameAr: string | null;
  currency: string;
  pages: number;
  isPublished: boolean;
  updatedAt: string;
  createdAt: string;
};

function toSummary(row: Menu): MenuSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr,
    currency: row.currency,
    pages: row.pages,
    isPublished: row.isPublished,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function assertCanCreateMenu(userId: string, plan: Plan) {
  const limit = await getPlanMaxMenus(plan);
  if (limit === null) return;
  const count = await prisma.menu.count({ where: { ownerId: userId } });
  if (count >= limit) {
    throw new AppError(
      403,
      "PLAN_LIMIT",
      `Your ${plan} plan allows ${limit} menu(s). Upgrade to create more.`
    );
  }
}

async function assertSlugAvailable(slug: string | null | undefined, excludeId?: string) {
  if (!slug) return;
  const existing = await prisma.menu.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw new AppError(409, "SLUG_TAKEN", "This slug is already in use");
  }
}

async function getOwnedMenu(id: string, ownerId: string) {
  const menu = await prisma.menu.findUnique({ where: { id } });
  if (!menu || menu.ownerId !== ownerId) {
    throw new AppError(404, "NOT_FOUND", "Menu not found");
  }
  return menu;
}

export async function listMenus(ownerId: string) {
  const rows = await prisma.menu.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toSummary);
}

export async function createMenu(ownerId: string, plan: Plan, input: MenuUpsertInput) {
  await assertCanCreateMenu(ownerId, plan);
  await assertSlugAvailable(input.slug ?? null);

  const payload = extractPayload(input) as MenuPayload;
  if (!payload.categories) payload.categories = [];
  payload.name = input.name;

  const row = await prisma.menu.create({
    data: {
      ownerId,
      name: input.name,
      nameAr: input.nameAr ?? null,
      slug: input.slug ?? null,
      data: payload as unknown as Prisma.InputJsonValue,
      isPublished: input.isPublished ?? true,
      currency: input.currency ?? "EGP",
      language: input.language ?? "en",
      pages: input.pages ?? 1,
      templateCategory: input.templateCategory ?? null,
      templateId: input.templateId ?? null,
    },
  });

  return toMenuData(row);
}

export async function getMenuForOwner(id: string, ownerId: string) {
  const row = await getOwnedMenu(id, ownerId);
  return toMenuData(row);
}

export async function replaceMenu(id: string, ownerId: string, input: MenuUpsertInput) {
  const existing = await getOwnedMenu(id, ownerId);
  await assertSlugAvailable(input.slug ?? null, id);

  const payload = extractPayload(input) as MenuPayload;
  if (!payload.categories) payload.categories = [];
  payload.name = input.name;

  const row = await prisma.menu.update({
    where: { id: existing.id },
    data: {
      name: input.name,
      nameAr: input.nameAr ?? null,
      slug: input.slug === undefined ? existing.slug : input.slug,
      data: payload as unknown as Prisma.InputJsonValue,
      isPublished: input.isPublished ?? existing.isPublished,
      currency: input.currency ?? existing.currency,
      language: input.language ?? existing.language,
      pages: input.pages ?? existing.pages,
      templateCategory:
        input.templateCategory === undefined ? existing.templateCategory : input.templateCategory,
      templateId: input.templateId === undefined ? existing.templateId : input.templateId,
    },
  });

  return toMenuData(row);
}

export async function patchMenu(id: string, ownerId: string, input: MenuPatchInput) {
  const existing = await getOwnedMenu(id, ownerId);
  if (input.slug !== undefined) {
    await assertSlugAvailable(input.slug, id);
  }

  const existingData = (existing.data ?? {}) as unknown as MenuPayload;
  const patchPayload = extractPayload(input);
  const mergedData: MenuPayload = {
    ...existingData,
    ...patchPayload,
    name: input.name ?? existingData.name ?? existing.name,
    categories: patchPayload.categories ?? existingData.categories ?? [],
  };

  const row = await prisma.menu.update({
    where: { id: existing.id },
    data: {
      name: input.name ?? existing.name,
      nameAr: input.nameAr === undefined ? existing.nameAr : input.nameAr,
      slug: input.slug === undefined ? existing.slug : input.slug,
      data: mergedData as unknown as Prisma.InputJsonValue,
      isPublished: input.isPublished ?? existing.isPublished,
      currency: input.currency ?? existing.currency,
      language: input.language ?? existing.language,
      pages: input.pages ?? existing.pages,
      templateCategory:
        input.templateCategory === undefined ? existing.templateCategory : input.templateCategory,
      templateId: input.templateId === undefined ? existing.templateId : input.templateId,
    },
  });

  return toMenuData(row);
}

export async function deleteMenu(id: string, ownerId: string) {
  await getOwnedMenu(id, ownerId);
  await prisma.menu.delete({ where: { id } });
}
