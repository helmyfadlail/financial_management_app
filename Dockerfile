# ---------- BASE ----------
FROM node:24.11.1-alpine AS base

# ---------- DEPENDENCIES ----------
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- BUILDER ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- RUNNER ----------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 🔑 REQUIRED: postgres client tools
RUN apk add --no-cache postgresql-client

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy app files
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint
COPY --chown=nextjs:nodejs entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start"]
