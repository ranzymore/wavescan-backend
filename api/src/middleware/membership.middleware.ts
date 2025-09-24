// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../utils/db.js";

export async function membershipMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Ensure user is a member of this store
  const storeId = req.storeId as string;
  const member = await prisma.membership.findUnique({
    where: { userId_storeId: { userId: req.userId!, storeId } },
  });

  if (!member) {
    return res.status(403).json({ message: "Not authorized for this store" });
  }

  return next();
}
