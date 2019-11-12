const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');

const root = path.dirname(process.mainModule.filename);
const { User, Article } = require(path.join(root, 'models', 'sequelize'));
const { ArticlesView } = require(path.join(root, 'models', 'mongoose'));
const { USERID_ERR } = require(path.join(root, 'utils', 'error-messages'));
const addPaginationOpts = require(path.join(
  root,
  'utils',
  'add-pagination-opts',
));

const router = express.Router();

/**
 * @route   GET api/v1/users
 * @desc    Get all users
 */

router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    // define query options
    const opts = {
      attributes: {
        include: [
          [
            User.sequelize.fn('COUNT', User.sequelize.col('title')),
            'articlesCount',
          ],
        ],
      },
      include: [
        {
          model: Article,
          as: 'articles',
          attributes: [],
        },
      ],
      group: ['User.id'],
      raw: true,
      nested: true,
    };

    // MySQL operations: find all users, include articlesCount
    let users = await User.findAll(opts);

    // MongoDB operations: add viewsCount for each user
    const allViews = await ArticlesView.find();
    users = users.map((user) => {
      const avs = allViews.filter((doc) => doc.authorId === user.id);
      const viewsCount = avs.length
        ? avs.reduce((sum, doc) => sum + doc.views, 0)
        : 0;
      return { ...user, viewsCount };
    });

    // send response
    res.json({ data: users });
  }),
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get a user by id
 */

router.get(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);

    // MySQL operations: find user by id
    const userById = await User.findByPk(id);
    if (!userById) {
      res.status(404);
      throw new Error(USERID_ERR);
    }

    // send response
    res.json({ data: userById });
  }),
);

/**
 * @route   GET api/v1/users/:id/blog
 * @desc    Find blog records by author's ID
 */

router.get(
  '/:id/blog',
  asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const { after } = req.query;

    // define query options
    const opts = {
      where: { authorId: id },
      include: [{ model: User, as: 'author' }],
      order: [['publishedAt', 'DESC'], ['id', 'DESC']],
      limit: 5,
      raw: true,
      nest: true,
    };

    if (after) addPaginationOpts(opts, after);

    // MySQL operations: find all author's articles
    let articles = await Article.findAll(opts);

    // MongoDB operations: add views to all articles
    const allViews = await ArticlesView.find({ authorId: id });
    articles = articles.map((article) => {
      const av = allViews.find((doc) => doc.articleId === article.id);
      const views = av ? av.views : 0;
      return { ...article, views };
    });

    // send response
    res.json({ data: articles });
  }),
);

module.exports = router;
