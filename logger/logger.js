const winston = require('winston');
require('winston-mongodb');
const path = require('path');

const root = path.dirname(process.mainModule.filename);

const { format, transports, createLogger } = winston;
const { combine, timestamp, printf } = format;

// log destination files
const logsFile = path.join(root, 'logs', 'server-info.log');
const errorsFile = path.join(root, 'logs', 'server-errors.log');

const myFormat = printf(
  ({
    level, message, label, timest,
  }) => `${timest} ${level}: ${label ? `[${label}] ` : ''}${message}`,
);

const infoLogger = createLogger({
  format: combine(timestamp(), myFormat),
  level: 'info',
  transports: [
    new transports.MongoDB({
      db: process.env.MONGO_URL,
      collection: 'mongoose_logs',
      decolorize: true,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    }),
    new transports.File({ filename: logsFile }),
  ],
});

const errorLogger = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [
    new transports.MongoDB({
      db: process.env.MONGO_URL,
      collection: 'error_logs',
      decolorize: true,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    }),
    new transports.Console({ json: false, colorize: true }),
    new transports.File({ filename: errorsFile }),
  ],
  exceptionHandlers: [new transports.File({ filename: errorsFile })],
});

const rejectionLogger = (err) => {
  errorLogger.log({
    level: 'error',
    label: 'Uncaught rejection',
    message: err,
  });
};

process.on('unhandledRejection', rejectionLogger);

module.exports = {
  infoLogger,
  errorLogger,
};
