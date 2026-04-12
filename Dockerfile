# Stage 1 — Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────

# Stage 2 — Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
RUN pnpm build

# ─────────────────────────────────────────

# Stage 3 — Runner (production image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend ./frontend
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/config ./config

EXPOSE 3000

CMD ["node", "server.js"]