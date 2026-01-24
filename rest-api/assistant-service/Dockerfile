# ============================================
# Build Stage - Compile TypeScript
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy only dependency files
COPY sale-service/package*.json ./

# Install all dependencies (including dev for build tools)
RUN npm ci

# Copy source code and config
COPY sale-service/src ./src
COPY sale-service/tsconfig.json ./
COPY sale-service/prisma ./prisma

# Copy proto files to the correct location app expects
COPY proto-shared/src/main/proto /proto-shared/src/main/proto

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

# ============================================
# Production Stage - Runtime Only
# ============================================
FROM node:22-alpine

WORKDIR /app

# Copy only production dependency files
COPY sale-service/package*.json ./

# Install only production dependencies (no dev dependencies)
RUN npm install --omit=dev && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/*

# Copy compiled code and prisma schema from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /proto-shared /proto-shared
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start application
CMD ["node", "dist/index.js"]
