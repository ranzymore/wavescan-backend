// src/schema/auth.ts
import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../swagger.js";
import { defineEndpoint } from "../utils/define-endpoint.js";

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

defineEndpoint({
  method: "post",
  path: "/api/auth/register",
  summary: "Register",
  tags: ["Auth"],
  request: ["Register body", registerSchema],
  responses: {
    201: ["Registration successful", UserResponseSchema],
  },
});

defineEndpoint({
  method: "post",
  path: "/api/auth/login",
  summary: "Login",
  tags: ["Auth"],
  request: ["Login body", loginSchema],
  responses: {
    200: ["Login successful", z.object({ token: z.string() })],
  },
});
