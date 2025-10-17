##################################
# Stage 1: Build the application #
##################################
FROM node:24.7.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/graphql-gateway/package*.json ./apps/graphql-gateway/
RUN npm install

COPY apps/graphql-gateway ./apps/graphql-gateway
RUN npm run build

##################################
# Stage 2: Run the application   #
##################################
FROM node:24.7.0-alpine as runner
RUN apk add --no-cache \
    curl

WORKDIR /app
COPY package*.json ./
COPY apps/graphql-gateway/package*.json ./apps/graphql-gateway/
COPY packages ./packages

WORKDIR /app/apps/graphql-gateway
RUN npm install --omit=dev && npm cache clean --force

WORKDIR /app
COPY --from=builder /app/apps/graphql-gateway/dist ./apps/graphql-gateway/dist
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/graphql-gateway
EXPOSE ${HTTP_PORT}
CMD ["sh", "-c", "node dist/main"]
