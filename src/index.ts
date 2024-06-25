import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";

import { prisma } from "./libs/db";
import { z } from "zod";
import { hashPassword, verifyPassword } from "./libs/password";
import { createToken, validateToken } from "./libs/jwt";

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
        message: "Register new user successful",
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

    const foundUser = await prisma.user.findUnique({
      where: { username: body.username },
      include: {
        password: true,
      },
    });

    if (!foundUser) {
      c.status(404);
      return c.json({ message: "Cannot login because user not found" });
    }

    if (!foundUser?.password?.hash) {
      c.status(400);
      return c.json({
        message: "Cannot login because user doesn't have a password",
      });
    }

    const validPassword = await verifyPassword(
      foundUser.password.hash,
      body.password
    );

    if (!validPassword) {
      c.status(400);
      return c.json({
        message: "Password incorrect",
      });
    }

    const token = await createToken(foundUser.id);

    if (!token) {
      c.status(400);
      return c.json({ message: "Token failed to create" });
    }

    return c.json({
      message: "Login successful",
      token,
    });
  }
);

app.get("/auth/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    c.status(401);
    return c.json({ message: "Not allowed" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    c.status(401);
    return c.json({ message: "Token is required" });
  }

  const decodedToken = await validateToken(token);
  if (!decodedToken) {
    c.status(401);
    return c.json({ message: "Token is invalid" });
  }

  const userId = decodedToken.subject;
  if (!userId) {
    c.status(401);
    return c.json({ message: "User ID doesn't exist" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return c.json({
    message: "User data",
    user,
  });
});

export default app;
