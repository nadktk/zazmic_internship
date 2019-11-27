const Sequelize = require('sequelize');

const { queryLogger } = require('../logger/logger');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  benchmark: true,
  logging: (message, time) => queryLogger.log({
    label: 'mysql',
    level: 'info',
    message: `${message} (${time}ms)`,
  }),
});

module.exports = sequelize;
