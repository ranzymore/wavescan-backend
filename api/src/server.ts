import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth-middleware.js";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiSpec } from "./swagger.js";

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

const openApiSpec = generateOpenApiSpec();
const isProd = process.env.NODE_ENV === "production";
app.get("/api/docs.json", (req, res) => {
  res.json(openApiSpec);
});

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(isProd ? undefined : openApiSpec, {
    swaggerOptions: isProd ? { url: "/api/docs.json" } : undefined,
  })
);

export default app;
