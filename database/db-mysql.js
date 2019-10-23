const Sequelize = require('sequelize');
const path = require('path');

const root = path.dirname(process.mainModule.filename);
const { queryLogger } = require(path.join(root, 'logger', 'logger.js'));

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  benchmark: true,
  logging: (message, time) => queryLogger.log({
    label: 'mysql',
    level: 'info',
    message: `${message} (${time}ms)`,
  }),
});

module.exports = sequelize;
