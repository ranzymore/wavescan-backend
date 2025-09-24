// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import z from "zod";

const storeIdSchema = z.string().cuid(); // ensure it’s a valid cuid

export function storeIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = storeIdSchema.safeParse(req.params.storeId);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid or missing storeId",
      errors: parsed.error.flatten(),
    });
  }

  req.storeId = parsed.data; // assign the validated string
  return next();
}
