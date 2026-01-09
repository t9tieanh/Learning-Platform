# ============================================
# Build Stage - Compile Java
# ============================================
FROM maven:3.9-eclipse-temurin-21 AS builder

# Install required system dependencies for protoc
RUN apt-get update && apt-get install -y --no-install-recommends \
    protobuf-compiler \
    libprotobuf-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy entire parent structure (includes pom.xml, proto-shared, user-service, etc.)
COPY . .

# Step 1: Install parent POM first
RUN mvn install -N -DskipTests

# Step 2: Build proto-shared
RUN cd proto-shared && mvn clean install -DskipTests

# Step 3: Build user-service
RUN cd user-service && mvn clean package -DskipTests

# ============================================
# Production Stage - Runtime Only
# ============================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy built JAR from builder
COPY --from=builder /build/user-service/target/*.jar app.jar

# Copy proto files (if needed)
COPY --from=builder /build/proto-shared /proto-shared

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

USER appuser

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081/actuator/health || exit 1

# Start application
ENTRYPOINT ["java", "-jar", "app.jar"]
