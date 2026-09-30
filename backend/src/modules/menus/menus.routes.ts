import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  menuIdParamsSchema,
  menuPatchSchema,
  menuUpsertSchema,
} from "./menus.schema";
import * as menusController from "./menus.controller";

const router = Router();

router.use(requireAuth);

router.get("/", menusController.list);
router.post("/", validate({ body: menuUpsertSchema }), menusController.create);
router.get("/:id", validate({ params: menuIdParamsSchema }), menusController.getOne);
router.put(
  "/:id",
  validate({ params: menuIdParamsSchema, body: menuUpsertSchema }),
  menusController.replace
);
router.patch(
  "/:id",
  validate({ params: menuIdParamsSchema, body: menuPatchSchema }),
  menusController.patch
);
router.delete("/:id", validate({ params: menuIdParamsSchema }), menusController.remove);

export default router;
