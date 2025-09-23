import { Request, Response } from "express";
import z from "zod";
import * as productService from "../services/product.services.js";
import { prisma } from "../utils/db.js";

const productSchema = z.object({
  name: z.string(),
  price: z.number(),
  categoryId: z.string().cuid().optional(),
});

export const createProduct = async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const { name, price, categoryId } = parsed.data;

  try {
    const member = await prisma.membership.findUnique({
      where: { userId_storeId: { userId: req.userId!, storeId } },
    });

    if (!member) {
      return res.status(403).json({ message: "Not authorized for this store" });
    }

    const existingproduct = await prisma.product.findUnique({
      where: { name_storeId: { name, storeId } },
    });

    if (existingproduct)
      return res.status(403).json({ message: "Product already exist" });

    const product = await prisma.product.create({
      data: {
        name,
        storeId,
        price,
        categoryId,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("create product error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
