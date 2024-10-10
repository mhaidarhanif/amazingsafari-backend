import { Hono } from "hono";
import type { FC } from "hono/jsx";

export const Layout: FC = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Amazing Safari API</title>
        <meta name="description" content="Amazing Safari API" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
};

export const Welcome: FC = () => {
  return (
    <Layout>
      <h1>Amazing Safari API</h1>
    </Layout>
  );
};
