##################################
# Stage 1: Build the application #
##################################
FROM node:24.7.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/auth-service/package*.json ./apps/auth-service/
RUN npm install

COPY apps/auth-service ./apps/auth-service
RUN npm run prisma:generate --workspace apps/auth-service
RUN npm run build

##################################
# Stage 2: Run the application   #
##################################
FROM node:24.7.0-alpine as runner

WORKDIR /app
COPY package*.json ./
COPY apps/auth-service/package*.json ./apps/auth-service/
COPY packages ./packages

WORKDIR /app/apps/auth-service
RUN npm install --omit=dev && npm cache clean --force

WORKDIR /app
COPY --from=builder /app/apps/auth-service/dist ./apps/auth-service/dist
COPY --from=builder /app/node_modules/@prisma/client/auth-service ./node_modules/@prisma/client/auth-service
COPY --from=builder /app/apps/auth-service/prisma ./apps/auth-service/prisma
COPY --from=builder /app/packages ./packages

ENV DATABASE_URL="postgresql://taskuser:taskpass@postgres:5432/taskdb?schema=auth"
ENV NODE_ENV="Local"
ENV APP_VERSION="1.0.0"
ENV HTTP_PORT=4000
ENV GRPC_PORT=5000
ENV JWT_SECRET="your_jwt_secret_key"
ENV ACCESS_TOKEN_EXPIRES_IN="15m"
ENV REFRESH_TOKEN_EXPIRES_IN="7d"
ENV REDIS_HOST="redis"
ENV REDIS_PORT=6379

WORKDIR /app/apps/auth-service
EXPOSE 4000
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
