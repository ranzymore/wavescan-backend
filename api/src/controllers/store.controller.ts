import { Request, Response } from "express";
import * as storeService from "../services/store.service.js";

export async function createStore(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const store = await storeService.createStore(req.userId!, name);
    res.status(201).json(store);
  } catch (err: any) {
    console.error("createStore error:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
}

export async function getStores(req: Request, res: Response) {
  try {
    const stores = await storeService.getStores(req.userId!);
    res.json(stores);
  } catch (err: any) {
    console.error("getStores error:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
}

export async function getStore(req: Request, res: Response) {
  try {
    const store = await storeService.getStore(req.userId!, req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json(store);
  } catch (err: any) {
    console.error("getStore error:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
}

export async function updateStore(req: Request, res: Response) {
  try {
    const store = await storeService.updateStore(
      req.userId!,
      req.params.id,
      req.body
    );
    res.json(store);
  } catch (err: any) {
    console.error("updateStore error:", err);
    res.status(403).json({ error: err.message || "Not authorized" });
  }
}

export async function deleteStore(req: Request, res: Response) {
  try {
    await storeService.deleteStore(req.userId!, req.params.id);
    res.json({ message: "Store deleted successfully" });
  } catch (err: any) {
    console.error("deleteStore error:", err);
    res.status(403).json({ error: err.message || "Not authorized" });
  }
}
