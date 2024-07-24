import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";

import { prisma } from "./libs/db";
import { z } from "zod";
import { hashPassword, verifyPassword } from "./libs/password";
import { createToken } from "./libs/jwt";
import { checkUserToken } from "./middlewares/check-user-token";

type Bindings = {
  TOKEN: string;
};

type Variables = {
  user: {
    id: string;
  };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("/*", cors());

app.get("/", (c) => {
  return c.json({
    message: "Amazing Safari Backend API",
    products: "/products",
    users: "/users",
    auth: "/auth",
  });
});

app.get("/products", async (c) => {
  const products = await prisma.product.findMany();

  return c.json(products);
});

app.get(
  "/products/:slug",
  zValidator("param", z.object({ slug: z.string() })),
  async (c) => {
    const { slug } = c.req.valid("param");

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    return c.json(product);
  }
);

app.get("/users", async (c) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
    },
  });

  return c.json(users);
});

app.get(
  "/users/:username",
  zValidator("param", z.object({ username: z.string() })),
  async (c) => {
    const { username } = c.req.valid("param");

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
  }
);

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
      include: { password: { select: { hash: true } } },
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

app.get("/auth/me", checkUserToken(), async (c) => {
  const user = c.get("user");

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
  });

  return c.json({
    message: "User data",
    user: userData,
  });
});

app.get("/auth/logout", checkUserToken(), async (c) => {
  // Note: might be unnecessary since this is token-based auth
  // We can just remove the token on the client or frontend
  return c.json({
    message: "Logout",
  });
});

app.get("/cart", checkUserToken(), async (c) => {
  const user = c.get("user");

  const existingOrderCart = await prisma.cart.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!existingOrderCart) {
    const newOrderCart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });
    return c.json({
      message: "Shopping cart data",
      cart: newOrderCart,
    });
  }

  return c.json({
    message: "Shopping cart data",
    cart: existingOrderCart,
  });
});

export default app;
