# Build stage for Agramkow API
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# First, update npm itself to latest version
RUN npm install -g npm@10.8.3

# Install all dependencies (including dev dependencies)
RUN npm ci

# Update vulnerable npm dependencies to latest secure versions
RUN npm install brace-expansion@latest cross-spawn@latest diff@latest glob@latest

# Copy application source
COPY . .

# Build the application
RUN npm run build


# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# First, update npm to latest version
RUN npm install -g npm@10.8.3

# Update ALL global npm packages to their latest versions
RUN npm update -g

# Specifically update known vulnerable packages to ensure latest versions
RUN npm install -g brace-expansion@latest && \
    npm install -g cross-spawn@latest && \
    npm install -g diff@latest && \
    npm install -g glob@latest && \
    npm install -g tar@latest

# Clean npm cache to reduce image size
RUN npm cache clean --force

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Update project dependencies to latest versions
RUN npm install brace-expansion@latest cross-spawn@latest diff@latest glob@latest tar@latest

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Run the application
CMD ["node", "dist/main.js"]