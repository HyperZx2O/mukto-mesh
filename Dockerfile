FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
COPY client/package*.json client/
RUN npm install && cd server && npm install && cd ../client && npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app /app
RUN mkdir -p uploads
ENV PORT=3000 NODE_ENV=production
EXPOSE 3000
CMD ["node", "server/dist/index.js"]