import { Hono } from "hono";

import { prisma } from "../libs/db";

export const productsRoute = new Hono()
  .get("/", async (c) => {
    const products = await prisma.product.findMany();

    return c.json(products);
  })

  .get("/:slug", async (c) => {
    const { slug } = c.req.param();

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    return c.json(product);
  });
