FROM node:lts-alpine

WORKDIR app

COPY index.js newrelic.js package.json yarn.lock ./

RUN yarn

ENTRYPOINT yarn start

EXPOSE 4000

ENV PORT=4000
ARG DATABASE_URL=postgresql://postgres:password@db:5432/postgres
ARG SESSION_SECRET=keyboard-cat-dart
ARG SENTRY_DSN=
ARG NEW_RELIC_LICENSE_KEY=
