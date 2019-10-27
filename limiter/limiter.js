const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  // limit 200 requests per a minute
  windowMs: 60 * 1000,
  max: 200,
});

const loginLimiter = rateLimit({
  // limit 20 requests per 10 minutes
  windowMs: 10 * 60 * 1000,
  max: 20,
  message:
    'Too many login actions from this IP, please try again after 10 minutes',
});

module.exports = {
  apiLimiter,
  loginLimiter,
};
