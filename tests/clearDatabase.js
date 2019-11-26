/* eslint-disable */
const mongoose = require('mongoose');
const { Article, User } = require('../models/sequelize');
const { ArticlesView } = require('../models/mongoose');

module.exports = async () => {
  for (model of [Article, User]) {
    await model.destroy({
      where: {},
      truncate: { cascade: true },
    });
  }
  await mongoose.connect(process.env.MONGO_URL);
  await ArticlesView.deleteMany({}).exec();
};
