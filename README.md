# Amazing Safari Backend

## REST API Specification

- Production: `https://amazingsafari-backend.haidar.dev`
- Local: `http://localhost:3000`

Products:

| Endpoint        | HTTP     | Description          |
| --------------- | -------- | -------------------- |
| `/products`     | `GET`    | Get all products     |
| `/products/:id` | `GET`    | Get product by id    |
| `/products`     | `POST`   | Add new product      |
| `/products`     | `DELETE` | Delete all products  |
| `/products/:id` | `DELETE` | Delete product by id |
| `/products/:id` | `PUT`    | Update product by id |

Auth:

| Endpoint           | HTTP     | Permission    |
| ------------------ | -------- | ------------- |
| `/users`           | `GET`    | Public        |
| `/users/:username` | `GET`    | Public        |
| `/auth/register`   | `POST`   | Public        |
| `/auth/login`      | `POST`   | Public        |
| `/auth/me`         | `GET`    | Authenticated |
| `/auth/logout`     | `POST`   | Authenticated |
| `/cart`            | `GET`    | Authenticated |
| `/cart/items`      | `POST`   | Authenticated |
| `/cart/items/:id`  | `DELETE` | Authenticated |
| `/cart/items/:id`  | `PUT`    | Authenticated |

## Getting Started

Copy and edit `.env` file:

```sh
cp .env.example .env
```

Setup database:

```sh
# Run database only
docker:up
```

Install dependencies:

```sh
bun install
```

Migrate database and generate Prisma Client:

```sh
bun db:migrate
# prisma migrate dev && prisma generate
```

Seed initial products:

```sh
bun db:seed
# prisma db seed
```

Run development server:

```sh
bun dev
# bun run --hot src/index.ts
```

Open <http://localhost:3000>.

## Production

Make sure the `DATABASE_URL` is configured in `.env` file for usage with Docker Compose.

Build the Docker image:

```sh
bun docker:build
# docker compose up -d --build
```

If only run the Docker container:

```sh
bun docker:up
# docker compose up -d
```

Open <http://localhost:3000>.
