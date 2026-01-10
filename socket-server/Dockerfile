# ============================================
# Build Stage - Compile TypeScript
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY socket-server/package*.json ./
COPY socket-server/tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY socket-server/src ./src

# Build TypeScript
RUN npm run build

# ============================================
# Production Stage - Runtime Only
# ============================================
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY socket-server/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/index.js"]
