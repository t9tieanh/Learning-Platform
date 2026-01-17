# ============================================
# Build Stage - Compile Java
# ============================================
FROM maven:3.9-eclipse-temurin-21 AS builder

# Install required system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy entire parent structure
COPY . .

# Step 1: Install parent POM first
RUN mvn install -N -DskipTests

# Step 2: Build api-gateway
RUN cd api-gateway && mvn clean package -DskipTests

# ============================================
# Production Stage - Runtime Only
# ============================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy built JAR from builder
COPY --from=builder /build/api-gateway/target/*.jar app.jar

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Start application
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.config.location=optional:classpath:/,file:/app/application.yaml"]
