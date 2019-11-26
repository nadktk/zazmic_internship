const Redis = require('ioredis');
const { errorLogger } = require('../logger/logger');

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('error', (err) => {
  errorLogger.log({
    level: 'error',
    message: `Redis error: ${err.message}`,
    metadata: err,
  });
});

module.exports = redisClient;
