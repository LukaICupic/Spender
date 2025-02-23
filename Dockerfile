FROM node:22-slim

EXPOSE 8080
WORKDIR /usr/src/app
ENV NODE_ENV=production \
    DATABASE_URL=invalid

COPY --chown=node:node ./server/package*.json /usr/src/app
RUN npm ci --omit=dev

COPY --chown=node:node ./server/dist /usr/src/app
COPY --chown=node:node ./server/src/db/migrations /usr/src/app/migrations
COPY --chown=node:node ./client/dist /usr/src/app/public

USER node
CMD ["node", "app.js"]