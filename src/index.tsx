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

const app = new OpenAPIHono();

// Configure API Routes
const apiRoutes = app
  .use("*", logger())
  .use("*", cors())
  .basePath("/")
  .route("/", rootRoute)
  .route("/products", productsRoute)
  .route("/users", usersRoute)
  .route("/auth", authRoute)
  .route("/cart", cartRoute)
  .onError((err, c) => {
    return c.json({ code: 500, status: "error", message: err.message }, 500);
  });

// Configure Plugins
app
  .doc(configDocs.openapi, {
    openapi: "3.1.0",
    info: { ...configGeneral, version: "v1" },
  })
  .get(configDocs.swagger, swaggerUI({ url: "/openapi.json" }))
  .get(configDocs.docs, apiReference({ spec: { url: "/openapi.json" } }))
  .get("/web", (c) => {
    return c.html(
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Amazing Safari API</title>
          <meta name="description" content="Web API about books" />
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <h1>Amazing Safari API</h1>
        </body>
      </html>
    );
  });

console.info(`🐾 Amazing Safari Backend API

💽 DATABASE_URL: ${ProcessEnv.DATABASE_URL}
`);

export default app;

export type ApiRoutes = typeof apiRoutes;
