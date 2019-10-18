const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

// logger
const { infoLogger, errorLogger } = require(path.join(
  __dirname,
  'logger',
  'logger.js',
));

// import sequelize instance
const db = require(path.join(__dirname, 'utils', 'database.js'));

// import routers
const blogRoutes = require(path.join(__dirname, 'routes', 'api', 'v1', 'blog'));
const usersRoutes = require(path.join(
  __dirname,
  'routes',
  'api',
  'v1',
  'users',
));

const app = express();

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use routers
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/users', usersRoutes);
app.get('*', (req, res) => {
  https.get(process.env.FRONTEND_URL, (response) => response.pipe(res));
});

// errors handling
app.use((err, req, res, next) => {
  if (res.statusCode === 200) res.status(500);
  errorLogger.log({
    level: 'error',
    message: err.message,
  });
  res.send({
    error: err.message,
  });
});

// set mongoose query logger
mongoose.set('debug', (collectionName, method, query) => {
  infoLogger.log({
    label: 'mongodb',
    level: 'info',
    message: `Executed ${collectionName}.${method}: ${JSON.stringify(query)}`,
  });
});

const port = process.env.PORT;
const mongoUrl = process.env.MONGO_URL;

// connect databases and start server
const startServer = async () => {
  await mongoose
    .connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      replicaSet: 'mentorship-shard-0',
    })
    .catch((err) => {
      throw new Error(`Unable to connect to MongoDB database (${err.message})`);
    });

  infoLogger.log({
    label: 'mongodb',
    level: 'info',
    message: 'Connected to MongoDB',
  });

  await db.authenticate().catch((err) => {
    throw new Error(`Unable to connect to MySQL database (${err.message})`);
  });

  infoLogger.log({
    label: 'mysql',
    level: 'info',
    message: 'Connected to MySQL',
  });

  await app.listen(port);

  infoLogger.log({
    label: 'server',
    level: 'info',
    message: `Server is running on port ${port}`,
  });
};

startServer().catch((err) => {
  errorLogger.log({
    level: 'error',
    message: err.message,
  });
});
