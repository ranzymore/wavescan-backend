import { z } from "zod";
import { registry } from "../swagger.js";

const DEFAULT_ERRORS = {
  400: ["Validation error", z.object({ message: z.string() })],
  500: ["Internal server error", z.object({ message: z.string() })],
};

type Method = "get" | "post" | "put" | "patch" | "delete";

type ResponseTuple = [string, z.ZodTypeAny?];
type RequestTuple = [string, z.ZodTypeAny];

interface Options {
  method: Method;
  path: string;
  summary: string;
  description?: string;
  tags?: string[];
  request?: RequestTuple;
  responses: Record<number, ResponseTuple>;
  includeDefaultErrors?: boolean;
  wrapResponse?: boolean; // ✅ optional: wrap schema with { message, data }
}

// ✅ wrap schema under { message, data }
function wrapResponse(msg: string, schema?: z.ZodTypeAny) {
  if (!schema) return z.object({ message: z.string().default(msg) });
  return z.object({
    message: z.string().default(msg),
    data: schema,
  });
}

export function defineEndpoint({
  method,
  path,
  summary,
  description,
  tags = [],
  request,
  responses,
  includeDefaultErrors = true,
  wrapResponse: doWrap = false,
}: Options) {
  const finalResponses = includeDefaultErrors
    ? { ...responses, ...DEFAULT_ERRORS }
    : responses;

  registry.registerPath({
    method,
    path,
    summary,
    description,
    tags,
    request: request && {
      body: {
        description: request[0],
        content: {
          "application/json": {
            schema: request[1],
          },
        },
      },
    },
    responses: Object.fromEntries(
      Object.entries(finalResponses).map(([status, [msg, schema]]) => [
        status,
        {
          description: msg,
          content: {
            "application/json": {
              schema: doWrap ? wrapResponse(msg, schema) : schema,
            },
          },
        },
      ])
    ),
  });
}
