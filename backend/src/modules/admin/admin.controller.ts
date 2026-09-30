import type { NextFunction, Request, Response } from "express";
import type { Plan, SubscriptionStatus } from "@prisma/client";
import * as adminService from "./admin.service";

export async function stats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listUsers({
      q: req.query.q as string | undefined,
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 20,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getUser(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updateUser(req.params.id, req.body, req.user!.id);
    res.json({ success: true, data: { user: data } });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.deleteUser(req.params.id, req.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listPlans(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listPlanConfigs();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updatePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updatePlanConfig(req.params.key as Plan, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listSubscriptions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listSubscriptions({
      q: req.query.q as string | undefined,
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 20,
      status: req.query.status as SubscriptionStatus | undefined,
      plan: req.query.plan as Plan | undefined,
      userId: req.query.userId as string | undefined,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.createSubscription(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updateSubscription(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.deleteSubscription(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listTemplates(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listTemplates({ includeInactive: true });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.createTemplate(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updateTemplate(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.deleteTemplate(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listMenus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listAllMenus({
      q: req.query.q as string | undefined,
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 20,
      published: req.query.published as boolean | undefined,
      ownerId: req.query.ownerId as string | undefined,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getMenuAdmin(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updateMenuAdmin(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.deleteMenuAdmin(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSiteSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getSiteSettings();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateSiteSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updateSiteSettings(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
