import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";
import type { Request } from "express";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userId = (req as Request).user?.id;
    if (!userId) {
      return cb(new AppError(401, "UNAUTHORIZED", "Authentication required"), "");
    }
    const dest = path.resolve(env.UPLOAD_DIR, userId);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || path.extname(file.originalname).toLowerCase() || ".bin";
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new AppError(400, "INVALID_FILE_TYPE", "Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
    cb(null, true);
  },
}).single("file");

export async function saveUpload(ownerId: string, file: Express.Multer.File) {
  if (!file) {
    throw new AppError(400, "FILE_REQUIRED", "A file field named 'file' is required");
  }

  const relativeUrl = `${env.UPLOAD_PUBLIC_PATH.replace(/\/$/, "")}/${ownerId}/${file.filename}`;
  const absoluteUrl = `${env.APP_URL.replace(/\/$/, "")}${relativeUrl}`;

  const record = await prisma.upload.create({
    data: {
      ownerId,
      filename: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: absoluteUrl,
    },
  });

  return {
    id: record.id,
    url: record.url,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
  };
}
