##################################
# Stage 1: Build the application #
##################################
FROM node:24.7.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/file-service/package*.json ./apps/file-service/
RUN npm install

COPY apps/file-service ./apps/file-service
RUN npm run prisma:generate --workspace apps/file-service
RUN npm run build

##################################
# Stage 2: Run the application   #
##################################
FROM node:24.7.0-alpine as runner
RUN apk add --no-cache \
    curl

WORKDIR /app
COPY package*.json ./
COPY apps/file-service/package*.json ./apps/file-service/
COPY packages ./packages

WORKDIR /app/apps/file-service
RUN npm install --omit=dev && npm cache clean --force

WORKDIR /app
COPY --from=builder /app/apps/file-service/dist ./apps/file-service/dist
COPY --from=builder /app/node_modules/@prisma/client/file-service ./node_modules/@prisma/client/file-service
COPY --from=builder /app/apps/file-service/prisma ./apps/file-service/prisma
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/file-service
EXPOSE ${HTTP_PORT}
EXPOSE ${GRPC_PORT}
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
