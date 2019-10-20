const mongoose = require('mongoose');

module.exports = mongoose.model(
  'ArticlesLog',
  {
    message: String,
    timestamp: Date,
  },
  'articles_logs',
);
