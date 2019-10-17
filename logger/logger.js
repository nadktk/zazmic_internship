const winston = require('winston');
require('winston-mongodb');

const { format, transports, createLogger } = winston;
const dbString = process.env.MongoDB;

const mongooseLogger = createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs.log' }),
  ],
});
