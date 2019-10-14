const express = require('express');
const path = require('path');
const asyncHandler = require('express-async-handler');

const root = path.dirname(process.mainModule.filename);
const { userIsValid } = require(path.join(root, 'utils', 'validation.js'));
const { User, Article } = require(path.join(root, 'models'));
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
    const users = await User.findAll({
      attributes: {
        include: [
          [User.sequelize.fn('COUNT', User.sequelize.col('title')), 'articles'],
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
    const { id } = req.params;
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
    const { id } = req.params;
    if (!userIsValid(req.body)) throw new Error(USERDATA_ERR);
    const [updatedRows] = await User.update(req.body, {
      where: { id },
      individualHooks: true,
    });
    if (!updatedRows) throw new Error(USERID_ERR);
    delete req.body.password;
    res.json({ data: req.body });
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
    const newUser = await User.create(req.body);
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
    const { id } = req.params;
    const destroyedRows = await User.destroy({ where: { id } });
    if (!destroyedRows) throw new Error(USERID_ERR);
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
    const { id } = req.params;
    const articles = await Article.findAll({
      where: { authorId: id },
      include: [{ model: User, as: 'author' }],
      order: [['id', 'DESC']],
    });
    res.json({ data: articles });
  }),
);

module.exports = router;
