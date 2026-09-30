import type { Plan } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PLAN_LIMITS } from "../types/menu";

/** Resolve menu limit from PlanConfig, falling back to static PLAN_LIMITS. */
export async function getPlanMaxMenus(plan: Plan): Promise<number | null> {
  const config = await prisma.planConfig.findUnique({ where: { key: plan } });
  if (config) return config.maxMenus;
  return PLAN_LIMITS[plan] ?? null;
}
