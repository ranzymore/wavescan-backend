import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/products.controller.js";
import { membershipMiddleware } from "../middleware/membership.middleware.js";
import { storeIdMiddleware } from "../middleware/store-id.middleware.js";

const router = Router({ mergeParams: true });
router.use(storeIdMiddleware, membershipMiddleware);

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
