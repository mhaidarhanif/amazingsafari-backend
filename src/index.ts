import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";

import { prisma } from "./libs/db";
import { z } from "zod";
import { hashPassword } from "./libs/password";

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

app.get("/users", async (c) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
    },
  });

  return c.json(users);
});

app.get("/users/:username", async (c) => {
  const username = c.req.param("username");

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    c.status(404);
    c.json({ message: "User not found" });
  }

  return c.json(user);
});

app.post(
  "/auth/register",
  zValidator(
    "json",
    z.object({
      username: z.string(),
      email: z.string(),
      password: z.string(),
    })
  ),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const newUser = await prisma.user.create({
        data: {
          username: body.username,
          email: body.email,
          password: {
            create: {
              hash: await hashPassword(body.password),
            },
          },
        },
      });

      return c.json({
        message: "New user has been registered",
        newUser: {
          username: newUser.username,
        },
      });
    } catch (error) {
      c.status(400);
      return c.json({ message: "Cannot register user." });
    }
  }
);

app.post(
  "/auth/login",
  zValidator(
    "json",
    z.object({
      username: z.string(),
      password: z.string(),
    })
  ),
  async (c) => {
    const body = c.req.valid("json");

    const foundUser = prisma.user.findUnique({
      where: { username: body.username },
    });

    return c.json(foundUser);
  }
);

app.get("/auth/me", async (c) => {
  return c.json({ message: "User data" });
});

export default app;
