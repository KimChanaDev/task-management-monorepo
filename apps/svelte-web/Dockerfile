##################################
# Stage 1: Build the application #
##################################
FROM node:24.7.0-alpine AS builder

# Define build arguments for environment variables
ARG PORT
ARG GRAPHQL_GATWAY_URL
ARG PUBLIC_GRAPHQL_GATWAY_URL
ARG PUBLIC_NOTIFICATION_WS_URL
ARG PUBLIC_AUTH_SECURE_COOKIES

# Set environment variables from build arguments
ENV PORT=$PORT
ENV GRAPHQL_GATWAY_URL=$GRAPHQL_GATWAY_URL
ENV PUBLIC_GRAPHQL_GATWAY_URL=$PUBLIC_GRAPHQL_GATWAY_URL
ENV PUBLIC_NOTIFICATION_WS_URL=$PUBLIC_NOTIFICATION_WS_URL
ENV PUBLIC_AUTH_SECURE_COOKIES=$PUBLIC_AUTH_SECURE_COOKIES

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
