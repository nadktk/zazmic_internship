const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  benchmark: true,
});

module.exports = sequelize;
