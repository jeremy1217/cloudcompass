# Use Node.js LTS as base image
FROM node:16-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build client-side application
WORKDIR /usr/src/app/client
COPY client/package*.json ./
RUN npm install
RUN npm run build

# Move back to main directory
WORKDIR /usr/src/app

# Set environment variables
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]