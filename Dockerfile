# Stage 1: Build
FROM oven/bun:alpine AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

ARG PUBLIC_ENV
ENV PUBLIC_ENV=$PUBLIC_ENV

COPY . .
RUN bun run build

# Stage 2: Serve
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
