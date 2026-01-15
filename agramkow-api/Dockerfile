# Build stage for Agramkow API
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy application source
COPY . .

# Build the application
RUN npm run build


# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Run the application
CMD ["node", "dist/main.js"]
