const mongoose = require('mongoose');

const { Schema } = mongoose;

const articlesHistorySchema = new Schema({
  articleId: String,
  authorId: String,
  viewedAt: [Date],
});

module.exports = mongoose.model(
  'ArticlesHistory',
  articlesHistorySchema,
  'articles_history',
);
