// src/schema/auth.ts
import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../swagger.js";

// Extend Zod with OpenAPI capabilities
extendZodWithOpenApi(z);

// =======================
// Schemas
// =======================
export const registerSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(6).openapi({ example: "secret123" }),
  firstName: z.string().min(1).openapi({ example: "John" }),
  lastName: z.string().min(1).openapi({ example: "Doe" }),
  storeName: z.string().min(1).openapi({ example: "My Shop" }),
});

export const loginSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(6).openapi({ example: "secret123" }),
});

// Response schemas
export const UserResponseSchema = z.object({
  id: z.string().openapi({ example: "cuid_123" }),
  email: z.string().email().openapi({ example: "user@example.com" }),
  firstName: z.string().openapi({ example: "John" }),
  lastName: z.string().openapi({ example: "Doe" }),
  createdAt: z.string().datetime().openapi({ example: "2025-09-19T12:00:00Z" }),
});

export const StoreResponseSchema = z.object({
  id: z.string().openapi({ example: "store_123" }),
  name: z.string().openapi({ example: "My Shop" }),
});

export const MembershipResponseSchema = z.object({
  id: z.string().openapi({ example: "membership_123" }),
  role: z.string().openapi({ example: "OWNER" }),
});

// =======================
// Register API paths
// =======================

// Register endpoint
registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  description: "Register a new user and store",
  summary: "Register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Registration successful",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            user: UserResponseSchema,
            store: StoreResponseSchema,
            membership: MembershipResponseSchema,
          }),
        },
      },
    },
    400: {
      description: "Validation error or duplicate email",
    },
    500: {
      description: "Internal server error",
    },
  },
  tags: ["Auth"],
});

// Login endpoint
registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  description: "Login with email and password",
  summary: "Login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            token: z.string(),
            user: UserResponseSchema,
            stores: z.array(
              z.object({
                membershipId: z.string(),
                role: z.string(),
                store: StoreResponseSchema,
              })
            ),
          }),
        },
      },
    },
    400: {
      description: "Invalid credentials or validation error",
    },
    500: {
      description: "Internal server error",
    },
  },
  tags: ["Auth"],
});
