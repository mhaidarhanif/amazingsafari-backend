import { Hono } from "hono";

import { prisma } from "../libs/db";

export const usersRoute = new Hono()
  .get("/", async (c) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });

    return c.json(users);
  })

  .get("/:username", async (c) => {
    const { username } = c.req.param();

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
      c.json({ message: "User not found" }, 404);
    }

    return c.json(user);
  });
