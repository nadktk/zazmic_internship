const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisClient = require('../database/redis-client');

module.exports = {
  store: new RedisStore({ client: redisClient, prefix: 'nadia:session:' }),
  saveUninitialized: false,
  resave: false,
  secret: process.env.SECRET,
  name: 'sid',
  cookie: {
    maxAge: 48 * 3600 * 1000,
  },
};
