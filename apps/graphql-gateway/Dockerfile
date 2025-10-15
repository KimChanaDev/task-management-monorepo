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

WORKDIR /app
COPY package*.json ./
COPY apps/graphql-gateway/package*.json ./apps/graphql-gateway/
COPY packages ./packages

WORKDIR /app/apps/graphql-gateway
RUN npm install --omit=dev && npm cache clean --force

WORKDIR /app
COPY --from=builder /app/apps/graphql-gateway/dist ./apps/graphql-gateway/dist
COPY --from=builder /app/packages ./packages

ENV NODE_ENV="Local"
ENV APP_VERSION=1.0.0
ENV HTTP_PORT=4002
ENV AUTH_SECURE_COOKIES=true
ENV AUTH_SERVICE_GRPC_URL=auth-service:5000
ENV TASK_SERVICE_GRPC_URL=task-service:5001
ENV ACCESS_TOKEN_EXPIRES_IN="15m"
ENV REFRESH_TOKEN_EXPIRES_IN="7d"

WORKDIR /app/apps/graphql-gateway
EXPOSE 4002
CMD ["sh", "-c", "node dist/main"]
