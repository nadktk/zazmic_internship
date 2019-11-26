const User = require('../sequelize/User');
const Article = require('../sequelize/Article');
const Account = require('../sequelize/Account');
const Comment = require('../sequelize/Comment');

const models = {
  User,
  Article,
  Account,
  Comment,
};

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = models;
