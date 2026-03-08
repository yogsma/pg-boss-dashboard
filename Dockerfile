FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS ui-builder
WORKDIR /app/package/ui
COPY package/ui/package*.json ./
RUN npm ci
COPY package/ui/ .
RUN npm run build

FROM base AS api-builder
WORKDIR /app/package/api
COPY package/api/package*.json ./
RUN npm ci
COPY package/api/ .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=ui-builder /app/package/ui/.next /app/package/ui/.next
COPY --from=ui-builder /app/package/ui/public /app/package/ui/public
COPY --from=ui-builder /app/package/ui/package*.json /app/package/ui/
COPY --from=ui-builder /app/package/ui/node_modules /app/package/ui/node_modules

COPY --from=api-builder /app/package/api/dist /app/package/api/dist
COPY --from=api-builder /app/package/api/package*.json /app/package/api/
COPY --from=api-builder /app/package/api/node_modules /app/package/api/node_modules

COPY package*.json ./

RUN npm install -g pm2

COPY ecosystem.config.js ./

USER nodejs

EXPOSE 3000 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/queues || exit 1

CMD ["pm2-runtime", "start", "ecosystem.config.js"]