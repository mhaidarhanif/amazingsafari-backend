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
        return c.json({ message: "Cannot login because user not found" }, 400);
      }

      if (!foundUser?.password?.hash) {
        return c.json(
          { message: "Cannot login because user doesn't have a password" },
          400
        );
      }

      const validPassword = await verifyPassword(
        foundUser.password.hash,
        body.password
      );

      if (!validPassword) {
        return c.json({ message: "Password incorrect" }, 400);
      }

      const token = await createToken(foundUser.id);

      if (!token) {
        return c.json({ message: "Authentication failed to process" }, 400);
      }

      setCookie(c, "token", token);

      return c.json({
        message: "Login successful",
        token,
      });
    }
  )

  .get("/me", checkUserToken, async (c) => {
    const user = c.get("user");

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    });

    return c.json({
      message: "User data",
      user: userData,
    });
  })

  .get("/logout", checkUserToken, async (c) => {
    // Note: might be unnecessary since this is token-based auth
    // We can just remove the token on the client or frontend
    return c.json({
      message: "Logout",
    });
  });
