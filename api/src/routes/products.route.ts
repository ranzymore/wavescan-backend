import { Router } from "express";
import { createProduct } from "../controllers/products.controller.js";

const router = Router();

router.post("/", createProduct);
// router.get("/", getCategories);
// router.get("/:id", getCategory);
// router.put("/:id", updateCategory);
// router.delete("/:id", deleteCategory);

export default router;
