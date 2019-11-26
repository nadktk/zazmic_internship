const faker = require('faker');
const mongoose = require('mongoose');

const { User, Article, Comment } = require('../models/sequelize');

exports.registerUser = async () => {
  const user = await User.create({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: 'password',
  });
  user.authCookie = 'test';
  return user;
};

exports.createArticle = async (authorId) => {
  const article = await Article.create({
    title: faker.lorem.word(),
    content: faker.lorem.sentence(),
    publishedAt: Date.now(),
    authorId,
  });
  return article;
};

exports.createComment = async (authorId, articleId) => {
  const comment = await Comment.create({
    content: 'test',
    authorId,
    articleId,
  });
  return comment;
};

exports.mongooseConnection = async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
};
