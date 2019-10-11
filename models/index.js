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

/*
const modelNames = Object.keys(models);

modelNames.forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});
*/
