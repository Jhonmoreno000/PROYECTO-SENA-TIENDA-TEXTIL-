FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

LABEL org.opencontainers.image.title="D&D Textil Frontend" \
      org.opencontainers.image.description="Interfaz Single Page Application en React 18, Vite y TailwindCSS servida por Nginx" \
      org.opencontainers.image.version="2.0.0" \
      org.opencontainers.image.vendor="D&D Textil - SENA ADSO" \
      org.opencontainers.image.licenses="MIT"

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf
EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1
