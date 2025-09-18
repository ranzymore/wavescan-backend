// src/routes/auth.ts
import express from "express";
import { prisma } from "../utils/db.js";
import { loginSchema, registerSchema } from "../schema/auth.js";
import { generateToken, hashPassword, verifyPassword } from "../utils/jwt.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const { email, password, firstName, lastName, storeName } = parsed.data;

  try {
    // Prevent duplicate users
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    const hashed = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashed,
          firstName,
          lastName,
        },
      });

      const store = await tx.store.create({
        data: {
          name: storeName,
        },
      });

      const membership = await tx.membership.create({
        data: {
          role: "OWNER",
          userId: user.id,
          storeId: store.id,
        },
      });

      return { user, store, membership };
    });

    const safeUser = {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      createdAt: result.user.createdAt,
    };

    return res.status(201).json({
      message: "Registration successful",
      user: safeUser,
      store: result.store,
      membership: { id: result.membership.id, role: result.membership.role },
    });
  } catch (err: any) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: { include: { store: true } },
      },
    });

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await verifyPassword(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken({ userId: user.id, email: user.email });

    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };

    const stores = user.memberships.map((m) => ({
      membershipId: m.id,
      role: m.role,
      store: { id: m.store.id, name: m.store.name },
    }));

    return res.json({
      message: "Login successful",
      token,
      user: safeUser,
      stores,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
