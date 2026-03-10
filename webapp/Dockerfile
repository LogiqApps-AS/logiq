# Multi-stage Dockerfile for Vite React App with Bun
# Stage 1: Builder - Using Alpine with Bun for minimal size and speed
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies with Bun
RUN bun install

# Copy source code
COPY . .

# Build the application with Bun
RUN bun run build

# Stage 2: Runner - Using nginx:alpine for serving static files (optimized for production)
FROM nginx:alpine AS runner-nginx

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# nginx starts automatically
