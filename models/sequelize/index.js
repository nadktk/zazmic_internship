const path = require('path');

const User = require(path.join(__dirname, 'User'));
const Article = require(path.join(__dirname, 'Article'));
const Account = require(path.join(__dirname, 'Account'));
const Comment = require(path.join(__dirname, 'Comment'));

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
