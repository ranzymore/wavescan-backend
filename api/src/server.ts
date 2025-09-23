import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth-middleware.js";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiSpec } from "./swagger.js";
import { Database, Resource, getModelByName } from "@adminjs/prisma";
import AdminJS, { BaseAuthProvider } from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { prisma } from "./utils/db.js";
import categoryRoutes from "./routes/categories.route.js";
import productRoutes from "./routes/products.route.js";

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

AdminJS.registerAdapter({ Database, Resource });

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello, from wavescan!" });
});

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/stores", storeRoutes);
// app.use("/api/memberships", membershipRoutes);
app.use("/api/store/:storeId/categories", categoryRoutes);
app.use("/stores/:storeId/products", productRoutes);

// Example protected route
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Hello, Tenant!" });
});

const admin = new AdminJS({
  resources: [
    {
      resource: { model: getModelByName("User"), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName("Store"), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName("Membership"), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName("Category"), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName("Product"), client: prisma },
      options: {},
    },
  ],
});

const ADMIN = { email: "admin@example.com", password: "password" };

const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (email, password) => {
    if (ADMIN.email === email && ADMIN.password === password) {
      return ADMIN;
    }
    return null;
  },
  cookieName: "cookie",
  cookiePassword: "secrete",
});
app.use(admin.options.rootPath, router);

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
