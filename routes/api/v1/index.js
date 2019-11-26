const express = require('express');

const { apiLimiter } = require('../../../limiter/limiter');

const authRouter = require('./auth');
const oauthRouter = require('./oauth');
const blogRouter = require('./blog');
const commentsRouter = require('./comments');
const usersRouter = require('./users');
const profileRouter = require('./profile');
const feesRouter = require('./fees');

const apiRouter = express.Router();

apiRouter.use('/blog', apiLimiter, commentsRouter);
apiRouter.use('/blog', apiLimiter, blogRouter);
apiRouter.use('/users', apiLimiter, usersRouter);
apiRouter.use('/profile', apiLimiter, profileRouter);
apiRouter.use('/oauth', oauthRouter);
apiRouter.use('/fees', feesRouter);
apiRouter.use('/', authRouter);

module.exports = apiRouter;
