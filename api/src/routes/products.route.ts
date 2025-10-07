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
router.get("/:productId", getProduct);
router.put("/:productId", updateProduct);
router.delete("/:productId", deleteProduct);

export default router;
