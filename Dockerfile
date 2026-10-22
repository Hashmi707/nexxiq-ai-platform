# ============================================================
# Dockerfile — NexxIQ AI Platform (nexxiqai.com)
# Production Container Image
# ============================================================

FROM node:20-alpine AS base

# Install curl for container healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Install dependencies with production optimizations
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy application source & static assets
COPY config/ ./config/
COPY src/ ./src/
COPY public/ ./public/
COPY data/ ./data/
COPY knowledge/ ./knowledge/
COPY scripts/ ./scripts/

# Ensure directory permissions for non-root execution
RUN mkdir -p /app/logs /app/data /app/private && \
    chown -R node:node /app

# Switch to non-root user for security compliance
USER node

# Production environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "src/server.js"]
