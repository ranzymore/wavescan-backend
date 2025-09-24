import { Request, Response } from "express";
import { prisma } from "../utils/db.js";
import QRCode from "qrcode";

const baseUrl = process.env.FRONTEND_URL;

export const generateMenuQr = async (req: Request, res: Response) => {
  const storeId = req.storeId as string;
  const url = `${baseUrl}/menu/${storeId}`; // link to frontend

  try {
    const qr = await QRCode.toDataURL(url);
    res.json({ qrCode: qr, url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMenu = async (req: Request, res: Response) => {
  const storeId = req.storeId;
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { categories: { include: { products: true } } },
  });

  if (!store) return res.status(404).json({ error: "Menu not found" });
  res.json(store);
};
