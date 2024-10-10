import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { swaggerUI } from "@hono/swagger-ui";

import { ProcessEnv } from "./env";
import { rootRoute } from "./routes/root";
import { productsRoute } from "./routes/products";
import { usersRoute } from "./routes/users";
import { authRoute } from "./routes/auth";
import { cartRoute } from "./routes/cart";
import { configDocs, configGeneral } from "./configs/app";
import { apiReference } from "@scalar/hono-api-reference";
import { Welcome } from "./routes/welcome";

const app = new OpenAPIHono();

// Configure Middlewares
app.use("*", logger()).use("*", cors());

// Configure API Routes
const apiRoutes = app
  .basePath("/")
  .route("/", rootRoute)
  .route("/products", productsRoute)
  .route("/users", usersRoute)
  .route("/auth", authRoute)
  .route("/cart", cartRoute);

apiRoutes
  .doc(configDocs.openapi, {
    openapi: "3.1.0",
    info: { ...configGeneral, version: "v1" },
  })
  .get("/welcome", (c) => c.html(<Welcome />))
  .get(configDocs.swagger, swaggerUI({ url: "/openapi.json" }))
  .get(configDocs.docs, apiReference({ spec: { url: "/openapi.json" } }))
  .onError((err, c) => {
    return c.json({ code: 500, status: "error", message: err.message }, 500);
  });

console.info(`🐾 Amazing Safari Backend API

💽 DATABASE_URL: ${ProcessEnv.DATABASE_URL}
`);

export default app;

export type ApiRoutes = typeof apiRoutes;
