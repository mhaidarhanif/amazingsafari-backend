import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";

import { prisma } from "../libs/db";
import { validateToken } from "../libs/token";

type Env = {
  Variables: {
    user: {
      id: string;
    };
  };
};

export const checkUserToken = createMiddleware<Env>(async (c, next) => {
  const tokenCookie = getCookie(c, "token");
  const authHeader = c.req.header("Authorization");

  // Get the token either from cookie or header
  const token = tokenCookie
    ? tokenCookie
    : authHeader
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return c.json({ message: "Not allowed. Token is required" }, 401);
  }

  const decodedToken = await validateToken(token);

  if (!decodedToken) {
    return c.json({ message: "Not allowed. Token is invalid" }, 401);
  }

  const userId = decodedToken.subject;

  if (!userId) {
    return c.json({ message: "User ID doesn't exist" }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  c.set("user", user);

  await next();
});
