const path = require('path');

const ArticlesView = require(path.join(__dirname, 'ArticlesView.js'));
const ArticlesHistory = require(path.join(__dirname, 'ArticlesHistory.js'));
const ArticlesLog = require(path.join(__dirname, 'ArticlesLog.js'));

module.exports = {
  ArticlesView,
  ArticlesHistory,
  ArticlesLog,
};
