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

# Install tar@7.5.7 globally and force npm to update its dependency
RUN npm install -g tar@7.5.7 && \
    npm install -g npm@latest

RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]