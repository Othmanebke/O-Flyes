FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build
EXPOSE 3008
CMD ["npm", "start"]
