import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { prisma } from "../libs/db";
import { checkUserToken } from "../middlewares/check-user-token";

export const cartRoute = new Hono()
  .get("/", checkUserToken, async (c) => {
    const user = c.get("user");

    const existingCart = await prisma.cart.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      // include: { items: { include: { product: true } } },
      select: {
        id: true,
        items: {
          include: {
            product: {
              omit: {
                description: true,
                sku: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!existingCart) {
      const newCart = await prisma.cart.create({
        data: { userId: user.id },
        include: { items: { include: { product: true } } },
      });

      return c.json(newCart);
    }

    return c.json(existingCart);
  })

  .post(
    "/items",
    checkUserToken,
    zValidator(
      "json",
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const body = c.req.valid("json");

      const existingCart = await prisma.cart.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (!existingCart) {
        return c.json({ message: "Shopping cart is unavailable" }, 404);
      }

      // FIXME: check existing product item before proceeding

      const updatedCart = await prisma.cart.update({
        where: { id: existingCart.id },
        data: {
          items: {
            create: {
              productId: body.productId,
              quantity: body.quantity,
            },
          },
        },
        select: {
          items: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return c.json(updatedCart);
    }
  );
