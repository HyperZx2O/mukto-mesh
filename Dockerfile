FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
COPY client/package*.json client/
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
COPY client/package*.json client/
RUN npm ci --omit=dev --prefix server && npm ci --omit=dev --prefix client && npm ci --omit=dev
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist client/dist
RUN mkdir -p uploads
ENV PORT=3000 NODE_ENV=production
EXPOSE 3000
CMD ["node", "server/dist/index.js"]