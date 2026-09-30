import type { Plan, Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../lib/jwt";
import { AppError } from "../lib/errors";

export type AuthUser = {
  id: string;
  email: string;
  plan: Plan;
  role: Role;
  name: string | null;
  isActive: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

async function loadUserFromAuthHeader(req: Request): Promise<AuthUser | undefined> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;

  const token = header.slice("Bearer ".length).trim();
  if (!token) return undefined;

  const payload = verifyToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "User not found");
  }
  if (!user.isActive) {
    throw new AppError(403, "ACCOUNT_DISABLED", "This account has been disabled");
  }

  return {
    id: user.id,
    email: user.email,
    plan: user.plan,
    role: user.role,
    name: user.name,
    isActive: user.isActive,
  };
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await loadUserFromAuthHeader(req);
    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await loadUserFromAuthHeader(req);
    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    if (user.role !== "super_admin") {
      throw new AppError(403, "FORBIDDEN", "Super admin access required");
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    req.user = await loadUserFromAuthHeader(req);
    next();
  } catch (err) {
    next(err);
  }
}
