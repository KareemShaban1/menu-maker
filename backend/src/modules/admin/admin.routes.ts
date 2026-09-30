import { Router } from "express";
import { requireSuperAdmin } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createSubscriptionSchema,
  createTemplateSchema,
  listMenusQuerySchema,
  listQuerySchema,
  listSubscriptionsQuerySchema,
  menuIdParamsSchema,
  planKeyParamsSchema,
  subscriptionIdParamsSchema,
  templateIdParamsSchema,
  updateMenuAdminSchema,
  updatePlanConfigSchema,
  updateSubscriptionSchema,
  updateTemplateSchema,
  updateSiteSettingsSchema,
  updateUserSchema,
  userIdParamsSchema,
} from "./admin.schema";
import * as adminController from "./admin.controller";

const router = Router();

router.use(requireSuperAdmin);

router.get("/stats", adminController.stats);

router.get("/site-settings", adminController.getSiteSettings);
router.put(
  "/site-settings",
  validate({ body: updateSiteSettingsSchema }),
  adminController.updateSiteSettings
);

router.get("/users", validate({ query: listQuerySchema }), adminController.listUsers);
router.get("/users/:id", validate({ params: userIdParamsSchema }), adminController.getUser);
router.patch(
  "/users/:id",
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  adminController.updateUser
);
router.delete("/users/:id", validate({ params: userIdParamsSchema }), adminController.deleteUser);

router.get("/plans", adminController.listPlans);
router.patch(
  "/plans/:key",
  validate({ params: planKeyParamsSchema, body: updatePlanConfigSchema }),
  adminController.updatePlan
);

router.get(
  "/subscriptions",
  validate({ query: listSubscriptionsQuerySchema }),
  adminController.listSubscriptions
);
router.post(
  "/subscriptions",
  validate({ body: createSubscriptionSchema }),
  adminController.createSubscription
);
router.patch(
  "/subscriptions/:id",
  validate({ params: subscriptionIdParamsSchema, body: updateSubscriptionSchema }),
  adminController.updateSubscription
);
router.delete(
  "/subscriptions/:id",
  validate({ params: subscriptionIdParamsSchema }),
  adminController.deleteSubscription
);

router.get("/templates", adminController.listTemplates);
router.post("/templates", validate({ body: createTemplateSchema }), adminController.createTemplate);
router.patch(
  "/templates/:id",
  validate({ params: templateIdParamsSchema, body: updateTemplateSchema }),
  adminController.updateTemplate
);
router.delete(
  "/templates/:id",
  validate({ params: templateIdParamsSchema }),
  adminController.deleteTemplate
);

router.get("/menus", validate({ query: listMenusQuerySchema }), adminController.listMenus);
router.get("/menus/:id", validate({ params: menuIdParamsSchema }), adminController.getMenu);
router.patch(
  "/menus/:id",
  validate({ params: menuIdParamsSchema, body: updateMenuAdminSchema }),
  adminController.updateMenu
);
router.delete("/menus/:id", validate({ params: menuIdParamsSchema }), adminController.deleteMenu);

export default router;
