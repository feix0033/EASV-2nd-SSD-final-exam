# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Expose application port
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Run the application
CMD ["node", "dist/main.js"]
