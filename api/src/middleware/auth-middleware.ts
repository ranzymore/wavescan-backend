// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { JwtPayload } from "jsonwebtoken";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Missing Authorization header" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ error: "Malformed Authorization header" });

    const token = parts[1];
    const decoded = verifyToken(token);
    if (!decoded?.userId)
      return res.status(401).json({ error: "Invalid token payload" });
    console.log(decoded, "decode");

    req.userId = decoded.userId;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
