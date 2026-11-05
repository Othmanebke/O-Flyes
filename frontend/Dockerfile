# Image de production d'AIVANA (Next.js), en 3 étapes pour une image finale légère.
FROM node:20-alpine AS base
WORKDIR /app

# 1. Dépendances (installées à partir du lockfile, versions exactes)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Les variables NEXT_PUBLIC_* sont intégrées au build : on les passe en argument
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && npm prune --omit=dev

# 3. Exécution (utilisateur non-root)
FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["npm", "start"]
