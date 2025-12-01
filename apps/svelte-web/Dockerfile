##################################
# Stage 1: Build the application #
##################################
FROM node:24.7.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/svelte-web/package*.json ./apps/svelte-web/
RUN npm install

COPY apps/svelte-web ./apps/svelte-web
WORKDIR /app/apps/svelte-web
RUN npm run build

##################################
# Stage 2: Run the application   #
##################################
FROM node:24.7.0-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app
COPY package*.json ./
COPY apps/svelte-web/package*.json ./apps/svelte-web/
COPY packages ./packages

WORKDIR /app/apps/svelte-web
RUN npm install --omit=dev && npm cache clean --force

WORKDIR /app
COPY --from=builder /app/apps/svelte-web/build ./apps/svelte-web/build
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/svelte-web
EXPOSE ${PORT}
CMD ["node", "build"]
