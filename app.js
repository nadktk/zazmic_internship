const path = require('path');
const express = require('express');
const session = require('express-session');
const https = require('https');
const bodyParser = require('body-parser');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);
const passport = require('passport');

const apiRoutes = require(path.join(__dirname, 'routes', 'api', 'v1'));

const { passportInit } = require(path.join(__dirname, 'passport'));

// logger
const { infoLogger, errorLogger } = require(path.join(
  __dirname,
  'logger',
  'logger.js',
));

//  databases
const dbMysql = require(path.join(__dirname, 'database', 'db-mysql.js'));
const dbMongo = require(path.join(__dirname, 'database', 'db-mongo.js'));

// Redis client
const redisClient = new Redis();
redisClient.on('error', (err) => {
  errorLogger.log({
    level: 'error',
    message: `Redis error: ${err.message}`,
    metadata: err,
  });
});

const app = express();

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// session
app.use(
  session({
    store: new RedisStore({ client: redisClient, prefix: 'nadia:' }),
    saveUninitialized: false,
    resave: false,
    secret: process.env.SECRET,
    name: 'sid',
    cookie: {
      maxAge: 48 * 3600 * 1000,
    },
  }),
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// use routers
app.use('/api/v1/', apiRoutes);
app.get('*', (req, res) => {
  https.get(process.env.FRONTEND_URL, (response) => response.pipe(res));
});

passportInit(passport);

// errors handling
app.use((err, req, res, next) => {
  if (res.statusCode === 200) {
    res.status(500).send({
      error: err.message,
    });
  }
  errorLogger.log({
    level: 'error',
    message: err.message,
    metadata: err.stack,
    label: 'express',
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

  app.listen(port, () => {
    infoLogger.log({
      label: 'server',
      level: 'info',
      message: `Server is running on port ${port}`,
    });
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
