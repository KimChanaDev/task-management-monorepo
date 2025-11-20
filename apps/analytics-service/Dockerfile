##################################
# Stage 1: Build the application #
##################################
FROM node:24.7.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/analytics-service/package*.json ./apps/analytics-service/
RUN npm install

COPY apps/analytics-service ./apps/analytics-service
RUN npm run prisma:generate --workspace apps/analytics-service
RUN npm run build

##################################
# Stage 2: Run the application   #
##################################
FROM node:24.7.0-alpine as runner
RUN apk add --no-cache \
    curl

WORKDIR /app
COPY package*.json ./
COPY apps/analytics-service/package*.json ./apps/analytics-service/
COPY packages ./packages

WORKDIR /app/apps/analytics-service
RUN npm install --omit=dev && npm cache clean --force

WORKDIR /app
COPY --from=builder /app/apps/analytics-service/dist ./apps/analytics-service/dist
COPY --from=builder /app/node_modules/@prisma/client/analytics-service ./node_modules/@prisma/client/analytics-service
COPY --from=builder /app/apps/analytics-service/prisma ./apps/analytics-service/prisma
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/analytics-service
EXPOSE ${HTTP_PORT}
EXPOSE ${GRPC_PORT}
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
