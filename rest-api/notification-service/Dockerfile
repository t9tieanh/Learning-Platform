# Stage 1: Build
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS prod
WORKDIR /app
COPY --from=base /app/package*.json ./
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/wait-for-it.sh ./wait-for-it.sh
RUN chmod +x wait-for-it.sh
EXPOSE 3000
CMD ["./wait-for-it.sh", "rabbitmq", "5672", "--", "npm", "start"]
