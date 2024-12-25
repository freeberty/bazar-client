FROM node:18-slim as base
WORKDIR /app

# Build stage
FROM base as build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

RUN mkdir -p /data && chown -R node:node /data
USER node

# Run in production mode
CMD ["node", "./dist/server/entry.mjs"]