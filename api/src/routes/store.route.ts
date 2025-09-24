import { Router } from "express";
import {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
} from "../controllers/store.controller.js";

const router = Router();

router.post("/", createStore);
router.get("/", getStores);
router.get("/:id", getStore);
router.put("/:id", updateStore);
router.delete("/:id", deleteStore);

export default router;
