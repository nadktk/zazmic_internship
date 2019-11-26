const clearDatabase = require('./clearDatabase');
const sequelize = require('../database/db-mysql');

module.exports = async () => {
  await sequelize.sync();
  await clearDatabase();
};
