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

    const hashedPassword = await hashPassword(password);

    // Use transaction for atomic operations
    const [user, store] = await prisma.$transaction(async (tx) => {
      // Step 1: create user
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      });

      // Step 2: create store + membership
      const createdStore = await tx.store.create({
        data: {
          name: storeName,
          userId: createdUser.id,
          memberships: {
            create: {
              role: "owner",
              status: "active",
              userId: createdUser.id,
            },
          },
        },
        include: {
          memberships: true,
        },
      });

      return [createdUser, createdStore];
    });

    // Remove password before sending response
    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      message: "Registration successful",
      user: safeUser,
      store,
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
        members: { select: { role: true } },
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

    return res.json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
