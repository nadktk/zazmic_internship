const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const passport = require('passport');
const csrf = require('csurf');
const session = require('express-session');
const sessionConfig = require('./config/sessionConfig');

const apiRoutes = require('./routes/api/v1');

const { passportInit } = require('./passport');

const swaggerDoc = require('./docs/swagger-config');

// logger
const { errorLogger } = require('./logger/logger');

const app = express();

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('trust proxy', 1);

// session
app.use(session(sessionConfig));

// CSRF
app.use(csrf());
app.all('*', (req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});

// passport
app.use(passport.initialize());
app.use(passport.session());

// use routers
app.use('/api/v1/', apiRoutes);

// swagger docs
swaggerDoc(app);

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
  } else {
    res.send({
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

module.exports = app;
