FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build
EXPOSE 3005
CMD ["npm", "start"]
