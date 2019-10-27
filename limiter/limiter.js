const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const path = require('path');

const root = path.dirname(process.mainModule.filename);

const redisClient = require(path.join(root, 'database', 'redis-client.js'));

const apiLimiterStore = new RedisStore({
  prefix: 'nadia:rl:api_limiter',
  client: redisClient,
});

const apiLimiter = rateLimit({
  // limit 200 requests per a minute
  store: apiLimiterStore,
  windowMs: 60 * 1000,
  max: 200,
});

const loginLimiterStore = new RedisStore({
  prefix: 'nadia:rl:login_limiter',
  client: redisClient,
});

const loginLimiter = rateLimit({
  // limit 20 requests per 10 minutes
  store: loginLimiterStore,
  windowMs: 10 * 60 * 1000,
  max: 20,
  message:
    'Too many login actions from this IP, please try again after 10 minutes',
});

module.exports = {
  apiLimiter,
  loginLimiter,
};
