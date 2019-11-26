const redis = require('redis-mock');

module.exports = jest.fn(() => redis.createClient());
