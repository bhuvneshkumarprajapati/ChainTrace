FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm pkg set 'overrides.body-parser=2.4.0' 'dependencies.mongoose=8.24.7' \
    && npm install --package-lock-only --ignore-scripts \
    && npm ci --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --from=dependencies /app/node_modules ./node_modules
COPY src ./src
USER node
EXPOSE 5000
CMD ["node", "src/server.js"]
