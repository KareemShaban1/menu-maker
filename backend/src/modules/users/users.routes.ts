import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { updateMeSchema, updatePlanSchema } from "./users.schema";
import * as usersController from "./users.controller";

const router = Router();

router.use(requireAuth);

router.patch("/me", validate({ body: updateMeSchema }), usersController.updateMe);
router.patch("/me/plan", validate({ body: updatePlanSchema }), usersController.updatePlan);

export default router;
