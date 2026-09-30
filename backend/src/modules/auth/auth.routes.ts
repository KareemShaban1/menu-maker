import { Router } from "express";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rateLimit";
import { loginSchema, registerSchema } from "./auth.schema";
import * as authController from "./auth.controller";

const router = Router();

const authLimiter = rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "auth" });

router.post("/register", authLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", authLimiter, validate({ body: loginSchema }), authController.login);
router.get("/me", requireAuth, authController.me);

export default router;
