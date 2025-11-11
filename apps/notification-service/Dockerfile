##################################
# Stage 1: Build the application #
##################################
FROM node:24.7.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/notification-service/package*.json ./apps/notification-service/
RUN npm install

COPY apps/notification-service ./apps/notification-service
RUN npm run build

##################################
# Stage 2: Run the application   #
##################################
FROM node:24.7.0-alpine as runner
RUN apk add --no-cache \
    curl

WORKDIR /app
COPY package*.json ./
COPY apps/notification-service/package*.json ./apps/notification-service/
COPY packages ./packages

WORKDIR /app/apps/notification-service
RUN npm install --omit=dev && npm cache clean --force

WORKDIR /app
COPY --from=builder /app/apps/notification-service/dist ./apps/notification-service/dist
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/notification-service
EXPOSE ${HTTP_PORT}
CMD ["sh", "-c", "node dist/main"]
