if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

if (process.env.SENTRY_DSN) {
  require('@sentry/node').init({ dsn: process.env.SENTRY_DSN });
}

require('@primecms/core');
