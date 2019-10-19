const path = require('path');

const User = require(path.join(__dirname, 'User'));
const Article = require(path.join(__dirname, 'Article'));

const models = {
  User,
  Article,
};

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = models;
