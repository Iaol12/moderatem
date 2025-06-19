# Use official Node.js image as the base
FROM node:20-alpine as build-frontend

# Set working directory for frontend build
WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Backend build stage
FROM node:20-alpine as backend

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source
COPY backend/ ./

# Copy built frontend static files into backend
COPY --from=build-frontend /app/frontend/build ./build

# Expose backend port
EXPOSE 4000

# Start backend server
CMD ["node", "server.js"]
