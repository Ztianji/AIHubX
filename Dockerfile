# Multi-stage build for AIHubX

# Build server
FROM node:18-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Build client
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /app
# copy server build output
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/package*.json ./
# install production deps
RUN npm ci --omit=dev
# copy built client assets into public directory
COPY --from=client-build /app/client/dist ./public
EXPOSE 3000
CMD ["node", "dist/index.js"]
