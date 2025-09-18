import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth-middleware.js";

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: ["*"], credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello, from wavescan!" });
});

// Routes
app.use("/api/auth", authRoutes);

// Example protected route
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Hello, Tenant!" });
});

export default app;
