import type { Request, Response, NextFunction } from "express";
import * as usersService from "./users.service";

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateName(req.user!.id, req.body.name);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function updatePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updatePlan(req.user!.id, req.body.plan);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}
