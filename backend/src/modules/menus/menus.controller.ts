import type { Request, Response, NextFunction } from "express";
import * as menusService from "./menus.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await menusService.listMenus(req.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await menusService.createMenu(req.user!.id, req.user!.plan, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await menusService.getMenuForOwner(req.params.id, req.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function replace(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await menusService.replaceMenu(req.params.id, req.user!.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function patch(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await menusService.patchMenu(req.params.id, req.user!.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await menusService.deleteMenu(req.params.id, req.user!.id);
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
}
