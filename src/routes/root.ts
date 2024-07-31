import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

export const rootRoute = new Hono()
  .get("/", (c) => {
    return c.json({
      message: "Amazing Safari Backend API",
    });
  })

  .get("/hello", zValidator("query", z.object({ name: z.string() })), (c) => {
    const { name } = c.req.valid("query");

    return c.json({
      message: `Hello, ${name}`,
    });
  });
