# ============================================
# Build Stage - Compile TypeScript
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy only dependency files
COPY notification-service/package*.json ./

# Install all dependencies (including dev for build tools)
RUN npm ci

# Copy source code and config
COPY notification-service/src ./src
COPY notification-service/tsconfig.json ./
COPY notification-service/eslint.config.mjs ./
COPY notification-service/nodemon.json ./

# Copy proto files to the correct location app expects
COPY proto-shared/src/main/proto /proto-shared/src/main/proto

# Build TypeScript to JavaScript
RUN npm run build

# Copy non-TS static assets (templates, views, public...) into dist so runtime can read them
RUN if [ -d src/templates ]; then cp -r src/templates dist/templates; fi

# ============================================
# Production Stage - Runtime Only
# ============================================
FROM node:22-alpine

WORKDIR /app

# Copy only production dependency files
COPY notification-service/package*.json ./

# Install only production dependencies (no dev dependencies)
RUN npm install --omit=dev && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/*

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /proto-shared /proto-shared

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create logs directory and set permissions
RUN mkdir -p logs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start application
CMD ["node", "dist/index.js"]
