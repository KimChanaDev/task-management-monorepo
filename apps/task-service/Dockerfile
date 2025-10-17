##################################
# Stage 1: Build the application #
##################################
FROM node:24.7.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/task-service/package*.json ./apps/task-service/
RUN npm install

COPY apps/task-service ./apps/task-service
RUN npm run prisma:generate --workspace apps/task-service
RUN npm run build

##################################
# Stage 2: Run the application   #
##################################
FROM node:24.7.0-alpine as runner
RUN apk add --no-cache \
    curl

WORKDIR /app
COPY package*.json ./
COPY apps/task-service/package*.json ./apps/task-service/
COPY packages ./packages

WORKDIR /app/apps/task-service
RUN npm install --omit=dev && npm cache clean --force

WORKDIR /app
COPY --from=builder /app/apps/task-service/dist ./apps/task-service/dist
COPY --from=builder /app/node_modules/@prisma/client/task-service ./node_modules/@prisma/client/task-service
COPY --from=builder /app/apps/task-service/prisma ./apps/task-service/prisma
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/task-service
EXPOSE ${HTTP_PORT}
EXPOSE ${GRPC_PORT}
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
