const mongoose = require('mongoose');

module.exports = mongoose.model(
  'ArticlesLog',
  {
    message: String,
    timestamp: Date,
    meta: {
      authorId: Number,
      articleId: Number,
    },
  },
  'articles_logs',
);
