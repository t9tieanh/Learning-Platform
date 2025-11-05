# Sale Service
- Phạm Tiến Anh

## Công nghệ sử dụng

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)
![VNPAY](https://img.shields.io/badge/VNPAY-0066CC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

## Yêu cầu hệ thống

- Node.js >= 18.x
- PostgreSQL
- RabbitMQ
- Elasticsearch
- npm (hoặc yarn)

## Cài đặt

1. **Cài đặt dependencies:**
   ```sh
   npm install
   ```

2. **Khởi động các service phụ trợ**  
   (PostgreSQL, RabbitMQ, Elasticsearch, Redis)  
   ```sh
   docker compose up -d
   ```

## Khởi tạo database & seed dữ liệu

Chạy các lệnh sau để tạo bảng, seed dữ liệu và đồng bộ dữ liệu async:

```sh
npx prisma generate
npx prisma migrate reset --force
npm run seed
npm run async-data
```

## Chạy server ở môi trường phát triển

```sh
npm run dev
```

Server sẽ chạy ở cổng mặc định (ví dụ: `http://localhost:4000`).

## Các endpoint chính

- `GET /products` — Lấy danh sách sản phẩm (có phân trang)
- `GET /products/search` — Tìm kiếm sản phẩm theo query

## Ghi chú

- Đảm bảo các service phụ trợ đã chạy trước khi khởi động server.
- Nếu gặp lỗi kết nối, kiểm tra lại cấu hình `.env`.

---