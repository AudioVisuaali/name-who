FROM node:16-slim@sha256:e41a70d089deb43717a834c5c966842dab760e56257bfe391f3f161ce5b28c52 AS base
WORKDIR /app

FROM base AS pruner
COPY ./package.json .
COPY ./package-lock.json .

FROM base AS dev-deps
COPY --from=pruner /app/ .
RUN npm ci

FROM base AS prod-deps
COPY --from=pruner /app/ ./prod-deps/
RUN cd ./prod-deps/ && npm ci --only=production

FROM base AS builder
COPY --from=pruner /app/ .
COPY --from=dev-deps /app/node_modules/ ./node_modules/
COPY ./app/ ./app
COPY ./tsconfig.json ./tsconfig.json
RUN npm run build

FROM node:16-slim@sha256:e41a70d089deb43717a834c5c966842dab760e56257bfe391f3f161ce5b28c52 as release
WORKDIR /home/node

COPY --chown=node:node --from=builder /app/build/app ./
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=prod-deps /app/prod-deps/node_modules ./node_modules
RUN ["rm", "-rf", "/app"]
USER node

CMD [ "node", "./index.js" ]

