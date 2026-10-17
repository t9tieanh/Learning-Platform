# Sale Service
- Phạm Tiến Anh

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)
![VNPAY](https://img.shields.io/badge/VNPAY-0066CC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

## Requirements

- Node.js >= 18.x
- PostgreSQL
- RabbitMQ
- Elasticsearch
- npm (or yarn)

## Installation

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Start the supporting services**  
   (PostgreSQL, RabbitMQ, Elasticsearch, Redis)  
   ```sh
   docker compose up -d
   ```

## Database setup & data seeding

Run the following commands to create the tables, seed data, and sync data asynchronously:

```sh
npx prisma generate
npx prisma migrate reset --force
npm run seed
npm run async-data
```

## Running the server in development

```sh
npm run dev
```

The server runs on the default port (e.g. `http://localhost:4000`).

## Main endpoints

- `GET /products` — Get the product list (paginated)
- `GET /products/search` — Search products by query

## Notes

- Make sure the supporting services are running before starting the server.
- If you hit connection errors, double-check your `.env` configuration.

---
