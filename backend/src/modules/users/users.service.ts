import type { Plan } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";
import { env } from "../../config/env";
import { toPublicUser } from "../auth/auth.service";

export async function updateName(userId: string, name: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: name.trim() },
  });
  return toPublicUser(user);
}

export async function updatePlan(userId: string, plan: Plan) {
  if (!env.ALLOW_PLAN_CHANGE) {
    throw new AppError(
      403,
      "PLAN_CHANGE_DISABLED",
      "Plan changes are disabled. Billing is not configured yet."
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { plan },
  });
  return toPublicUser(user);
}
