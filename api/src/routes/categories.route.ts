import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { membershipMiddleware } from "../middleware/membership.middleware.js";
import { storeIdMiddleware } from "../middleware/store-id.middleware.js";

const router = Router({ mergeParams: true });

router.use(storeIdMiddleware, membershipMiddleware);

router.post("/", createCategory);
router.get("/", getCategories);
router.get("/:id", getCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
