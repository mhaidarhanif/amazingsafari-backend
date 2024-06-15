import { Hono } from "hono";
import { cors } from "hono/cors";

import { prisma } from "./libs/db";

const app = new Hono();

app.use("/*", cors());

app.get("/", (c) => {
  return c.json({
    message: "Amazing Safari Backend API",
    products: "/products",
  });
});

app.get("/products", async (c) => {
  const products = await prisma.product.findMany();

  return c.json(products);
});

export default app;
