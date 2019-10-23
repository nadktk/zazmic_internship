const mongoose = require('mongoose');

const { Schema } = mongoose;

const articlesViewSchema = new Schema({
  articleId: Number,
  authorId: Number,
  updatedAt: Date,
  createdAt: Date,
  views: Number,
});

articlesViewSchema.pre('save', function (next) {
  const now = Date.now();
  this.updatedAt = now;
  if (!this.createdAt) this.createdAt = now;
  next();
});

articlesViewSchema.pre('updateOne', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model(
  'ArticlesView',
  articlesViewSchema,
  'articles_views',
);
