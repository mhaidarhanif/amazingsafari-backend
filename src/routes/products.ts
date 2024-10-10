import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { prisma } from "../libs/db";
import { ProductSchema } from "../../prisma/generated/zod";

const tags = ["products"];

export const productsRoute = new OpenAPIHono();

productsRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags,
    description: "Get all products",
    responses: {
      200: {
        description: "Get all products response",
        content: { "application/json": { schema: z.array(ProductSchema) } },
      },
    },
  }),
  async (c) => {
    const products = await prisma.product.findMany();

    return c.json(products);
  }
);

productsRoute.openapi(
  createRoute({
    method: "get",
    path: "/:slug",
    tags,
    description: "Get product by slug",
    request: { params: z.object({ slug: z.string() }) },
    responses: {
      200: {
        description: "Get product by slug response",
        content: { "application/json": { schema: ProductSchema } },
      },
      404: {
        description: "Get product by slug not found response",
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.param();

    const product = await prisma.product.findUnique({ where: { slug } });

    if (!product) return c.json({ message: "Product not found" }, 404);

    return c.json(product);
  }
);
