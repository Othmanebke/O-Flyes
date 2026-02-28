FROM node:20-alpine

WORKDIR /app

# Copy generic config
COPY package*.json tsconfig.json ./

# Copy monolith specific config
COPY services/monolith/package*.json ./services/monolith/
COPY services/monolith/tsconfig.json ./services/monolith/

# We need to copy all services since monolith depends on them
COPY services/ ./services/

# Install dependencies in root and in monolith
RUN npm install
WORKDIR /app/services/monolith
RUN npm install

# Build the monolith
RUN npm run build

# Expose the correct port
EXPOSE 3000

CMD ["npm", "start"]
