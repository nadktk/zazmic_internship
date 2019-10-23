const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const path = require('path');

// logger
const { infoLogger, errorLogger } = require(path.join(
  __dirname,
  'logger',
  'logger.js',
));

// import sequelize instance
const dbMysql = require(path.join(__dirname, 'database', 'db-mysql.js'));
const dbMongo = require(path.join(__dirname, 'database', 'db-mongo.js'));

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
    metadata: `Request URL: ${req.url}`,
    label: 'express',
  });
  res.send({
    error: err.message,
  });
});

const port = process.env.PORT;

// connect databases and start server
const startServer = async () => {
  await dbMongo.connect().catch((err) => {
    throw new Error(`Unable to connect to MongoDB database (${err.message})`);
  });

  await dbMysql.authenticate().catch((err) => {
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
    metadata: err.stack,
  });
  errorLogger.end(() => process.exit(1));
});
