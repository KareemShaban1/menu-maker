import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";
import { toMenuData } from "../menus/menus.service";
import { getSiteSettings, toPlanConfigDto, toTemplateDto } from "../admin/admin.service";

export async function getPublishedMenu(idOrSlug: string) {
  let menu = await prisma.menu.findUnique({ where: { id: idOrSlug } });

  if (!menu) {
    menu = await prisma.menu.findUnique({ where: { slug: idOrSlug } });
  }

  if (!menu || !menu.isPublished) {
    throw new AppError(404, "NOT_FOUND", "Menu not found");
  }

  return toMenuData(menu);
}

export async function listActiveTemplates() {
  const rows = await prisma.menuTemplate.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { localId: "asc" }],
  });
  return rows.map(toTemplateDto);
}

export async function listActivePlans() {
  const rows = await prisma.planConfig.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toPlanConfigDto);
}

export async function getPublicSiteSettings() {
  return getSiteSettings();
}
