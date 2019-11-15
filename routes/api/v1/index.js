const express = require('express');
const path = require('path');

const root = path.dirname(process.mainModule.filename);

const { apiLimiter } = require(path.join(root, 'limiter', 'limiter.js'));

const authRouter = require(path.join(__dirname, 'auth.js'));
const oauthRouter = require(path.join(__dirname, 'oauth.js'));
const blogRouter = require(path.join(__dirname, 'blog.js'));
const commentsRouter = require(path.join(__dirname, 'comments.js'));
const usersRouter = require(path.join(__dirname, 'users.js'));
const profileRouter = require(path.join(__dirname, 'profile.js'));
const feesRouter = require(path.join(__dirname, 'fees.js'));

const apiRouter = express.Router();

apiRouter.use('/blog', apiLimiter, commentsRouter);
apiRouter.use('/blog', apiLimiter, blogRouter);
apiRouter.use('/users', apiLimiter, usersRouter);
apiRouter.use('/profile', apiLimiter, profileRouter);
apiRouter.use('/oauth', oauthRouter);
apiRouter.use('/fees', feesRouter);
apiRouter.use('/', authRouter);

module.exports = apiRouter;
