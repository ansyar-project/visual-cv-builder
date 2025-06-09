# ---- Base Node image ----
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Install OS dependencies for Puppeteer (PDF generation)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Set environment variable for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# ---- Install dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# ---- Build app ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm build

# ---- Production image ----
FROM base AS runner
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built app and node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/next-env.d.ts ./
COPY --from=builder /app/src ./src

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
