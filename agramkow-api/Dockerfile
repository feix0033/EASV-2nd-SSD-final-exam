# Build stage for Agramkow API
FROM node:20.21.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Update npm first
RUN npm install -g npm@latest && \
    npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20.21.0-alpine
WORKDIR /app
COPY package*.json ./
# Update npm in production too
RUN npm install -g npm@latest && \
    npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]