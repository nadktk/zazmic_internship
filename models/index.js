const User = require('./User');
const Article = require('./Article');

const models = {
  User,
  Article,
};

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = models;
