import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { setCookie } from "hono/cookie";

import { prisma } from "../libs/db";
import { checkUserToken } from "../middlewares/check-user-token";
import { hashPassword, verifyPassword } from "../libs/password";
import { createToken } from "../libs/token";

export const authRoute = new Hono()
  .post(
    "/register",
    zValidator(
      "json",
      z.object({
        username: z.string().min(4).max(100),
        email: z.string().email(),
        password: z.string().min(8),
      })
    ),
    async (c) => {
      const body = c.req.valid("json");

      try {
        const existingUser = await prisma.user.findUnique({
          where: {
            username: body.username,
            email: body.email,
          },
        });

        if (existingUser) {
          return c.json({ message: "User already exists" }, 400);
        }

        const user = await prisma.user.create({
          data: {
            username: body.username,
            email: body.email,
            password: {
              create: {
                hash: await hashPassword(body.password),
              },
            },
          },
          select: {
            username: true,
          },
        });

        return c.json(user);
      } catch (error) {
        console.error(error);
        return c.json({ message: "Cannot register user" }, 400);
      }
    }
  )

  .post(
    "/login",
    zValidator(
      "json",
      z.object({
        username: z.string().min(4).max(100),
        password: z.string().min(8),
      })
    ),

    async (c) => {
      const body = c.req.valid("json");

      const user = await prisma.user.findUnique({
        where: { username: body.username },
        include: { password: { select: { hash: true } } },
      });

      if (!user) {
        return c.json({ message: "Cannot login because user not found" }, 400);
      }

      if (!user?.password?.hash) {
        return c.json(
          { message: "Cannot login because user doesn't have a password" },
          400
        );
      }

      const validPassword = await verifyPassword(
        user.password.hash,
        body.password
      );

      if (!validPassword) {
        return c.json({ message: "Password incorrect" }, 400);
      }

      const token = await createToken(user.id);

      if (!token) {
        return c.json({ message: "Authentication failed to process" }, 400);
      }

      // Response Header: Set-Cookie: "..."
      setCookie(c, "token", token);

      // Response Body: { token: "..." }
      return c.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    }
  )

  .get("/me", checkUserToken, async (c) => {
    const user = c.get("user");

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        carts: {
          include: {
            _count: {
              select: { items: true },
            },
          },
        },
        // _count: {
        //   select: { carts: true },
        // },
      },
    });

    return c.json(userData);
  })

  .get("/logout", checkUserToken, async (c) => {
    // Note: might be unnecessary since this is token-based auth
    // We can just remove the token on the client or frontend
    return c.json({
      message: "Logout",
    });
  });
