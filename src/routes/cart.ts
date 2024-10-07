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

      // QUERY
      const existingCart = await prisma.cart.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });

      if (!existingCart) {
        return c.json({ message: "Shopping cart is unavailable" }, 404);
      }

      const existingItem = existingCart.items.find(
        (item) => item.productId === body.productId
      );

      if (existingItem) {
        // QUERY: Increment the quantity of the existing item
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + body.quantity },
        });
      } else {
        // QUERY: If the item does not exist, create a new cart item
        await prisma.cartItem.create({
          data: {
            cartId: existingCart.id,
            productId: body.productId,
            quantity: body.quantity,
          },
        });
      }

      // QUERY
      const updatedCart = await prisma.cart.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });

      return c.json(updatedCart);
    }
  );
