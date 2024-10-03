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

Setup database:

```sh
# Run database only
docker compose -f docker-compose.dev.yaml up -d

docker compose up -d
```

To install dependencies:

```sh
bun install
```

Migrate database:

```sh
bun db:migrate:dev
```

Seed initial products:

```sh
bun db:seed
```

To run:

```sh
bun dev
```

Open <http://localhost:3000>

## Prisma Setup

warn You already have a .gitignore file. Don't forget to add `.env` in it to not commit any private information.

Next steps:

1. Set the `DATABASE_URL` in the `.env` file to point to your existing database. If your database has no tables yet, read <https://pris.ly/d/getting-started>
2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
3. Run prisma db pull to turn your database schema into a Prisma schema.
4. Run prisma generate to generate the Prisma Client. You can then start querying your database.
