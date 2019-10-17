const mongoose = require('mongoose');

const { Schema } = mongoose;

const articlesViewSchema = new Schema({
  articleId: String,
  authorId: String,
  updatedAt: Date,
  createdAt: Date,
  views: Number,
});

articlesViewSchema.pre('save', function () {
  const now = Date.now();
  this.updatedAt = now;
  if (!this.createdAt) this.createdAt = now;
});

articlesViewSchema.pre('updateOne', function () {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model(
  'ArticlesView',
  articlesViewSchema,
  'articles_views',
);
