# Multi-stage build for RateMyMelon
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app

# Copy frontend package files
COPY package*.json ./

# Install frontend dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY vite.config.js ./
COPY index.html ./

# Build frontend
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend

# Set working directory
WORKDIR /app

# Install system dependencies
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

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY server/ ./

# Copy built frontend from previous stage
COPY --from=frontend-build /app/dist ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S ratemymelon -u 1001

# Change ownership of the app directory
RUN chown -R ratemymelon:nodejs /app
USER ratemymelon

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]