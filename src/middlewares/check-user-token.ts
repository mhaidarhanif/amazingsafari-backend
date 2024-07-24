import { createMiddleware } from "hono/factory";

import { prisma } from "../libs/db";
import { validateToken } from "../libs/jwt";

export const checkUserToken = () => {
  return createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      c.status(401);
      return c.json({
        message: "Not allowed. Authorization header is required",
      });
    }

    // Authorization: Bearer
    // Authorization: ["Bearer", "token"]
    const token = authHeader.split(" ")[1];
    if (!token) {
      c.status(401);
      return c.json({ message: "Not allowed. Token is required" });
    }

    const decodedToken = await validateToken(token);
    if (!decodedToken) {
      c.status(401);
      return c.json({ message: "Not allowed. Token is invalid" });
    }

    const userId = decodedToken.subject;
    if (!userId) {
      c.status(401);
      return c.json({ message: "User ID doesn't exist" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      c.status(404);
      return c.json({ message: "User not found" });
    }

    c.set("user", user);

    await next();
  });
};
