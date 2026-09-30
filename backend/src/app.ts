import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import menusRoutes from "./modules/menus/menus.routes";
import publicRoutes from "./modules/public/public.routes";
import uploadsRoutes from "./modules/uploads/uploads.routes";
import usersRoutes from "./modules/users/users.routes";
import adminRoutes from "./modules/admin/admin.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    })
  );
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  const uploadRoot = path.resolve(env.UPLOAD_DIR);
  app.use(env.UPLOAD_PUBLIC_PATH, express.static(uploadRoot));

  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      data: { status: "ok", time: new Date().toISOString() },
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/menus", menusRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/uploads", uploadsRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
