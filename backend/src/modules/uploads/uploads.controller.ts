import type { NextFunction, Request, Response } from "express";
import * as uploadsService from "./uploads.service";

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        error: { code: "FILE_REQUIRED", message: "A file field named 'file' is required" },
      });
      return;
    }
    const data = await uploadsService.saveUpload(req.user!.id, file);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
