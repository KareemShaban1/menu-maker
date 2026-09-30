import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { uploadMiddleware } from "./uploads.service";
import * as uploadsController from "./uploads.controller";

const router = Router();

router.post("/", requireAuth, uploadMiddleware, uploadsController.upload);

export default router;
