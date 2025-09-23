import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../utils/db.js";

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  products: z.array(z.string().cuid()).optional(),
});

// Create Category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const storeId = req.params.storeId;
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid fields", error: parsed.error.flatten() });
    }

    const { name, products } = parsed.data;

    // Ensure user is a member of this store
    const member = await prisma.membership.findUnique({
      where: { userId_storeId: { userId: req.userId!, storeId } },
    });
    if (!member) {
      return res.status(403).json({ message: "Not authorized for this store" });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name_storeId: { name, storeId } },
    });

    if (existingCategory)
      return res.status(403).json({ message: "Category already exist" });

    const category = await prisma.category.create({
      data: {
        name,
        storeId,
        products: {
          connect: products?.map((id) => ({ id })),
        },
      },
      include: { products: true },
    });

    res.status(201).json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Categories for a Store
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;

    const categories = await prisma.category.findMany({
      where: { storeId },
      include: { products: true },
    });

    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Category
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update Category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const parsed = categorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid fields", error: parsed.error.flatten() });
    }

    const { name, products } = parsed.data;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        products: products
          ? { set: products.map((id) => ({ id })) } // replace relations
          : undefined,
      },
      include: { products: true },
    });

    res.json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({ where: { id } });

    res.json({ message: "Category deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
