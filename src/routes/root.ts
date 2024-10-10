import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { configApp } from "../configs/app";

const tags = ["root"];

export const rootRoute = new OpenAPIHono();

rootRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags,
    responses: { 200: { description: "Root endpoint response" } },
  }),
  (c) => {
    return c.json({
      ...configApp,
      openapi: "/openapi.json",
      swagger: "/swagger",
      scalar: "/scalar",
      paths: ["/", "/hello", "/products", "/users", "/auth", "/cart"],
    });
  }
);

rootRoute.openapi(
  createRoute({
    method: "get",
    path: "/hello",
    tags,
    request: {
      query: z.object({ name: z.string().optional() }),
    },
    responses: {
      200: {
        description: "Respond a message",
        content: {
          "application/json": { schema: z.object({ message: z.string() }) },
        },
      },
    },
  }),
  (c) => {
    const { name } = c.req.valid("query");
    if (!name) return c.json({ message: `Hello!` });
    return c.json({ message: `Hello, ${name}!` });
  }
);
