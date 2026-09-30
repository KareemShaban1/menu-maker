import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_URL: z.string().url().default("http://localhost:4000"),
  FRONTEND_URL: z.string().url().default("http://localhost:8080"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  UPLOAD_DIR: z.string().default("uploads"),
  UPLOAD_MAX_MB: z.coerce.number().positive().default(5),
  UPLOAD_PUBLIC_PATH: z.string().default("/uploads"),
  CORS_ORIGINS: z.string().default("http://localhost:8080"),
  DEFAULT_PLAN: z.enum(["free", "restaurant", "business"]).default("free"),
  ALLOW_PLAN_CHANGE: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables. Check backend/.env against .env.example");
}

const data = parsed.data;

export const env = {
  ...data,
  CORS_ORIGINS: data.CORS_ORIGINS.split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  ALLOW_PLAN_CHANGE: Boolean(data.ALLOW_PLAN_CHANGE),
};

export type Env = typeof env;
