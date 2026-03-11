FROM oven/bun:1-alpine AS builder

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

RUN bun run build

FROM nginx:alpine AS runner-nginx

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
