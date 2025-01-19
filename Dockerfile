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

EXPOSE 3000 3001

CMD ["pm2-runtime", "start", "ecosystem.config.js"]