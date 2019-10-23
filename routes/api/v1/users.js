const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');

const root = path.dirname(process.mainModule.filename);
const { infoLogger } = require(path.join(root, 'logger', 'logger.js'));
const { userIsValid } = require(path.join(root, 'utils', 'validation.js'));
const { User, Article } = require(path.join(root, 'models', 'sequelize'));
const { ArticlesView } = require(path.join(root, 'models', 'mongoose'));

const { USERID_ERR, USERDATA_ERR } = require(path.join(
  root,
  'utils',
  'error-messages',
));

const router = express.Router();

/**
 * @route   GET api/v1/users
 * @desc    Get all users
 */

router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    // MySQL operations: find all users, include articlesCount
    let users = await User.findAll({
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
          as: 'article',
          attributes: [],
        },
      ],
      group: ['User.id'],
      raw: true,
      nested: true,
    });

    // MongoDB operations: add viewsCount for each user
    const allViews = await ArticlesView.find();
    users = users.map((user) => {
      const avs = allViews.filter((doc) => doc.authorId === user.id);
      const viewsCount = avs.length
        ? avs.reduce((sum, doc) => sum + doc.views, 0)
        : 0;
      return { ...user, viewsCount };
    });

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

    res.json({ data: userById });
  }),
);

/**
 * @route   PUT api/v1/users/:id
 * @desc    Update a user by ID
 */

router.put(
  '/:id',
  asyncHandler(async (req, res, next) => {
    if (!userIsValid(req.body)) throw new Error(USERDATA_ERR);
    const id = Number(req.params.id);

    // MySQL operations: find user and update
    const [updatedRows] = await User.update(req.body, {
      where: { id },
      individualHooks: true,
    });
    if (!updatedRows) throw new Error(USERID_ERR);
    const updatedUser = await User.findByPk(id);

    // logging success
    infoLogger.log({
      level: 'info',
      message: `User ${id} was successfully updated`,
    });

    res.json({ data: updatedUser });
  }),
);

/**
 * @route   POST api/v1/users
 * @desc    Add new user
 */

router.post(
  '/',
  asyncHandler(async (req, res, next) => {
    if (!userIsValid(req.body)) throw new Error(USERDATA_ERR);

    // MySQL operations: create new user
    const newUser = await User.create(req.body);

    // logging success
    infoLogger.log({
      level: 'info',
      message: `User ${newUser.id} was successfully created`,
    });

    delete newUser.password;
    res.json({ data: newUser });
  }),
);

/**
 * @route   DELETE api/v1/users/:id
 * @desc    Delete a user by ID
 */

router.delete(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);

    // MySQL operations: delete user record
    const destroyedRows = await User.destroy({ where: { id } });
    if (!destroyedRows) throw new Error(USERID_ERR);

    // MongoDB operations: delete docs from articlesviews collection
    await ArticlesView.deleteMany({
      authorId: id,
    });

    // logging success
    infoLogger.log({
      level: 'info',
      message: `User ${id} was successfully deleted`,
    });

    res.send();
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

    // MySQL operations: find all author's articles
    let articles = await Article.findAll({
      where: { authorId: id },
      include: [{ model: User, as: 'author' }],
      order: [['id', 'DESC']],
      raw: true,
      nest: true,
    });

    // MongoDB operations: add views to all articles
    const allViews = await ArticlesView.find({ authorId: id });
    articles = articles.map((article) => {
      const av = allViews.find((doc) => doc.articleId === article.id);
      const views = av ? av.views : 0;
      return { ...article, views };
    });

    res.json({ data: articles });
  }),
);

module.exports = router;
