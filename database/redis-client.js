const Redis = require('ioredis');
const path = require('path');

const root = path.dirname(process.mainModule.filename);
const { errorLogger } = require(path.join(root, 'logger', 'logger.js'));

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('error', (err) => {
  errorLogger.log({
    level: 'error',
    message: `Redis error: ${err.message}`,
    metadata: err,
  });
});

module.exports = redisClient;
