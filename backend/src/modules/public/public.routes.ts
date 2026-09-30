import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate";
import { rateLimit } from "../../middleware/rateLimit";
import * as publicController from "./public.controller";

const router = Router();

const publicLimiter = rateLimit({ windowMs: 60_000, max: 120, keyPrefix: "public" });

router.get("/templates", publicLimiter, publicController.listTemplates);
router.get("/plans", publicLimiter, publicController.listPlans);
router.get("/site-settings", publicLimiter, publicController.getSiteSettings);

router.get(
  "/menus/:idOrSlug",
  publicLimiter,
  validate({
    params: z.object({ idOrSlug: z.string().min(1) }),
  }),
  publicController.getMenu
);

export default router;
