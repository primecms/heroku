require('newrelic');
require('@sentry/node').init({ dsn: process.env.SENTRY_DSN });
require('@primecms/core');
