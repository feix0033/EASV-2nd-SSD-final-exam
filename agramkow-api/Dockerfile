# Build stage for Agramkow API
FROM node:25.5.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:25.5.0-alpine
WORKDIR /app
COPY package*.json ./

# Fix CVE-2026-24842 by replacing npm's bundled tar with the patched version
RUN npm install -g tar@7.5.7 && \
    rm -rf /usr/local/lib/node_modules/npm/node_modules/tar && \
    cp -r /usr/local/lib/node_modules/tar /usr/local/lib/node_modules/npm/node_modules/

RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]