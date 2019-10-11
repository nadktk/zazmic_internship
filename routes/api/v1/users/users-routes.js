const express = require('express');
const { userIsValid } = require('../../../../utils/validation');
const {
  CONNECT_ERR,
  USERID_ERR,
  USERDATA_ERR,
} = require('../../../../utils/error-messages');

const router = express.Router();

const { User, Article } = require('../../../../models');

/**
 * @route   GET api/v1/users
 * @desc    Get all users
 */

router.get('/', async (req, res, next) => {
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
  }).catch(() => next(new Error(CONNECT_ERR)));
  return res.json({ data: users });
});

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get a user by id
 */

router.get('/:id', async (req, res, next) => {
  const userById = await User.findByPk(req.params.id).catch(() => next(new Error(CONNECT_ERR)));
  if (userById) {
    res.json({ data: userById });
  } else {
    res.status(404);
    next(new Error(USERID_ERR));
  }
});

/**
 * @route   PUT api/v1/users/:id
 * @desc    Update a user by ID
 */

router.put('/:id', async (req, res, next) => {
  if (userIsValid(req.body)) {
    await User.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    }).catch(() => next(new Error(CONNECT_ERR)));
    delete req.body.password;
    res.json({ data: req.body });
  }
  next(new Error(USERDATA_ERR));
});

/**
 * @route   POST api/v1/users
 * @desc    Add new user
 */

router.post('/', async (req, res, next) => {
  if (userIsValid(req.body)) {
    const newUser = await User.create(req.body).catch(() => next(new Error(CONNECT_ERR)));
    delete newUser.password;
    res.json({ data: newUser });
  } else next(new Error(USERDATA_ERR));
});

/**
 * @route   DELETE api/v1/users/:id
 * @desc    Delete a user by ID
 */

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  await User.destroy({ where: { id } }).catch(() => next(new Error(CONNECT_ERR)));
  res.send();
});

/**
 * @route   GET api/v1/users/:id/blog
 * @desc    Find blog records by author's ID
 */

router.get('/:id/blog', async (req, res, next) => {
  const { id } = req.params;
  const articles = await Article.findAll({
    where: { authorId: id },
    include: [{ model: User, as: 'author' }],
    order: [['id', 'DESC']],
  }).catch(() => next(new Error(CONNECT_ERR)));
  return res.json({ data: articles });
});

module.exports = router;
