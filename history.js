/* eslint-disable no-console */
const path = require('path');
const Sequelize = require('sequelize');
const mongoose = require('mongoose');

const { ArticlesHistory, ArticlesLog } = require(path.join(
  __dirname,
  'models',
  'mongoose',
));

// set up result messages
process.on('exit', (code) => (code === 0
  ? console.log('Articles views history was successfully updated')
  : console.log('History update failed, try once again')));

// sequelize new instance
const db = new Sequelize(process.env.DATABASE_URL, {
  logging: false,
});

// connect databases and start server
const updateHistory = async () => {
  console.log('Start updating views history...');

  await mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      replicaSet: 'mentorship-shard-0',
    })
    .catch((err) => {
      throw new Error(`Unable to connect to MongoDB database (${err.message})`);
    });

  console.log('Connected to MongoDB');

  await db.authenticate().catch((err) => {
    throw new Error(`Unable to connect to MySQL database (${err.message})`);
  });

  console.log('Connected to MySQL');

  // Get all existing articles from mysql database
  const articles = await db.query('SELECT * FROM `articles`', {
    type: db.QueryTypes.SELECT,
  });

  console.log('articles found: ', articles.length);

  // Get all articles views log
  const views = await ArticlesLog.find();

  console.log('views found: ', views.length);

  const newArticlesHistory = articles.map((article) => {
    const articleViews = views
      .filter((doc) => doc.message === `Article ${article.id} was viewed`)
      .map((doc) => doc.timestamp);
    return {
      articleId: article.id,
      authorId: article.author_id,
      viewedAt: articleViews,
    };
  });

  console.log('Saving new history...');

  await ArticlesHistory.deleteMany({});
  await ArticlesHistory.create(newArticlesHistory);

  process.exit();
};

updateHistory().catch((err) => {
  console.log(err);
  process.exit(1);
});
