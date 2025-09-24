// src/controllers/product.controller.ts
import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../utils/db.js";

const productSchema = z.object({
  name: z.string(),
  price: z.number(),
  categoryId: z.string().cuid().optional(),
});

// ✅ CREATE
export const createProduct = async (req: Request, res: Response) => {
  const storeId = req.storeId as string;
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const { name, price, categoryId } = parsed.data;

  try {
    const existingproduct = await prisma.product.findUnique({
      where: { name_storeId: { name, storeId } },
    });

    if (existingproduct) {
      return res.status(403).json({ message: "Product already exists" });
    }

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

// ✅ READ ALL
export const getProducts = async (req: Request, res: Response) => {
  const storeId = req.storeId as string;
  try {
    const products = await prisma.product.findMany({
      where: { storeId },
    });
    res.json(products);
  } catch (err) {
    console.error("get products error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ READ ONE
export const getProduct = async (req: Request, res: Response) => {
  const storeId = req.storeId as string;
  const { productId } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id_storeId: { id: productId, storeId } }, // composite key recommended
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("get product error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ UPDATE
export const updateProduct = async (req: Request, res: Response) => {
  const storeId = req.storeId as string;
  const { productId } = req.params;

  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id_storeId: { id: productId, storeId } },
    });

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updated = await prisma.product.update({
      where: { id_storeId: { id: productId, storeId } },
      data: parsed.data,
    });

    res.json(updated);
  } catch (err) {
    console.error("update product error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ DELETE
export const deleteProduct = async (req: Request, res: Response) => {
  const storeId = req.storeId as string;
  const { productId } = req.params;

  try {
    const existing = await prisma.product.findUnique({
      where: { id_storeId: { id: productId, storeId } },
    });

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.delete({
      where: { id_storeId: { id: productId, storeId } },
    });

    res.status(204).send();
  } catch (err) {
    console.error("delete product error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
