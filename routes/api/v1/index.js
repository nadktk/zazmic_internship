const express = require('express');
const path = require('path');

const authRouter = require(path.join(__dirname, 'auth.js'));
const blogRouter = require(path.join(__dirname, 'blog.js'));
const usersRouter = require(path.join(__dirname, 'users.js'));
const profileRouter = require(path.join(__dirname, 'profile.js'));

const apiRouter = express.Router();

apiRouter.use('/blog', blogRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/', authRouter);

module.exports = apiRouter;
