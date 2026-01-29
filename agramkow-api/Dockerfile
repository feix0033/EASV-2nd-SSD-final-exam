# Build stage for Agramkow API
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Update vulnerable npm dependencies to specific secure versions
RUN npm install brace-expansion@2.0.2 cross-spawn@7.0.5 diff@5.2.2 glob@10.5.0

# Copy application source
COPY . .

# Build the application
RUN npm run build


# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Update vulnerable global npm packages in the base image to specific secure versions
RUN npm install -g npm@10.8.3 && \
    npm install -g brace-expansion@2.0.2 && \
    npm install -g cross-spawn@7.0.5 && \
    npm install -g diff@5.2.2 && \
    npm install -g glob@10.5.0 && \
    npm install -g tar@7.5.7

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