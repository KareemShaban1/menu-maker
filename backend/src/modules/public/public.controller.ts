import type { Request, Response, NextFunction } from "express";
import * as publicService from "./public.service";

export async function getMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await publicService.getPublishedMenu(req.params.idOrSlug);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listTemplates(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await publicService.listActiveTemplates();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listPlans(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await publicService.listActivePlans();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSiteSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await publicService.getPublicSiteSettings();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
