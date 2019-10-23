/* eslint-disable no-console */
const path = require('path');
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

  // Get all articles views log
  const views = await ArticlesLog.find();

  console.log('views found: ', views.length);

  const articles = new Set(views.map((doc) => doc.meta.articleId));

  console.log('articles found: ', articles.size);

  const newArticlesHistory = [];
  articles.forEach((article) => {
    const viewedAt = [];
    let authorId;
    views.forEach((doc) => {
      if (doc.meta.articleId === article) {
        viewedAt.push(doc.timestamp);
        // if authorId has ever been changed we want to store the last one in articles_history
        authorId = doc.meta.authorId;
      }
    });

    newArticlesHistory.push({
      articleId: article,
      authorId,
      viewedAt,
    });
  });

  console.log('Saving new history...');

  await ArticlesHistory.createCollection();

  const session = await mongoose.startSession();
  session.startTransaction({});
  try {
    await ArticlesHistory.deleteMany({}, { session });
    await ArticlesHistory.create(newArticlesHistory, { session });
    await session.commitTransaction();
    session.endSession();
    process.exit(0);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

updateHistory().catch((err) => {
  console.log(err);
  process.exit(1);
});
