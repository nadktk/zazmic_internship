/* eslint-disable no-shadow */
const winston = require('winston');
require('winston-mongodb');
const path = require('path');

const { format, transports, createLogger } = winston;
const {
  combine, timestamp, printf, colorize,
} = format;

winston.addColors({
  stack: 'gray',
});

const consoleFormat = printf(
  ({
    level, message, label, timestamp, metadata,
  }) => `${timestamp} ${level}: ${
    label ? `[${label}] ` : ''
  }${message}\n${colorize().colorize(
    'stack',
    metadata ? `${metadata}\n` : '',
  )}`,
);

const mongoTransport = (collectionName, opts) => new transports.MongoDB({
  db: process.env.MONGO_URL,
  collection: collectionName,
  ...opts,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

const consoleTransport = new transports.Console({
  format: combine(
    colorize(),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    consoleFormat,
  ),
});

const infoLogger = createLogger({
  transports: [mongoTransport('info_logs'), consoleTransport],
});

const queryLogger = createLogger({
  transports: [mongoTransport('query_logs'), consoleTransport],
});

const historyLogger = createLogger({
  transports: [mongoTransport('articles_logs'), consoleTransport],
});

const errorLogger = createLogger({
  transports: [mongoTransport('error_logs'), consoleTransport],
});

const exRejLogger = (type) => (err) => {
  const title = {
    rejection: 'Unhandled rejection: ',
    exception: 'Uncaught exception: ',
  };
  errorLogger.error(title[type] + err.message, {
    metadata: err.stack,
  });
  errorLogger.end(() => process.exit(1));
};

process.on('unhandledRejection', exRejLogger('rejection'));
process.on('uncaughtException', exRejLogger('exception'));

module.exports = {
  queryLogger,
  infoLogger,
  historyLogger,
  errorLogger,
};
