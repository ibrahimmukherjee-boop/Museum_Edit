# Build SPA
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Art is committed in public/art — skip local-only sync on server builds
RUN npx vite build

# Production API + static
FROM node:22-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm ci
COPY --from=build /app/dist ./dist
COPY scripts ./scripts
COPY src ./src
COPY public ./public
ENV NODE_ENV=production
ENV PORT=8080
ENV OLLAMA_BASE_URL=http://ollama:11434
ENV OLLAMA_MODEL=leonardo-museum
ENV OLLAMA_BASE_MODEL=qwen2.5:0.5b
ENV USE_OLLAMA=1
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8080/api/health || exit 1
CMD ["npx", "tsx", "scripts/railway-server.ts"]
