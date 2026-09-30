import bcrypt from "bcrypt";
import type { Plan, Role, User } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/jwt";
import { AppError } from "../../lib/errors";
import { env } from "../../config/env";
import type { LoginInput, RegisterInput } from "./auth.schema";

const BCRYPT_ROUNDS = 12;

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name?.trim() || null,
      plan: env.DEFAULT_PLAN,
      role: "user",
    },
  });

  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: user.plan,
      status: "active",
      notes: "Created on registration",
    },
  });

  const token = signToken({ sub: user.id, email: user.email });
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput) {
  const email = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  if (!user.isActive) {
    throw new AppError(403, "ACCOUNT_DISABLED", "This account has been disabled");
  }

  const token = signToken({ sub: user.id, email: user.email });
  return { user: toPublicUser(user), token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "User not found");
  }
  if (!user.isActive) {
    throw new AppError(403, "ACCOUNT_DISABLED", "This account has been disabled");
  }
  return toPublicUser(user);
}

export { toPublicUser };
