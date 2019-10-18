const Sequelize = require('sequelize');
const path = require('path');

const root = path.dirname(process.mainModule.filename);
const { infoLogger } = require(path.join(root, 'logger', 'logger.js'));

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  benchmark: true,
  logging: (message, time) => infoLogger.log({
    label: 'mysql',
    level: 'info',
    message: `${message} (${time}ms)`,
  }),
});

module.exports = sequelize;
