import { Router } from "express";
import { generateMenuQr, getMenu } from "../controllers/menu.controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";
import { storeIdMiddleware } from "../middleware/store-id.middleware.js";

const router = Router({ mergeParams: true });

router.use(storeIdMiddleware);

router.get("/generate-qrc", authMiddleware, generateMenuQr);
router.get("/", getMenu);

export default router;
