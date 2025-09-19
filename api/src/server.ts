import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth-middleware.js";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./swagger.js";

const app = express();
app.use(morgan("dev"));
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin || "*"); // allow all origins dynamically
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello, from wavescan!" });
});

// Routes
app.use("/api/auth", authRoutes);

// Example protected route
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Hello, Tenant!" });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

export default app;
