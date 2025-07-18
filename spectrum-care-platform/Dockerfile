# SpectrumCare Enterprise Platform - Production Dockerfile
# Multi-stage build for optimal security and performance

# ============================================================================
# BUILD STAGE
# ============================================================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Install Bun (faster package manager)
RUN npm install -g bun

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Remove dev dependencies
RUN bun install --frozen-lockfile --production=true

# ============================================================================
# PRODUCTION STAGE
# ============================================================================
FROM node:20-alpine AS production

# Install security updates and runtime dependencies
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S spectrum && \
    adduser -S spectrum -u 1001 -G spectrum

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=spectrum:spectrum /app/package.json ./
COPY --from=builder --chown=spectrum:spectrum /app/bun.lockb ./
COPY --from=builder --chown=spectrum:spectrum /app/node_modules ./node_modules
COPY --from=builder --chown=spectrum:spectrum /app/.next ./.next
COPY --from=builder --chown=spectrum:spectrum /app/public ./public
COPY --from=builder --chown=spectrum:spectrum /app/src ./src

# Install Bun in production image
RUN npm install -g bun

# Create directories for uploads and logs
RUN mkdir -p /app/uploads /app/logs && \
    chown -R spectrum:spectrum /app/uploads /app/logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security hardening
RUN chmod -R 755 /app && \
    chmod -R 700 /app/uploads && \
    chmod -R 700 /app/logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER spectrum

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["bun", "start"]

# ============================================================================
# DEVELOPMENT STAGE (optional)
# ============================================================================
FROM node:20-alpine AS development

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev

# Install Bun
RUN npm install -g bun

# Copy package files
COPY package.json bun.lockb ./

# Install all dependencies (including dev)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Set development environment
ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Expose port and debug port
EXPOSE 3000 9229

# Start development server with hot reload
CMD ["bun", "run", "dev"]

# ============================================================================
# METADATA
# ============================================================================
LABEL maintainer="SpectrumCare Platform Team"
LABEL version="1.0.0"
LABEL description="Enterprise LA Management System for SEND Services"
LABEL org.opencontainers.image.title="SpectrumCare Enterprise Platform"
LABEL org.opencontainers.image.description="Multi-tenant SEND case management system"
LABEL org.opencontainers.image.vendor="SpectrumCare Ltd"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.created="2025-01-01"
LABEL org.opencontainers.image.source="https://github.com/spectrumcare/platform"
LABEL org.opencontainers.image.licenses="Proprietary"
