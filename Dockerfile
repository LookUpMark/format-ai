# Multi-stage build for FormatAI application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Clean up dev dependencies
RUN npm prune --production

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S formatai -u 1001

# Set proper permissions
RUN chown -R formatai:nodejs /usr/share/nginx/html && \
    chown -R formatai:nodejs /var/cache/nginx && \
    chown -R formatai:nodejs /var/log/nginx && \
    chown -R formatai:nodejs /etc/nginx/conf.d

# Keep nginx running as root but drop privileges in worker processes
# This is the recommended approach for Docker containers

# Expose port 5175
EXPOSE 5175

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5175/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]