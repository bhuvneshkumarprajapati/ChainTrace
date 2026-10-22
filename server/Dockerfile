
FROM node:22-alpine
RUN npm install --global npm@11.21.1

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src

EXPOSE 5000

CMD ["npm", "start"]
